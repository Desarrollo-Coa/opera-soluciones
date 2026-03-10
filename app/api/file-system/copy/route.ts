import { NextResponse, NextRequest } from 'next/server';
import { executeQuery } from '@/lib/db';
import { getUserIdFromToken } from '@/lib/auth/password-verifier';

export async function POST(request: NextRequest) {
    try {
        const userId = getUserIdFromToken(request);
        if (!userId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { itemIds, targetFolderId } = await request.json();

        if (!Array.isArray(itemIds)) {
            return NextResponse.json({ error: 'itemIds debe ser un array' }, { status: 400 });
        }

        for (const itemId of itemIds) {
            const parts = itemId.split('-');
            if (parts.length < 2) continue;

            const type = parts[0];
            const id = parseInt(parts[1]);

            if (type === 'file') {
                // Clonar el archivo en la base de datos (mismo path físico por ahora, nuevo registro)
                await executeQuery(
                    `INSERT INTO OS_ARCHIVOS 
           (AF_NOMBRE, AF_NOMBRE_ORIGINAL, CF_IDCARPETA_FK, AF_RUTA_ARCHIVO, AF_URL_ARCHIVO, AF_TAMANO, AF_TIPO_MIME, AF_EXTENSION, AF_DESCRIPCION, AF_CREADO_POR)
           SELECT 
             CONCAT('Copia de ', AF_NOMBRE), 
             AF_NOMBRE_ORIGINAL, 
             ?, 
             AF_RUTA_ARCHIVO, 
             AF_URL_ARCHIVO, 
             AF_TAMANO, 
             AF_TIPO_MIME, 
             AF_EXTENSION, 
             AF_DESCRIPCION, 
             ?
           FROM OS_ARCHIVOS 
           WHERE AF_IDARCHIVO_PK = ?`,
                    [targetFolderId, userId, id]
                );
            }
            // Nota: La copia recursiva de carpetas es una operación compleja que requiere 
            // lógica de árbol en el servicio. Se omite para este MVP de interactividad.
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error copying items:', error);
        return NextResponse.json({ error: 'Error al copiar elementos' }, { status: 500 });
    }
}
