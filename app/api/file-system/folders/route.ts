import { NextResponse } from 'next/server';
import { FolderService } from '@/lib/file-system/services';
import { CreateFolderData } from '@/lib/file-system/types';

const folderService = new FolderService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent_id');
    
    const folders = parentId 
      ? await folderService.obtenerPorPadre(parseInt(parentId))
      : await folderService.obtenerTodas();
    
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error al obtener carpetas:', error);
    return NextResponse.json(
      { error: 'Error al obtener carpetas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, parent_id, description } = body as CreateFolderData;
    
    if (!name) {
      return NextResponse.json(
        { error: 'El nombre de la carpeta es requerido' },
        { status: 400 }
      );
    }

    // TODO: Obtener userId del token de autenticación
    const userId = 1; // Temporal
    
    const folderId = await folderService.crear(
      { name, parent_id: parent_id || null, description },
      userId
    );
    
    return NextResponse.json({ success: true, id: folderId });
  } catch (error) {
    console.error('Error al crear carpeta:', error);
    return NextResponse.json(
      { error: 'Error al crear carpeta' },
      { status: 500 }
    );
  }
}
