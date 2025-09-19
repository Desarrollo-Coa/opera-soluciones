import { executeQuery } from '@/lib/database';
import { DashboardStats } from '../types';

export class AusenciaStatsService {
  async obtenerEstadisticas(): Promise<DashboardStats> {
    console.log("Iniciando obtención de estadísticas...");
    
    const [
      totalAusencias,
      ausenciasEsteMes,
      colaboradoresAfectados,
      tiposResult,
      departamentosResult,
      colaboradoresTopResult,
      tendenciaResult,
      tendenciaMensualResult
    ] = await Promise.all([
      this.obtenerTotalAusencias(),
      this.obtenerAusenciasEsteMes(),
      this.obtenerColaboradoresAfectados(),
      this.obtenerAusenciasPorTipo(),
      this.obtenerAusenciasPorDepartamento(),
      this.obtenerColaboradoresConMasAusencias(),
      this.obtenerTendenciaDiaria(),
      this.obtenerTendenciaMensual()
    ]);

    console.log("Datos obtenidos:", {
      totalAusencias,
      ausenciasEsteMes,
      colaboradoresAfectados,
      tiposCount: tiposResult.length,
      departamentosCount: departamentosResult.length,
      colaboradoresCount: colaboradoresTopResult.length,
      tendenciaCount: tendenciaResult.length,
      tendenciaMensualCount: tendenciaMensualResult.length
    });

    return {
      totalAusencias,
      ausenciasEsteMes,
      colaboradoresAfectados,
      tiposAusencia: tiposResult,
      ausenciasPorDepartamento: departamentosResult,
      colaboradoresConMasAusencias: colaboradoresTopResult,
      tendenciaDiaria: tendenciaResult,
      tendenciaMensual: tendenciaMensualResult,
    };
  }

  private async obtenerTotalAusencias(): Promise<number> {
    try {
      console.log("Obteniendo total de ausencias...");
      const result = await executeQuery(
        'SELECT COUNT(*) as total FROM ausencias WHERE activo = TRUE'
      ) as Array<{ total: number }>;
      
      console.log("Total ausencias resultado:", result);
      return result[0]?.total || 0;
    } catch (error) {
      console.error("Error al obtener total de ausencias:", error);
      return 0;
    }
  }

  private async obtenerAusenciasEsteMes(): Promise<number> {
    try {
      console.log("Obteniendo ausencias de este mes...");
      const result = await executeQuery(
        'SELECT COUNT(*) as total FROM ausencias WHERE activo = TRUE AND MONTH(fecha_registro) = MONTH(CURRENT_DATE()) AND YEAR(fecha_registro) = YEAR(CURRENT_DATE())'
      ) as Array<{ total: number }>;
      
      console.log("Ausencias este mes resultado:", result);
      return result[0]?.total || 0;
    } catch (error) {
      console.error("Error al obtener ausencias de este mes:", error);
      return 0;
    }
  }

  private async obtenerColaboradoresAfectados(): Promise<number> {
    try {
      console.log("Obteniendo colaboradores afectados...");
      const result = await executeQuery(
        'SELECT COUNT(DISTINCT id_colaborador) as total FROM ausencias WHERE activo = TRUE'
      ) as Array<{ total: number }>;
      
      console.log("Colaboradores afectados resultado:", result);
      return result[0]?.total || 0;
    } catch (error) {
      console.error("Error al obtener colaboradores afectados:", error);
      return 0;
    }
  }

  private async obtenerAusenciasPorTipo(): Promise<Array<{ nombre: string; cantidad: number; porcentaje: number }>> {
    const result = await executeQuery(`
      SELECT ta.nombre, COUNT(*) as cantidad
      FROM ausencias a
      JOIN tipos_ausencia ta ON a.id_tipo_ausencia = ta.id
      WHERE a.activo = TRUE
      GROUP BY ta.id, ta.nombre
      ORDER BY cantidad DESC
    `) as Array<{ nombre: string; cantidad: number }>;

    const total = result.reduce((sum, item) => sum + item.cantidad, 0);
    
    return result.map(item => ({
      nombre: item.nombre,
      cantidad: item.cantidad,
      porcentaje: total > 0 ? Math.round((item.cantidad / total) * 100) : 0
    }));
  }

  private async obtenerAusenciasPorDepartamento(): Promise<Array<{ departamento: string; cantidad: number }>> {
    const result = await executeQuery(`
      SELECT u.department as departamento, COUNT(*) as cantidad
      FROM ausencias a
      JOIN users u ON a.id_colaborador = u.id
      WHERE a.activo = TRUE AND u.department IS NOT NULL
      GROUP BY u.department
      ORDER BY cantidad DESC
    `) as Array<{ departamento: string; cantidad: number }>;
    
    return result;
  }

  private async obtenerColaboradoresConMasAusencias(): Promise<Array<{
    nombre: string;
    apellido: string;
    departamento: string;
    enfermedad: number;
    incumplimiento: number;
    accidente: number;
    total: number;
  }>> {
    const result = await executeQuery(`
      SELECT 
        u.first_name as nombre, 
        u.last_name as apellido, 
        u.department as departamento,
        SUM(CASE WHEN ta.nombre = 'Enfermedad General' THEN 1 ELSE 0 END) as enfermedad,
        SUM(CASE WHEN ta.nombre = 'No Presentado' THEN 1 ELSE 0 END) as incumplimiento,
        SUM(CASE WHEN ta.nombre = 'Enfermedad Laboral' THEN 1 ELSE 0 END) as accidente,
        COUNT(*) as total
      FROM ausencias a
      JOIN users u ON a.id_colaborador = u.id
      JOIN tipos_ausencia ta ON a.id_tipo_ausencia = ta.id
      WHERE a.activo = TRUE
      GROUP BY u.id, u.first_name, u.last_name, u.department
      ORDER BY total DESC
      LIMIT 10
    `) as Array<{
      nombre: string;
      apellido: string;
      departamento: string;
      enfermedad: number;
      incumplimiento: number;
      accidente: number;
      total: number;
    }>;
    
    return result;
  }

  private async obtenerTendenciaDiaria(): Promise<Array<{ dia: string; cantidad: number }>> {
    const result = await executeQuery(`
      SELECT 
        DATE(fecha_registro) as dia,
        COUNT(*) as cantidad
      FROM ausencias 
      WHERE activo = TRUE 
        AND fecha_registro >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha_registro)
      ORDER BY dia DESC
    `) as Array<{ dia: string; cantidad: number }>;
    
    return result;
  }

  private async obtenerTendenciaMensual(): Promise<Array<{ mes: string; cantidad: number }>> {
    const result = await executeQuery(`
      SELECT 
        DATE_FORMAT(fecha_registro, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM ausencias 
      WHERE activo = TRUE 
        AND fecha_registro >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(fecha_registro, '%Y-%m')
      ORDER BY mes DESC
    `) as Array<{ mes: string; cantidad: number }>;
    
    return result;
  }
}
