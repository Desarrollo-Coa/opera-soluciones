'use server';

import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function fetchAsBase64(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'SGI-Opera-Soluciones/1.0 (Contact: dev@operasoluciones.com)',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        });
        if (!res.ok) return null;
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mime = res.headers.get('content-type') || 'image/jpeg';
        return `data:${mime};base64,${buffer.toString('base64')}`;
    } catch (e) {
        return null;
    }
}

async function getAddressFromCoords(lat: number, lng: number): Promise<string> {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=17&addressdetails=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'SGI-Opera-Soluciones/1.0' } });
        if (!res.ok) return 'Ubicación registrada';
        const data = await res.json();
        // Construir dirección resumida (camino, barrio, ciudad)
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || '';
        const houseNumber = addr.house_number || '';
        const suburb = addr.suburb || addr.neighbourhood || '';
        const city = addr.city || addr.town || addr.village || '';
        
        const partes = [road, houseNumber, suburb, city].filter(Boolean);
        return partes.length > 0 ? partes.join(', ') : 'Ubicación registrada';
    } catch (e) {
        return 'Ubicación registrada';
    }
}

export async function getReporteCompletoPDFAction(fecha: string) {
    try {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return { success: false, message: 'Formato de fecha inválido' };
        }

        // Obtener todos los reportes de ese día
        const queryReportes = `
            SELECT 
                r.AR_IDAUTORREPORTE_PK as id,
                u.US_NOMBRE as first_name,
                u.US_APELLIDO as last_name,
                u.US_NUMERO_DOCUMENTO as document_number,
                r.AR_TIPO as tipo,
                r.AR_FECHA_HORA as hora,
                r.AR_URL_FOTO as foto,
                r.AR_LATITUD as lat,
                r.AR_LONGITUD as lng
            FROM OS_AUTORREPORTES r
            JOIN OS_USUARIOS u ON r.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
            WHERE r.AR_FECHA_REGISTRO = ? AND r.AR_ACTIVO = 1
            ORDER BY u.US_NOMBRE ASC, r.AR_FECHA_HORA ASC
        `;
        const reportes = await executeQuery(queryReportes, [fecha]) as RowDataPacket[];

        if (reportes.length === 0) {
            return { success: true, data: [] };
        }

        const ids = reportes.map(r => r.id);
        
        let respuestas: any[] = [];
        if (ids.length > 0) {
            const placeholders = ids.map(() => '?').join(',');
            const queryRespuestas = `
                SELECT 
                    res.AR_IDAUTORREPORTE_FK as reporte_id,
                    p.PA_TEXTO as pregunta,
                    res.RA_VALOR as valor
                FROM OS_RESPUESTAS_AUTORREPORTE res
                JOIN OS_PREGUNTAS_AUTORREPORTE p ON res.PA_IDPREGUNTA_FK = p.PA_IDPREGUNTA_PK
                WHERE res.AR_IDAUTORREPORTE_FK IN (${placeholders})
            `;
            respuestas = await executeQuery(queryRespuestas, ids) as RowDataPacket[];
        }

        // Agrupar por empleado y procesar base64
        const empleadosMap = new Map();
        for (const r of reportes) {
            const key = r.document_number;
            if (!empleadosMap.has(key)) {
                empleadosMap.set(key, {
                    nombre: `${r.first_name} ${r.last_name}`,
                    documento: key,
                    registros: []
                });
            }
            const emp = empleadosMap.get(key);
            
            const misRespuestas = respuestas.filter(res => res.reporte_id === r.id).map(res => {
                let valorFormateado = res.valor;
                if (valorFormateado === 'true') valorFormateado = 'Sí';
                if (valorFormateado === 'false') valorFormateado = 'No';
                return { pregunta: res.pregunta, valor: valorFormateado };
            });

            let fotoBase64 = null;
            if (r.foto) {
                fotoBase64 = await fetchAsBase64(r.foto);
            }

            let mapaBase64 = null;
            let direccionText = null;
            if (r.lat && r.lng) {
                const mapUrl = `https://maps.wikimedia.org/img/osm-intl,16,${r.lat},${r.lng},600x350.png`;
                mapaBase64 = await fetchAsBase64(mapUrl);
                direccionText = await getAddressFromCoords(r.lat, r.lng);
            }

            emp.registros.push({
                tipo: r.tipo,
                hora: r.hora,
                foto: fotoBase64,
                mapa: mapaBase64,
                direccion: direccionText,
                lat: r.lat,
                lng: r.lng,
                respuestas: misRespuestas
            });
        }

        let logoBase64 = null;
        try {
            const logoPath = path.join(process.cwd(), 'public', 'recursos', 'logopera.png');
            const logoBuffer = fs.readFileSync(logoPath);
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        } catch (e) {
            console.error('No se pudo leer el logo', e);
        }

        return {
            success: true,
            data: Array.from(empleadosMap.values()),
            logo: logoBase64
        };
    } catch (error: any) {
        console.error('[PDF Actions] Error al obtener datos para PDF:', error);
        return { success: false, message: error.message };
    }
}
