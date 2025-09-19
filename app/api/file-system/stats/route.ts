import { NextResponse } from 'next/server';
import { FileService } from '@/lib/file-system/services';

const fileService = new FileService();

export async function GET() {
  try {
    const stats = await fileService.obtenerEstadisticas();
    const recentFiles = await fileService.obtenerRecientes(5);
    
    return NextResponse.json({
      ...stats,
      recent_files: recentFiles
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
