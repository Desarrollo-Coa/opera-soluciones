'use server'

import { pool } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types/actions';

/**
 * Crear un nuevo préstamo y generar su tabla de cuotas automáticamente
 */
export async function crearPrestamoAction(data: {
    empleado_id: number;
    monto_solicitado: number;
    tasa_interes: number;
    num_cuotas: number;
    periodo_inicio_mes: number;
    periodo_inicio_anio: number;
    quincena_inicio: number;
    motivo?: string;
    fecha_desembolso?: string;
}): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    // --- BLOQUEO DE SEGURIDAD POR NÓMINA ---
    const [locked]: any[] = await pool.execute(
        `SELECT LQ_IDLIQUIDACION_PK FROM OS_LIQUIDACIONES 
         WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_QUINCENA = ? 
         AND LQ_ESTADO IN ('Calculado', 'Aprobado') LIMIT 1`,
        [data.periodo_inicio_mes, data.periodo_inicio_anio, data.quincena_inicio]
    );

    if (locked.length > 0) {
        return {
            success: false,
            message: `No se puede iniciar el préstamo en el periodo ${data.periodo_inicio_mes}/${data.periodo_inicio_anio} Q${data.quincena_inicio} porque ya existe una nómina generada o aprobada para esa fecha.`
        };
    }

    // --- VALIDACIÓN DE FECHA VS PERIODO REMOVED AS PER USER REQUEST ---


    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Calcular totales (Sistema simple para préstamos de nómina)
        // Montos e intereses
        const montoPrincipal = Number(data.monto_solicitado);
        const tasaMensual = Number(data.tasa_interes) / 100;
        const numCuotas = Number(data.num_cuotas);

        // Cálculo de interés simple sobre el total (o podrías usar francés, pero para nómina suele ser valor fijo)
        const totalIntereses = montoPrincipal * tasaMensual * (numCuotas / 2); // Simpificado para quincenas
        const totalAPagar = montoPrincipal + totalIntereses;
        const valorCuotaBase = totalAPagar / numCuotas;

        // 2. Insertar Cabecera
        const [resPrestamo]: any = await connection.execute(
            `INSERT INTO OS_PRESTAMOS 
             (US_IDUSUARIO_FK, PR_MONTO_SOLICITADO, PR_TASA_INTERES_MENSUAL, PR_NUMERO_CUOTAS, 
              PR_TOTAL_A_PAGAR, PR_SALDO_PENDIENTE, PR_FECHA_DESEMBOLSO, PR_MOTIVO, PR_CREADO_POR)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.empleado_id, montoPrincipal, data.tasa_interes, numCuotas,
                totalAPagar, totalAPagar, data.fecha_desembolso || new Date().toISOString().split('T')[0],
                data.motivo || 'Préstamo de nómina', user.id
            ]
        );

        const prestamoId = resPrestamo.insertId;

        // 3. Generar Cuotas
        let curMes = data.periodo_inicio_mes;
        let curAnio = data.periodo_inicio_anio;
        let curQuincena = data.quincena_inicio;

        for (let i = 1; i <= numCuotas; i++) {
            const lastDayOfMonth = new Date(curAnio, curMes, 0).getDate();
            const day = curQuincena === 1 ? 15 : Math.min(30, lastDayOfMonth);
            const fechaEstimada = `${curAnio}-${String(curMes).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            await connection.execute(
                `INSERT INTO OS_PRESTAMOS_CUOTAS 
                 (PR_IDPRESTAMO_FK, PC_NUMERO_CUOTA, PC_VALOR_CUOTA, PC_VALOR_CAPITAL, PC_VALOR_INTERES,
                  PC_PERIODO_ANIO, PC_PERIODO_MES, PC_QUINCENA, PC_FECHA_ESTIMADA)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    prestamoId, i, valorCuotaBase, montoPrincipal / numCuotas, totalIntereses / numCuotas,
                    curAnio, curMes, curQuincena, fechaEstimada
                ]
            );

            // Avanzar periodo
            if (curQuincena === 1) {
                curQuincena = 2;
            } else {
                curQuincena = 1;
                curMes++;
                if (curMes > 12) {
                    curMes = 1;
                    curAnio++;
                }
            }
        }

        await connection.commit();
        revalidatePath('/inicio/nomina/prestamos');
        return { success: true, message: 'Préstamo y tabla de cuotas generados correctamente.' };

    } catch (error: any) {
        await connection.rollback();
        return { success: false, message: error.message };
    } finally {
        connection.release();
    }
}

/**
 * Obtener listado de préstamos activos
 */
export async function getPrestamosActivosAction(): Promise<ActionResponse<any[]>> {
    try {
        const [rows] = await pool.execute(
            `SELECT p.*, u.US_NOMBRE as first_name, u.US_APELLIDO as last_name,
                    (SELECT COUNT(*) FROM OS_PRESTAMOS_CUOTAS WHERE PR_IDPRESTAMO_FK = p.PR_IDPRESTAMO_PK AND (PC_ESTADO != 'Pendiente' OR LQ_IDLIQUIDACION_FK IS NOT NULL)) as cuotas_procesadas
             FROM OS_PRESTAMOS p
             JOIN OS_USUARIOS u ON p.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
             WHERE p.PR_ESTADO = 'Activo'
             ORDER BY p.PR_FECHA_CREACION DESC`
        );
        return { success: true, data: rows as any[] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener detalle de cuotas de un préstamo
 */
export async function getCuotasPrestamoAction(prestamoId: number): Promise<ActionResponse<any[]>> {
    try {
        const [rows] = await pool.execute(
            `SELECT * FROM OS_PRESTAMOS_CUOTAS WHERE PR_IDPRESTAMO_FK = ? ORDER BY PC_NUMERO_CUOTA ASC`,
            [prestamoId]
        );
        return { success: true, data: rows as any[] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Eliminar un préstamo (solo si no tiene cuotas procesadas/asociadas a nómina)
 */
export async function eliminarPrestamoAction(prestamoId: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verificar si tiene cuotas procesadas
        const [cuotas]: any[] = await connection.execute(
            `SELECT COUNT(*) as total FROM OS_PRESTAMOS_CUOTAS 
             WHERE PR_IDPRESTAMO_FK = ? AND (PC_ESTADO != 'Pendiente' OR LQ_IDLIQUIDACION_FK IS NOT NULL)`,
            [prestamoId]
        );

        if (cuotas[0].total > 0) {
            await connection.rollback();
            return {
                success: false,
                message: 'No se puede eliminar el préstamo porque ya tiene cuotas procesadas o asociadas a una nómina.'
            };
        }

        // 2. Eliminar cuotas
        await connection.execute(
            `DELETE FROM OS_PRESTAMOS_CUOTAS WHERE PR_IDPRESTAMO_FK = ?`,
            [prestamoId]
        );

        // 3. Eliminar cabecera
        await connection.execute(
            `DELETE FROM OS_PRESTAMOS WHERE PR_IDPRESTAMO_PK = ?`,
            [prestamoId]
        );

        await connection.commit();
        revalidatePath('/inicio/nomina/prestamos');
        return { success: true, message: 'Préstamo eliminado correctamente.' };

    } catch (error: any) {
        await connection.rollback();
        return { success: false, message: error.message };
    } finally {
        connection.release();
    }
}

