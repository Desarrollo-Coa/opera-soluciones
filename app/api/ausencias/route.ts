import { NextResponse } from 'next/server';
import { AusenciaService, CrearAusenciaData } from '@/lib/ausencias/services';

export const revalidate = 0;

const ausenciaService = new AusenciaService();

export async function GET() {
  try {
    const ausencias = await ausenciaService.obtenerTodas();
    return NextResponse.json(ausencias);
  } catch (error) {
    console.error('Error al obtener ausencias:', error);
    return NextResponse.json({ error: 'Error al obtener ausencias' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Validar campos obligatorios
    const id_colaborador = formData.get('id_colaborador');
    const id_tipo_ausencia = formData.get('id_tipo_ausencia');
    const fecha_inicio = formData.get('fecha_inicio');
    const fecha_fin = formData.get('fecha_fin');
    const descripcion = formData.get('descripcion');
    const id_usuario_registro = formData.get('id_usuario_registro');
    const archivos = formData.getAll('archivos') as File[];

    if (!id_colaborador || !id_tipo_ausencia || !fecha_inicio || !fecha_fin || !id_usuario_registro) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const data: CrearAusenciaData = {
      id_colaborador: parseInt(id_colaborador as string),
      id_tipo_ausencia: parseInt(id_tipo_ausencia as string),
      fecha_inicio: fecha_inicio as string,
      fecha_fin: fecha_fin as string,
      descripcion: descripcion as string,
      id_usuario_registro: parseInt(id_usuario_registro as string),
      archivos: archivos.filter(archivo => archivo instanceof File)
    };

    const id_ausencia = await ausenciaService.crear(data);
    
    return NextResponse.json({ success: true, id_ausencia });
  } catch (error: any) {
    console.error('Error al registrar ausencia:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
} 