import { NextResponse } from 'next/server';
import { FileService } from '@/lib/file-system/services';

const fileService = new FileService();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const fileId = parseInt(id);
    
    const file = await fileService.obtenerPorId(fileId);
    
    if (!file) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(file);
  } catch (error) {
    console.error('Error al obtener archivo:', error);
    return NextResponse.json(
      { error: 'Error al obtener archivo' },
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
    const fileId = parseInt(id);
    const body = await request.json();
    const { name, description } = body;
    
    await fileService.actualizar(fileId, { name, description });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    return NextResponse.json(
      { error: 'Error al actualizar archivo' },
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
    const fileId = parseInt(id);
    
    await fileService.eliminar(fileId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return NextResponse.json(
      { error: 'Error al eliminar archivo' },
      { status: 500 }
    );
  }
}
