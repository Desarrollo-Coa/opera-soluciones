import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
    pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
} else if (pdfFonts && (pdfFonts as any).vfs) {
    pdfMake.vfs = (pdfFonts as any).vfs;
}

export async function generarReportePDF(fecha: string, empleadosData: any[], logoBase64?: string | null) {
    const docDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 50, 40, 40],
        header: (currentPage: number, pageCount: number) => {
            if (logoBase64) {
                return {
                    image: logoBase64,
                    width: 100,
                    alignment: 'right',
                    margin: [0, 15, 40, 0]
                };
            }
            return null;
        },
        info: {
            title: `Reporte de Seguimiento - ${fecha}`,
            author: 'SGI Opera Soluciones'
        },
        styles: {
            title: { fontSize: 18, bold: true, color: '#202124', margin: [0, 0, 0, 2] },
            subtitle: { fontSize: 11, color: '#5f6368', margin: [0, 0, 0, 15] },
            sectionHeader: { fontSize: 12, bold: true, color: '#1a73e8', margin: [0, 10, 0, 5] },
            sectionHeaderDark: { fontSize: 12, bold: true, color: '#202124', margin: [0, 20, 0, 10] },
            label: { fontSize: 10, bold: true, color: '#3c4043', margin: [0, 2, 0, 4], alignment: 'center' },
            caption: { fontSize: 8, color: '#5f6368', alignment: 'center', margin: [0, 4, 0, 10] },
            tableHeader: { fontSize: 10, bold: true, color: '#5f6368', fillColor: '#f8f9fa', margin: [0, 6, 0, 6] },
            placeholder: { fontSize: 10, color: '#9aa0a6', italic: true, alignment: 'center', margin: [0, 20, 0, 20] },
            card: {
                // Estilo visual para dar impresión de contenedor
                fillColor: '#ffffff',
                margin: [0, 0, 0, 0]
            }
        },
        defaultStyle: {
            font: 'Roboto'
        },
        content: []
    };

    if (empleadosData.length === 0) {
        docDefinition.content.push({ text: 'No hay registros para este día.', alignment: 'center', margin: [0, 50, 0, 0] });
        pdfMake.createPdf(docDefinition).download(`Reporte_${fecha}.pdf`);
        return;
    }

    let isFirstPage = true;
    const listaDescansos: any[] = [];

    for (const emp of empleadosData) {
        const inicio = emp.registros.find((r: any) => r.tipo === 'INICIO');
        const descanso = emp.registros.find((r: any) => r.tipo === 'DESCANSO');
        const fin = emp.registros.find((r: any) => r.tipo === 'FIN');

        if (descanso) {
            listaDescansos.push({ nombre: emp.nombre, documento: emp.documento, hora: descanso.hora });
        }

        if (!inicio && !fin) continue;

        const pageContent: any[] = [];

        // ENCABEZADO (Estilo Material)
        pageContent.push({ text: `${emp.nombre}`, style: 'title', pageBreak: isFirstPage ? undefined : 'before' });
        pageContent.push({ text: `Documento: ${emp.documento}   |   Fecha: ${format(new Date(fecha + 'T12:00:00'), "dd 'de' MMMM yyyy", { locale: es })}`, style: 'subtitle' });
        pageContent.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e8eaed' }], margin: [0, 0, 0, 20] });
        isFirstPage = false;

        // 1. GALERÍA VISUAL (Inicio vs Fin lado a lado)
        const renderColumnaVisual = (reg: any, titulo: string) => {
            const stack = [];
            
            if (!reg) {
                stack.push({ text: titulo, style: 'sectionHeader', alignment: 'center' });
                stack.push({ text: 'Sin reporte en esta franja', style: 'placeholder' });
                return stack;
            }

            stack.push({ text: `${titulo} (${format(new Date(reg.hora), 'HH:mm')})`, style: 'sectionHeader', alignment: 'center' });
            
            // Foto
            if (reg.foto) {
                stack.push({ image: reg.foto, fit: [230, 160], alignment: 'center', margin: [0, 5, 0, 5] });
            } else {
                stack.push({ text: '[ Sin fotografía selfie ]', style: 'placeholder' });
            }

            // Mapa
            if (reg.mapa) {
                stack.push({
                    stack: [
                        { image: reg.mapa, fit: [230, 160], alignment: 'center' },
                        { 
                            svg: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ea4335" stroke="#ffffff" stroke-width="1"/></svg>',
                            width: 24,
                            alignment: 'center',
                            margin: [0, -86, 0, 86] // Posiciona el pin exactamente en el centro del mapa
                        }
                    ],
                    margin: [0, 5, 0, 0]
                });
                if (reg.direccion) {
                    stack.push({ text: reg.direccion, style: 'caption' });
                }
            } else {
                stack.push({ text: '[ Sin ubicación satelital ]', style: 'placeholder' });
            }

            return stack;
        };

        pageContent.push({
            columns: [
                { width: '50%', stack: renderColumnaVisual(inicio, 'Inicio de Labores'), padding: [0, 0, 10, 0] },
                { width: '50%', stack: renderColumnaVisual(fin, 'Fin de Labores'), padding: [10, 0, 0, 0] }
            ]
        });

        // 2. DATOS DE VALIDACIÓN (Abajo, para no romper el flujo de las imágenes)
        if (inicio && inicio.respuestas && inicio.respuestas.length > 0) {
            pageContent.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#f1f3f4' }], margin: [0, 15, 0, 0] });
            pageContent.push({ text: 'Cuestionario de Ingreso y Políticas', style: 'sectionHeaderDark' });
            
            const tableBody = [];
            tableBody.push([
                { text: 'Pregunta', style: 'tableHeader' },
                { text: 'Respuesta', style: 'tableHeader', alignment: 'center' }
            ]);
            
            for (const res of inicio.respuestas) {
                tableBody.push([
                    { text: res.pregunta, fontSize: 10, color: '#3c4043', margin: [0, 6, 0, 6] },
                    { text: res.valor, fontSize: 10, bold: true, color: '#202124', alignment: 'center', margin: [0, 6, 0, 6] }
                ]);
            }

            pageContent.push({
                table: {
                    headerRows: 1,
                    widths: ['80%', '20%'],
                    body: tableBody
                },
                layout: {
                    hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 1,
                    vLineWidth: () => 0,
                    hLineColor: () => '#e8eaed',
                    paddingLeft: () => 5,
                    paddingRight: () => 5,
                    paddingTop: () => 3,
                    paddingBottom: () => 3
                }
            });
        }

        docDefinition.content.push(...pageContent);
    }

    // HOJA FINAL DE DESCANSOS
    if (listaDescansos.length > 0) {
        const tablaDescansosBody = [];
        tablaDescansosBody.push([
            { text: 'Empleado', style: 'tableHeader' },
            { text: 'Documento', style: 'tableHeader', alignment: 'center' }
        ]);

        for (const desc of listaDescansos) {
            tablaDescansosBody.push([
                { text: desc.nombre, fontSize: 10, margin: [0, 6, 0, 6] },
                { text: desc.documento, fontSize: 10, alignment: 'center', margin: [0, 6, 0, 6] }
            ]);
        }

        docDefinition.content.push({
            text: 'Registro General de Descansos',
            style: 'title',
            pageBreak: isFirstPage ? undefined : 'before',
            margin: [0, 0, 0, 5]
        });
        
        docDefinition.content.push({ text: `Fecha: ${format(new Date(fecha + 'T12:00:00'), "dd 'de' MMMM yyyy", { locale: es })}`, style: 'subtitle', margin: [0, 0, 0, 20] });

        docDefinition.content.push({
            table: {
                headerRows: 1,
                widths: ['*', '30%'],
                body: tablaDescansosBody
            },
            layout: {
                hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 0 : 1,
                vLineWidth: () => 0,
                hLineColor: () => '#e8eaed',
                paddingLeft: () => 5,
                paddingRight: () => 5,
                paddingTop: () => 3,
                paddingBottom: () => 3
            }
        });
    }

    if (docDefinition.content.length === 0) {
        docDefinition.content.push({ text: 'No hay reportes de entrada/salida para este día.', alignment: 'center', margin: [0, 50, 0, 0] });
    }

    pdfMake.createPdf(docDefinition).download(`Reporte_Diario_${fecha}.pdf`);
}
