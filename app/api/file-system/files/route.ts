import { NextResponse } from 'next/server';
import { FileService } from '@/lib/file-system/services';

const fileService = new FileService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folder_id');
    const search = searchParams.get('search');

    let files;
    const parsedFolderId = folderId && folderId !== 'null' ? parseInt(folderId) : null;

    if (search) {
      files = await fileService.buscar(search, parsedFolderId);
    } else {
      files = await fileService.obtenerPorCarpeta(parsedFolderId);
    }

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return NextResponse.json(
      { error: 'Error al obtener archivos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folder_id') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    // TODO: Obtener userId del token de autenticación
    const userId = 1; // Temporal

    const parsedFolderId = folderId && folderId !== 'null' ? parseInt(folderId) : null;

    const fileId = await fileService.subir(
      {
        file,
        folder_id: parsedFolderId,
        description: description || undefined
      },
      userId
    );

    return NextResponse.json({ success: true, id: fileId });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir archivo' },
      { status: 500 }
    );
  }
}
