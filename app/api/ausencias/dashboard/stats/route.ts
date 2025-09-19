import { NextResponse } from 'next/server';
import { AusenciaStatsService } from '@/lib/ausencias/services';

const statsService = new AusenciaStatsService();

export async function GET() {
  try {
    const stats = await statsService.obtenerEstadisticas();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}