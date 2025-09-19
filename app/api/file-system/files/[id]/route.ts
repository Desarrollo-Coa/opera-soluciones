import { NextResponse, NextRequest } from 'next/server';
import { FileService } from '@/lib/file-system/services';
import { verifyUserPassword, getUserIdFromToken } from '@/lib/auth/password-verifier';

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
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const fileId = parseInt(id);
    
    // Obtener ID del usuario desde el token
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Token de autenticación inválido' },
        { status: 401 }
      );
    }

    // Obtener contraseña del body
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Contraseña requerida para eliminar' },
        { status: 400 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await verifyUserPassword(userId, password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      );
    }
    
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
