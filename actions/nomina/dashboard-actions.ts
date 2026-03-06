'use server'

import { pool } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { ActionResponse } from '@/types/actions';

/**
 * Obtener resumen general de la nómina para el dashboard
 * Migración 007: OS_LIQUIDACIONES con columnas LQ_
 */
export async function getResumenNomina(mes: number, anio: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<any[]>(
            `SELECT 
                COUNT(LQ_IDLIQUIDACION_PK) as total_empleados,
                SUM(LQ_TOTAL_DEVENGADO) as total_devengados,
                SUM(LQ_TOTAL_DEDUCCIONES) as total_deducciones,
                SUM(LQ_NETO_PAGAR) as total_neto,
                SUM(LQ_COSTO_EMPRESA) as costo_total
             FROM OS_LIQUIDACIONES 
             WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_ESTADO != 'Anulado'`,
            [mes, anio]
        );

        return { success: true, data: rows[0] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener distribución de costos por cargo
 * Migración 007: OS_LIQUIDACIONES (LQ_), OS_USUARIOS (US_), OS_CARGOS (CA_)
 */
export async function getCostosPorCargo(mes: number, anio: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<any[]>(
            `SELECT 
                c.CA_NOMBRE as cargo,
                SUM(l.LQ_NETO_PAGAR) as total_neto,
                SUM(l.LQ_COSTO_EMPRESA) as costo_empresa,
                COUNT(l.LQ_IDLIQUIDACION_PK) as cantidad_empleados
             FROM OS_LIQUIDACIONES l
             JOIN OS_USUARIOS u ON l.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
             JOIN OS_CARGOS c ON u.CA_IDCARGO_FK = c.CA_IDCARGO_PK
             WHERE l.LQ_PERIODO_MES = ? AND l.LQ_PERIODO_ANIO = ? AND l.LQ_ESTADO != 'Anulado'
             GROUP BY c.CA_IDCARGO_PK
             ORDER BY costo_empresa DESC`,
            [mes, anio]
        );

        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener histórico de pagos de los últimos 6 meses
 * Migración 007: OS_LIQUIDACIONES con columnas LQ_
 */
export async function getHistoricoNomina(): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<any[]>(
            `SELECT 
                LQ_PERIODO_MES as periodo_mes, 
                LQ_PERIODO_ANIO as periodo_anio, 
                SUM(LQ_COSTO_EMPRESA) as total_costo
             FROM OS_LIQUIDACIONES
             WHERE LQ_ESTADO != 'Anulado'
             GROUP BY LQ_PERIODO_ANIO, LQ_PERIODO_MES
             ORDER BY LQ_PERIODO_ANIO DESC, LQ_PERIODO_MES DESC
             LIMIT 6`
        );

        return { success: true, data: rows.reverse() };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
