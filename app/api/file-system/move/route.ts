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
                await executeQuery(
                    'UPDATE OS_ARCHIVOS SET CF_IDCARPETA_FK = ?, AF_FECHA_ACTUALIZACION = CURRENT_TIMESTAMP WHERE AF_IDARCHIVO_PK = ?',
                    [targetFolderId, id]
                );
            } else if (type === 'folder') {
                // Evitar mover una carpeta a sí misma o a un descendiente (chequeo básico)
                if (targetFolderId === id) continue;

                await executeQuery(
                    'UPDATE OS_CARPETAS SET CF_IDCARPETA_PADRE_FK = ?, CF_FECHA_ACTUALIZACION = CURRENT_TIMESTAMP WHERE CF_IDCARPETA_PK = ?',
                    [targetFolderId, id]
                );

                // Nota: En una implementación completa, se debería actualizar la ruta (CF_RUTA) 
                // de la carpeta y todos sus hijos recursivamente.
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error moving items:', error);
        return NextResponse.json({ error: 'Error al mover elementos' }, { status: 500 });
    }
}
