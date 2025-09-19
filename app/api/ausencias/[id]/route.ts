import { NextResponse } from 'next/server';
import { AusenciaService } from '@/lib/ausencias/services';

const ausenciaService = new AusenciaService();

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const id_ausencia = parseInt(id);

    const ausencia = await ausenciaService.obtenerPorId(id_ausencia);
    
    if (!ausencia) {
      return NextResponse.json({ error: 'Ausencia no encontrada' }, { status: 404 });
    }

    return NextResponse.json(ausencia);
  } catch (error) {
    console.error('Error al obtener ausencia:', error);
    return NextResponse.json({ error: 'Error al obtener ausencia' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const id_ausencia = parseInt(id);
    const body = await request.json();
    const { nombre_tipo_ausencia, descripcion } = body;

    // Obtener el ID del tipo de ausencia basado en el nombre
    const { TipoAusenciaService } = await import('@/lib/ausencias/services');
    const tipoService = new TipoAusenciaService();
    const tipos = await tipoService.obtenerActivos();
    const tipo = tipos.find(t => t.nombre === nombre_tipo_ausencia);

    if (!tipo) {
      return NextResponse.json({ error: 'Tipo de ausencia no válido' }, { status: 400 });
    }

    await ausenciaService.actualizar(id_ausencia, {
      id_tipo_ausencia: tipo.id,
      descripcion
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar ausencia:', error);
    return NextResponse.json({ error: 'Error al actualizar ausencia' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const id_ausencia = parseInt(id);

    await ausenciaService.eliminar(id_ausencia);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar ausencia:', error);
    return NextResponse.json({ error: 'Error al eliminar ausencia' }, { status: 500 });
  }
}