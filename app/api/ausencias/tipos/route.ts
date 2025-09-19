import { NextResponse } from 'next/server';
import { TipoAusenciaService } from '@/lib/ausencias/services';

const tipoAusenciaService = new TipoAusenciaService();

export async function GET() {
  try {
    const tipos = await tipoAusenciaService.obtenerActivos();
    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de ausencia:', error);
    return NextResponse.json({ error: 'Error al obtener tipos de ausencia' }, { status: 500 });
  }
}
