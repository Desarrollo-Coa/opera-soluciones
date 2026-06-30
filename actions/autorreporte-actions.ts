'use server';

import { executeQuery } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { AutorreporteService } from '@/lib/autorreporte/services/autorreporte.service';
import { TipoAutorreporte } from '@/types/autorreporte';
import { uploadToSpaces, deleteFromSpaces, extractKeyFromUrl } from '@/lib/digitalocean-spaces';
import { RowDataPacket } from 'mysql2/promise';

// =====================================================
// SGI Opera Soluciones - Autorreporte Actions
// =====================================================

export async function loginAutorreporte(cedula: string, password: string) {
    try {
        const query = 'SELECT US_IDUSUARIO_PK as id, US_NOMBRE as first_name, US_APELLIDO as last_name, US_PASSWORD_HASH as password_hash FROM OS_USUARIOS WHERE US_NUMERO_DOCUMENTO = ? AND US_ACTIVO = 1';
        const users = await executeQuery(query, [cedula]) as RowDataPacket[];

        if (users.length === 0) {
            return { success: false, message: 'Credenciales inválidas o usuario inactivo' };
        }

        const user = users[0];
        // El usuario indicó que en el kiosko no se usa la clave real, sino la misma cédula
        if (password !== cedula) {
            return { success: false, message: 'La contraseña debe ser tu número de cédula' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name
            }
        };
    } catch (error) {
        console.error('[Autorreporte Actions] Error en login:', error);
        return { success: false, message: 'Error interno del servidor' };
    }
}

export async function registrarAutorreporteAction(
    userId: number,
    tipo: TipoAutorreporte,
    fotoBase64?: string,
    respuestas?: { preguntaId: number; valor: string }[],
    lat?: number | null,
    lng?: number | null
) {
    try {
        let fotoUrl: string | null = null;

        if (fotoBase64 && (tipo === 'INICIO' || tipo === 'FIN')) {
            // Convert base64 to buffer
            const base64Data = fotoBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `autorreporte_${userId}_${Date.now()}.jpg`;
            
            // Upload to DO Spaces
            const uploadResult = await uploadToSpaces(buffer, fileName, 'image/jpeg', 'autorreportes');
            fotoUrl = uploadResult.url;
        }

        await AutorreporteService.registrarReporte(userId, tipo, fotoUrl, respuestas, lat, lng);

        return { success: true, message: 'Reporte registrado exitosamente' };
    } catch (error: any) {
        console.error('[Autorreporte Actions] Error al registrar:', error);
        return { success: false, message: error.message || 'Error al registrar el reporte' };
    }
}

export async function getSeguimientoDiarioAction(fecha: string) {
    try {
        // Validación básica de fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return { success: false, message: 'Formato de fecha inválido' };
        }

        const data = await AutorreporteService.obtenerSeguimientoDiario(fecha);
        return { success: true, data };
    } catch (error) {
        console.error('[Autorreporte Actions] Error al obtener seguimiento:', error);
        return { success: false, message: 'Error al obtener datos' };
    }
}

export async function eliminarAutorreporteAction(idReporte: number) {
    try {
        const fotoUrl = await AutorreporteService.eliminarReporte(idReporte);
        
        // Si había foto, la borramos del bucket
        if (fotoUrl) {
            const key = extractKeyFromUrl(fotoUrl);
            if (key) {
                await deleteFromSpaces(key);
            }
        }

        return { success: true, message: 'Reporte eliminado exitosamente' };
    } catch (error: any) {
        console.error('[Autorreporte Actions] Error al eliminar reporte:', error);
        return { success: false, message: error.message || 'Error al eliminar el reporte' };
    }
}

export async function getPreguntasAutorreporteAction() {
    try {
        const queryPreguntas = `SELECT PA_IDPREGUNTA_PK as id, PA_TEXTO as texto, PA_TIPO as tipo, PA_SECCION as seccion, PA_OBLIGATORIA as obligatoria FROM OS_PREGUNTAS_AUTORREPORTE WHERE PA_ACTIVO = 1 ORDER BY PA_ORDEN ASC`;
        const preguntas = await executeQuery(queryPreguntas) as any[];

        const queryOpciones = `SELECT PA_IDPREGUNTA_FK as pregunta_id, OP_TEXTO as texto, OP_VALOR as valor FROM OS_OPCIONES_PREGUNTA WHERE OP_ACTIVO = 1 ORDER BY OP_ORDEN ASC`;
        const opciones = await executeQuery(queryOpciones) as any[];

        const preguntasConOpciones = preguntas.map(p => ({
            ...p,
            obligatoria: Boolean(p.obligatoria),
            opciones: opciones.filter(o => o.pregunta_id === p.id)
        }));

        return { success: true, data: preguntasConOpciones };
    } catch (error) {
        console.error('[Autorreporte Actions] Error al obtener preguntas:', error);
        return { success: false, message: 'Error al cargar formulario' };
    }
}

export async function verificarDisponibilidadReporteAction(userId: number, tipo: TipoAutorreporte) {
    try {
        // Obtenemos la fecha de Colombia igual que en el servicio
        const tzOffset = -5 * 60;
        const localDate = new Date(Date.now() + tzOffset * 60 * 1000);
        const fechaRegistro = localDate.toISOString().split('T')[0];

        const query = `SELECT AR_IDAUTORREPORTE_PK FROM OS_AUTORREPORTES WHERE US_IDUSUARIO_FK = ? AND AR_TIPO = ? AND AR_FECHA_REGISTRO = ? AND AR_ACTIVO = 1`;
        const rows = await executeQuery(query, [userId, tipo, fechaRegistro]) as any[];

        if (rows.length > 0) {
            return { disponible: false, message: `Ya registraste tu ${tipo.toLowerCase()} el día de hoy.` };
        }
        return { disponible: true };
    } catch (error) {
        console.error('[Autorreporte Actions] Error validando disponibilidad:', error);
        return { disponible: false, message: 'Error de validación.' };
    }
}
