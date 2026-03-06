import { executeQuery } from '@/lib/db';
import { DashboardStats } from '../types';

/**
 * AusenciaStatsService
 * Migración 007: tablas OS_AUSENCIAS, OS_TIPOS_AUSENCIA, OS_USUARIOS con nuevas columnas
 */
export class AusenciaStatsService {
  async obtenerEstadisticas(): Promise<DashboardStats> {
    console.log("Iniciando obtención de estadísticas (secuencial)...");

    const totalAusencias = await this.obtenerTotalAusencias();
    const ausenciasEsteMes = await this.obtenerAusenciasEsteMes();
    const colaboradoresAfectados = await this.obtenerColaboradoresAfectados();

    console.log("Obteniendo tipos...");
    const tiposResult = await this.obtenerAusenciasPorTipo();

    console.log("Obteniendo departamentos...");
    const departamentosResult = await this.obtenerAusenciasPorDepartamento();

    console.log("Obteniendo top colaboradores...");
    const colaboradoresTopResult = await this.obtenerColaboradoresConMasAusencias();

    console.log("Obteniendo tendencia diaria...");
    const tendenciaResult = await this.obtenerTendenciaDiaria();

    console.log("Obteniendo tendencia mensual...");
    const tendenciaMensualResult = await this.obtenerTendenciaMensual();

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
      // Migración 007: OS_AUSENCIAS → AU_ACTIVO
      const result = await executeQuery(
        'SELECT COUNT(*) as total FROM OS_AUSENCIAS WHERE AU_ACTIVO = TRUE'
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
      // Migración 007: OS_AUSENCIAS → AU_ACTIVO, AU_FECHA_REGISTRO
      const result = await executeQuery(
        'SELECT COUNT(*) as total FROM OS_AUSENCIAS WHERE AU_ACTIVO = TRUE AND MONTH(AU_FECHA_REGISTRO) = MONTH(CURRENT_DATE()) AND YEAR(AU_FECHA_REGISTRO) = YEAR(CURRENT_DATE())'
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
      // Migración 007: OS_AUSENCIAS → US_IDUSUARIO_FK, AU_ACTIVO
      const result = await executeQuery(
        'SELECT COUNT(DISTINCT US_IDUSUARIO_FK) as total FROM OS_AUSENCIAS WHERE AU_ACTIVO = TRUE'
      ) as Array<{ total: number }>;

      console.log("Colaboradores afectados resultado:", result);
      return result[0]?.total || 0;
    } catch (error) {
      console.error("Error al obtener colaboradores afectados:", error);
      return 0;
    }
  }

  private async obtenerAusenciasPorTipo(): Promise<Array<{ nombre: string; cantidad: number; porcentaje: number }>> {
    // Migración 007: OS_AUSENCIAS (AU_ACTIVO), OS_TIPOS_AUSENCIA (TA_IDTIPO_AUSENCIA_PK, TA_NOMBRE)
    const result = await executeQuery(`
      SELECT ta.TA_NOMBRE as nombre, COUNT(*) as cantidad
      FROM OS_AUSENCIAS a
      JOIN OS_TIPOS_AUSENCIA ta ON a.TA_IDTIPO_AUSENCIA_FK = ta.TA_IDTIPO_AUSENCIA_PK
      WHERE a.AU_ACTIVO = TRUE
      GROUP BY ta.TA_IDTIPO_AUSENCIA_PK, ta.TA_NOMBRE
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
    // Migración 007: OS_AUSENCIAS (US_IDUSUARIO_FK, AU_ACTIVO), OS_USUARIOS (US_DEPARTAMENTO)
    const result = await executeQuery(`
      SELECT u.US_DEPARTAMENTO as departamento, COUNT(*) as cantidad
      FROM OS_AUSENCIAS a
      JOIN OS_USUARIOS u ON a.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
      WHERE a.AU_ACTIVO = TRUE AND u.US_DEPARTAMENTO IS NOT NULL
      GROUP BY u.US_DEPARTAMENTO
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
    // Migración 007: OS_AUSENCIAS, OS_USUARIOS (US_NOMBRE, US_APELLIDO, US_DEPARTAMENTO), OS_TIPOS_AUSENCIA (TA_NOMBRE)
    const result = await executeQuery(`
      SELECT 
        u.US_NOMBRE as nombre, 
        u.US_APELLIDO as apellido, 
        u.US_DEPARTAMENTO as departamento,
        SUM(CASE WHEN ta.TA_NOMBRE = 'Enfermedad General' THEN 1 ELSE 0 END) as enfermedad,
        SUM(CASE WHEN ta.TA_NOMBRE = 'No Presentado' THEN 1 ELSE 0 END) as incumplimiento,
        SUM(CASE WHEN ta.TA_NOMBRE = 'Enfermedad Laboral' THEN 1 ELSE 0 END) as accidente,
        COUNT(*) as total
      FROM OS_AUSENCIAS a
      JOIN OS_USUARIOS u ON a.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
      JOIN OS_TIPOS_AUSENCIA ta ON a.TA_IDTIPO_AUSENCIA_FK = ta.TA_IDTIPO_AUSENCIA_PK
      WHERE a.AU_ACTIVO = TRUE
      GROUP BY u.US_IDUSUARIO_PK, u.US_NOMBRE, u.US_APELLIDO, u.US_DEPARTAMENTO
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
    // Migración 007: OS_AUSENCIAS → AU_ACTIVO, AU_FECHA_REGISTRO
    const result = await executeQuery(`
      SELECT 
        DATE(AU_FECHA_REGISTRO) as dia,
        COUNT(*) as cantidad
      FROM OS_AUSENCIAS 
      WHERE AU_ACTIVO = TRUE 
        AND AU_FECHA_REGISTRO >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
      GROUP BY DATE(AU_FECHA_REGISTRO)
      ORDER BY dia DESC
    `) as Array<{ dia: string; cantidad: number }>;

    return result;
  }

  private async obtenerTendenciaMensual(): Promise<Array<{ mes: string; cantidad: number }>> {
    // Migración 007: OS_AUSENCIAS → AU_ACTIVO, AU_FECHA_REGISTRO
    const result = await executeQuery(`
      SELECT 
        DATE_FORMAT(AU_FECHA_REGISTRO, '%Y-%m') as mes,
        COUNT(*) as cantidad
      FROM OS_AUSENCIAS 
      WHERE AU_ACTIVO = TRUE 
        AND AU_FECHA_REGISTRO >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(AU_FECHA_REGISTRO, '%Y-%m')
      ORDER BY mes DESC
    `) as Array<{ mes: string; cantidad: number }>;

    return result;
  }
}
