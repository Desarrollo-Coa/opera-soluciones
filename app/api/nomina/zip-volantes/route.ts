import { NextRequest, NextResponse } from 'next/server';
import archiver from 'archiver';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { getLiquidacionesFullData } from '@/actions/nomina/liquidacion-actions';
import { VolantePDF } from '@/components/nomina/volante-pdf';
import path from 'path';
import { PassThrough, Readable } from 'node:stream';
import fs from 'fs';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/**
 * API Route para descargar todos los volantes de un periodo en un archivo ZIP.
 * Genera PDFs individuales usando @react-pdf/renderer y los empaqueta con archiver.
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mes = parseInt(searchParams.get('mes') || '');
    const anio = parseInt(searchParams.get('anio') || '');
    const quincena = parseInt(searchParams.get('quincena') || '');

    if (isNaN(mes) || isNaN(anio) || isNaN(quincena)) {
        return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
    }

    // 1. Obtener la data completa (maestra + detalles) para todos los empleados del periodo
    const res = await getLiquidacionesFullData(mes, anio, quincena);
    if (!res.success || !res.data) {
        return NextResponse.json({ error: res.message || 'Error al obtener datos' }, { status: 500 });
    }

    const liquidaciones = res.data;
    if (liquidaciones.length === 0) {
        return NextResponse.json({ error: 'No hay liquidaciones en este periodo' }, { status: 404 });
    }

    // 2. Preparar el stream de respuesta usando PassThrough y archiver
    const passthrough = new PassThrough();
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Pipe del archiver al passthrough que será el cuerpo de la Response
    archive.pipe(passthrough);

    // Ruta absoluta del logo para que @react-pdf lo encuentre en el servidor
    const logoPath = path.join(process.cwd(), 'public', 'recursos', 'logopera.png');
    let logoData: Buffer | string = "/recursos/logopera.png";

    try {
        if (fs.existsSync(logoPath)) {
            logoData = fs.readFileSync(logoPath);
        }
    } catch (err) {
        console.error('Error leyendo logo para PDF:', err);
    }

    // 3. Generar PDFs y agregarlos al ZIP de forma asíncrona
    (async () => {
        try {
            for (const liq of liquidaciones) {
                // Inyectamos el Buffer del logo
                const liqWithLogo = { ...liq, logoUrl: logoData };

                // Renderizar el componente React PDF a Buffer
                // Usamos React.createElement para el componente VolantePDF
                const pdfBuffer = await renderToBuffer(React.createElement(VolantePDF, { data: liqWithLogo }) as any);

                // Nombre de archivo IGUALITO al de la descarga individual (volante-pago.tsx)
                // Volante - [Nombre] [Apellido] - [MES] - [QUINCENA] QUINCENA.pdf
                const mesNombre = MESES[liq.periodo_mes - 1].toUpperCase();
                const quincenaNombre = liq.quincena === 1 ? 'PRIMERA' : 'SEGUNDA';

                const fileName = `Volante - ${liq.document_number} - ${liq.first_name} ${liq.last_name} - ${mesNombre} - ${quincenaNombre} QUINCENA.pdf`;

                archive.append(pdfBuffer, { name: fileName });
            }

            // Finalizar el archivo ZIP una vez agregados todos los PDFs
            await archive.finalize();
        } catch (err: any) {
            console.error('Error generando ZIP de volantes:', err);
            passthrough.destroy(err);
        }
    })();

    // 4. Retornar la respuesta con los headers correctos para descarga de archivo
    // Usamos Readable.toWeb para compatibilidad nativa con Web Streams en Next.js 15
    return new Response(Readable.toWeb(passthrough) as any, {
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="VOLANTES_${MESES[mes - 1].toUpperCase()}_${anio}_Q${quincena}.zip"`,
        },
    });
}
