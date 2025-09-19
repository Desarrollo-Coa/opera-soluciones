import { NextResponse } from 'next/server';
import { TipoAusenciaService } from '@/lib/ausencias/services';

const tipoAusenciaService = new TipoAusenciaService();

export async function GET() {
  try {
    console.log("Obteniendo tipos de ausencia activos...");
    const tipos = await tipoAusenciaService.obtenerActivos();
    console.log("Tipos de ausencia obtenidos:", JSON.stringify(tipos, null, 2));
    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de ausencia:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      error: 'Error al obtener tipos de ausencia',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
