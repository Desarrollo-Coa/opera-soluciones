import { NextResponse } from 'next/server';
import { AusenciaStatsService } from '@/lib/ausencias/services';

const statsService = new AusenciaStatsService();

export async function GET() {
  try {
    console.log("Iniciando obtención de estadísticas del dashboard...");
    const stats = await statsService.obtenerEstadisticas();
    console.log("Estadísticas obtenidas exitosamente:", JSON.stringify(stats, null, 2));
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error al obtener estadísticas del dashboard:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace available');
    return NextResponse.json({ 
      error: "Error al obtener estadísticas", 
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 });
  }
}