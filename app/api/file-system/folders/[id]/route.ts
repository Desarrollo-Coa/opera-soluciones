import { NextResponse } from 'next/server';
import { FolderService } from '@/lib/file-system/services';
import { CreateFolderData } from '@/lib/file-system/types';

const folderService = new FolderService();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const folderId = parseInt(id);
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'breadcrumbs') {
      const breadcrumbs = await folderService.obtenerBreadcrumbs(folderId);
      return NextResponse.json(breadcrumbs);
    }
    
    const folder = await folderService.obtenerPorId(folderId);
    
    if (!folder) {
      return NextResponse.json(
        { error: 'Carpeta no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error al obtener carpeta:', error);
    return NextResponse.json(
      { error: 'Error al obtener carpeta' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const folderId = parseInt(id);
    const body = await request.json();
    const { name, description } = body as Partial<CreateFolderData>;
    
    await folderService.actualizar(folderId, { name, description });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar carpeta:', error);
    return NextResponse.json(
      { error: 'Error al actualizar carpeta' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const folderId = parseInt(id);
    
    await folderService.eliminar(folderId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar carpeta:', error);
    return NextResponse.json(
      { error: 'Error al eliminar carpeta' },
      { status: 500 }
    );
  }
}
