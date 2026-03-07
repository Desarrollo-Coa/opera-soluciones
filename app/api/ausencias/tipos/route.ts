import { NextRequest, NextResponse } from 'next/server';
import { TipoAusenciaService } from '@/lib/ausencias/services';

const tipoAusenciaService = new TipoAusenciaService();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all') === 'true';

    console.log(`Obteniendo tipos de ausencia (${all ? 'todos' : 'activos'})`);
    const tipos = all
      ? await tipoAusenciaService.obtenerTodos()
      : await tipoAusenciaService.obtenerActivos();

    return NextResponse.json(tipos);
  } catch (error) {
    console.error('Error al obtener tipos de ausencia:', error);
    return NextResponse.json({
      error: 'Error al obtener tipos de ausencia',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Auth check should be here in a real app, assuming simplified for now
    const newId = await tipoAusenciaService.crear(data);

    return NextResponse.json({
      success: true,
      id: newId,
      message: 'Tipo de ausencia creado correctamente'
    });
  } catch (error) {
    console.error('Error al crear tipo de ausencia:', error);
    return NextResponse.json({
      error: 'Error al crear tipo de ausencia',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
