import { NextRequest, NextResponse } from 'next/server';
import { TipoAusenciaService } from '@/lib/ausencias/services';

const tipoAusenciaService = new TipoAusenciaService();

type Context = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const tipo = await tipoAusenciaService.obtenerPorId(parseInt(id));

        if (!tipo) {
            return NextResponse.json({ error: 'Tipo de ausencia no encontrado' }, { status: 404 });
        }

        return NextResponse.json(tipo);
    } catch (error) {
        console.error('Error al obtener tipo de ausencia:', error);
        return NextResponse.json({
            error: 'Error al obtener tipo de ausencia',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        const data = await req.json();

        await tipoAusenciaService.actualizar(parseInt(id), data);

        return NextResponse.json({
            success: true,
            message: 'Tipo de ausencia actualizado correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar tipo de ausencia:', error);
        return NextResponse.json({
            error: 'Error al actualizar tipo de ausencia',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Context) {
    try {
        const { id } = await params;
        await tipoAusenciaService.eliminar(parseInt(id));

        return NextResponse.json({
            success: true,
            message: 'Tipo de ausencia eliminado/desactivado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar tipo de ausencia:', error);
        return NextResponse.json({
            error: 'Error al eliminar tipo de ausencia',
            details: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}
