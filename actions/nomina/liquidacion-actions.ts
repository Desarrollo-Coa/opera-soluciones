'use server'

import { pool } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types/actions';
import { ParametroNominaRow, EmpleadoLiquidacionRow } from '@/types/db';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/**
 * Generar pre-liquidación masiva para un periodo quincenal específico
 */
export async function generarLiquidacionQuincenal(mes: number, anio: number, quincena: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 0. Verificar si el periodo ya está aprobado
        const [aprobados] = await connection.execute<any[]>(
            'SELECT LQ_IDLIQUIDACION_PK FROM OS_LIQUIDACIONES WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_QUINCENA = ? AND LQ_ESTADO = "Aprobado" LIMIT 1',
            [mes, anio, quincena]
        );

        if (aprobados.length > 0) {
            throw new Error(`El PERIODO ${mes}/${anio}, ${quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA ya se encuentra aprobada.`);
        }

        // 1. Obtener parámetros del año
        const [params] = await connection.execute<ParametroNominaRow[]>(
            `SELECT
                PN_SMMLV                as smmlv,
                PN_AUXILIO_TRANSPORTE   as auxilio_transporte,
                PN_HORAS_MENSUALES_PROM as horas_mensuales_promedio
             FROM OS_PARAMETROS_NOMINA WHERE PN_ANIO_VIGENCIA = ?`,
            [anio]
        );

        if (params.length === 0) {
            throw new Error(`No hay parámetros configurados para el año ${anio}`);
        }

        const p = params[0];

        // 2. Obtener empleados activos
        const [empleados] = await connection.execute<EmpleadoLiquidacionRow[]>(
            `SELECT u.US_IDUSUARIO_PK as id, u.US_NOMBRE as first_name, u.US_APELLIDO as last_name,
                    c.CA_IDCARGO_PK as cargo_id, c.CA_SUELDO_BASE as sueldo_base, 
                    c.CA_APLICA_AUXILIO as aplica_auxilio_transporte, c.CA_PORCENTAJE_RIESGO_ARL as porcentaje_riesgo_arl
             FROM OS_USUARIOS u
             JOIN OS_CARGOS c ON u.CA_IDCARGO_FK = c.CA_IDCARGO_PK
             WHERE u.US_ACTIVO = TRUE AND u.US_FECHA_ELIMINACION IS NULL`
        );

        // Definir fechas de la quincena para buscar ausencias
        const fechaInicioQ = quincena === 1 ? `${anio}-${mes.toString().padStart(2, '0')}-01` : `${anio}-${mes.toString().padStart(2, '0')}-16`;
        const fechaFinQ = quincena === 1 ? `${anio}-${mes.toString().padStart(2, '0')}-15` : new Date(anio, mes, 0).toISOString().split('T')[0];

        let liquidadosCount = 0;

        for (const emp of empleados) {
            // Borrar previa si ya existe y no está aprobada
            const [existente] = await connection.execute<any[]>(
                'SELECT LQ_IDLIQUIDACION_PK, LQ_ESTADO FROM OS_LIQUIDACIONES WHERE US_IDUSUARIO_FK = ? AND LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_QUINCENA = ?',
                [emp.id, mes, anio, quincena]
            );

            if (existente.length > 0) {
                if (existente[0].LQ_ESTADO === 'Aprobado') continue;
                const existId = existente[0].LQ_IDLIQUIDACION_PK;
                await connection.execute('DELETE FROM OS_DETALLE_LIQUIDACION WHERE LQ_IDLIQUIDACION_FK = ?', [existId]);
                await connection.execute('DELETE FROM OS_LIQUIDACIONES WHERE LQ_IDLIQUIDACION_PK = ?', [existId]);
            }

            // 3. Consultar novedades y ausencias
            const [novedades] = await connection.execute<any[]>(
                `SELECT n.*, c.CN_TIPO as tipo, c.CN_AFECTA_IBC_SALUD as afecta_ibc_salud, c.CN_NOMBRE as concepto_nombre
                 FROM OS_NOVEDADES n
                 JOIN OS_CONCEPTOS_NOMINA c ON n.CN_IDCONCEPTO_FK = c.CN_IDCONCEPTO_PK
                 WHERE n.US_IDUSUARIO_FK = ? AND n.NO_PERIODO_MES = ? AND n.NO_PERIODO_ANIO = ? AND (n.NO_QUINCENA = ? OR n.NO_QUINCENA IS NULL)`,
                [emp.id, mes, anio, quincena]
            );

            // Contar días de ausencia en este periodo y porcentaje de pago
            const [ausencias] = await connection.execute<any[]>(
                `SELECT 
                    SUM(DATEDIFF(LEAST(a.AU_FECHA_FIN, ?), GREATEST(a.AU_FECHA_INICIO, ?)) + 1) as dias,
                    ta.TA_PORCENTAJE_PAGO as porcentaje_pago,
                    ta.TA_AFECTA_AUXILIO as afecta_auxilio,
                    ta.TA_NOMBRE as tipo_nombre
                 FROM OS_AUSENCIAS a
                 JOIN OS_TIPOS_AUSENCIA ta ON a.TA_IDTIPO_AUSENCIA_FK = ta.TA_IDTIPO_AUSENCIA_PK
                 WHERE a.US_IDUSUARIO_FK = ? AND a.AU_ACTIVO = 1
                 AND a.AU_FECHA_INICIO <= ? AND a.AU_FECHA_FIN >= ?
                 GROUP BY ta.TA_IDTIPO_AUSENCIA_PK`,
                [fechaFinQ, fechaInicioQ, emp.id, fechaFinQ, fechaInicioQ]
            );

            let totalDiasAusencia = 0;
            let totalDescuentoAusencias = 0;
            let diasAFuturoParaDescontarAuxilio = 0;

            for (const aus of ausencias) {
                const dias = Number(aus.dias);
                const pctPago = Number(aus.porcentaje_pago) / 100;
                const afectaAux = Number(aus.afecta_auxilio) === 1;

                totalDiasAusencia += dias;
                if (afectaAux) diasAFuturoParaDescontarAuxilio += dias;

                // Descuento: (Sueldo/30) * días * (1 - %pago)
                const factorDescuento = 1 - pctPago;
                totalDescuentoAusencias += (emp.sueldo_base / 30) * dias * factorDescuento;
            }

            // 3.5 Consultar Cláusulas Extralegales activas del periodo
            const [clausulas] = await connection.execute<any[]>(
                `SELECT uc.*, cl.CL_NOMBRE as nombre, cl.CN_IDCONCEPTO_FK as concepto_id
                 FROM OS_USUARIOS_CLAUSULAS uc
                 JOIN OS_CLAUSULAS cl ON uc.CL_IDCLAUSULA_FK = cl.CL_IDCLAUSULA_PK
                 WHERE uc.US_IDUSUARIO_FK = ? AND uc.UC_ACTIVO = 1
                 AND uc.UC_FECHA_INICIO <= ? 
                 AND (uc.UC_FECHA_FIN IS NULL OR uc.UC_FECHA_FIN >= ?)`,
                [emp.id, fechaFinQ, fechaInicioQ]
            );

            let totalClausulas = 0;
            const detallesClausulas: any[] = [];
            for (const cl of clausulas) {
                const montoQuincenal = Number(cl.UC_MONTO_MENSUAL) / 2;
                totalClausulas += montoQuincenal;
                detallesClausulas.push([cl.concepto_id, cl.nombre, 1, Number(cl.UC_MONTO_MENSUAL) / 2, montoQuincenal, 'Devengo', false]);
            }

            // --- CÁLCULOS QUINCENALES (15 días base) ---
            let diasTrabajadosEfectivos = 15 - totalDiasAusencia;
            if (diasTrabajadosEfectivos < 0) diasTrabajadosEfectivos = 0;

            // Días para el cálculo de auxilio de transporte
            let diasParaAuxilio = 15 - diasAFuturoParaDescontarAuxilio;
            if (diasParaAuxilio < 0) diasParaAuxilio = 0;

            const sueldoQuincenalBase = (emp.sueldo_base / 30) * 15;

            // Sueldo Proporcional = (Días Trabajados * 100%) + (Días Ausencia * %pago)
            // Pero para simplificar el volante, pagamos el básico de 15 días y descontamos el resto en deducciones
            // O pagamos el neto proporcional. Elegimos pagar el neto proporcional para Sueldo Básico.
            let sueldoProporcional = (emp.sueldo_base / 30) * diasTrabajadosEfectivos;

            for (const aus of ausencias) {
                const pctPago = Number(aus.porcentaje_pago) / 100;
                sueldoProporcional += (emp.sueldo_base / 30) * Number(aus.dias) * pctPago;
            }

            // Auxilio de transporte
            let auxilioTransporte = 0;
            if (emp.aplica_auxilio_transporte && emp.sueldo_base <= (p.smmlv * 2)) {
                auxilioTransporte = ((p.auxilio_transporte / 2) / 15) * diasParaAuxilio;
            }

            // --- PROCESAR NOVEDADES ---
            let devengosExtras = 0;
            let deduccionesExtras = 0;
            let adicionalIBC = 0;

            for (const n of novedades) {
                if (n.tipo === 'Devengo') {
                    devengosExtras += Number(n.NO_VALOR_TOTAL);
                    if (n.afecta_ibc_salud) adicionalIBC += Number(n.NO_VALOR_TOTAL);
                } else {
                    deduccionesExtras += Number(n.NO_VALOR_TOTAL);
                }
            }

            // IBC Quincenal
            const ibc = sueldoProporcional + adicionalIBC;
            const saludEmpleado = ibc * 0.04;
            const pensionEmpleado = ibc * 0.04;

            const totalDevengado = sueldoProporcional + auxilioTransporte + devengosExtras + totalClausulas;
            const totalDeducciones = saludEmpleado + pensionEmpleado + deduccionesExtras;
            const netoPagar = totalDevengado - totalDeducciones;

            // 4. Insertar Maestra
            const [resMaster]: any = await connection.execute(
                `INSERT INTO OS_LIQUIDACIONES 
                 (US_IDUSUARIO_FK, LQ_PERIODO_MES, LQ_PERIODO_ANIO, LQ_QUINCENA, LQ_FECHA_LIQUIDACION, 
                  LQ_DIAS_TRABAJADOS, LQ_DIAS_INCAPACIDAD,
                  LQ_IBC_SALUD, LQ_IBC_PENSION, LQ_IBC_ARL, 
                  LQ_TOTAL_DEVENGADO, LQ_TOTAL_DEDUCCIONES, LQ_NETO_PAGAR, LQ_COSTO_EMPRESA, LQ_SMMLV_BASE, LQ_CREADO_POR, LQ_ESTADO)
                 VALUES (?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Calculado')`,
                [
                    emp.id, mes, anio, quincena,
                    diasTrabajadosEfectivos, totalDiasAusencia,
                    ibc, ibc, ibc,
                    totalDevengado, totalDeducciones, netoPagar, totalDevengado, p.smmlv, user.id
                ]
            );

            const liqId = resMaster.insertId;

            // 5. Detalles
            const detalles = [
                ['DEV001', 'Sueldo Básico (15d)', 1, sueldoQuincenalBase, sueldoProporcional, 'Devengo', true],
                ['DEV002', 'Auxilio de Transporte', 1, p.auxilio_transporte / 2, auxilioTransporte, 'Devengo', false],
                ['DED001', 'Salud (4%)', 1, ibc, saludEmpleado, 'Deducción', false],
                ['DED002', 'Pensión (4%)', 1, ibc, pensionEmpleado, 'Deducción', false],
                ...detallesClausulas
            ];

            if (totalDescuentoAusencias > 0) {
                detalles.push(['DED004', `Ausencias/Incapacidades (${totalDiasAusencia}d)`, totalDiasAusencia, emp.sueldo_base / 30, totalDescuentoAusencias, 'Deducción', false]);
            }

            for (const d of detalles) {
                if (d[4] as number > 0 || (d[0] === 'DEV001')) {
                    await connection.execute(
                        `INSERT INTO OS_DETALLE_LIQUIDACION 
                         (LQ_IDLIQUIDACION_FK, CN_IDCONCEPTO_FK, DL_DESCRIPCION, DL_CANTIDAD, DL_VALOR_UNITARIO, DL_VALOR_TOTAL, DL_TIPO, DL_AFECTA_IBC_SALUD)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [liqId, d[0], d[1], d[2], d[3], d[4], d[5], d[6]]
                    );
                }
            }

            // 6. Detalles Novedades
            for (const n of novedades) {
                await connection.execute(
                    `INSERT INTO OS_DETALLE_LIQUIDACION 
                     (LQ_IDLIQUIDACION_FK, CN_IDCONCEPTO_FK, DL_DESCRIPCION, DL_CANTIDAD, DL_VALOR_UNITARIO, DL_VALOR_TOTAL, DL_TIPO, DL_AFECTA_IBC_SALUD)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [liqId, n.CN_IDCONCEPTO_FK, n.concepto_nombre, 1, n.NO_VALOR_TOTAL, n.NO_VALOR_TOTAL, n.tipo, n.afecta_ibc_salud]
                );
            }

            liquidadosCount++;
        }

        await connection.commit();
        revalidatePath('/inicio/nomina/liquidaciones');

        return {
            success: true,
            message: `Liquidación generada: ${MESES[mes - 1].toUpperCase()}, ${quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA (${liquidadosCount} empleados).`
        };

    } catch (error: any) {
        await connection.rollback();
        console.error('Error en liquidación:', error);
        return { success: false, message: error.message || 'Error al procesar la nómina' };
    } finally {
        connection.release();
    }
}

/**
 * Obtener listado de liquidaciones para un periodo
 * Migración 007: OS_LIQUIDACIONES, OS_USUARIOS, OS_CARGOS
 */
export async function getLiquidaciones(mes: number, anio: number, quincena: number): Promise<ActionResponse<{ rows: any[], totalEmployees: number }>> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<any[]>(
            `SELECT 
                l.LQ_IDLIQUIDACION_PK as id,
                l.LQ_TOTAL_DEVENGADO   as total_devengado,
                l.LQ_TOTAL_DEDUCCIONES as total_deducciones,
                l.LQ_NETO_PAGAR        as neto_pagar,
                l.LQ_ESTADO            as estado,
                u.US_NOMBRE            as first_name,
                u.US_APELLIDO          as last_name,
                u.US_NUMERO_DOCUMENTO  as document_number,
                u.US_NUMERO_CUENTA     as account_number,
                COALESCE(eb.EB_NOMBRE, u.US_NOMBRE_BANCO) as bank_name,
                c.CA_NOMBRE            as cargo_nombre
             FROM OS_LIQUIDACIONES l
             JOIN OS_USUARIOS u ON l.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
             LEFT JOIN OS_CARGOS c ON u.CA_IDCARGO_FK = c.CA_IDCARGO_PK
             LEFT JOIN OS_ENTIDADES_BANCARIAS eb ON u.US_NOMBRE_BANCO = eb.EB_IDBANCO_PK
             WHERE l.LQ_PERIODO_MES = ? AND l.LQ_PERIODO_ANIO = ? AND l.LQ_QUINCENA = ?
             ORDER BY u.US_APELLIDO, u.US_NOMBRE`,
            [mes, anio, quincena]
        );

        // Obtener total de empleados activos para el ratio
        const [total] = await pool.execute<any[]>('SELECT COUNT(*) as count FROM OS_USUARIOS WHERE US_ACTIVO = TRUE AND US_FECHA_ELIMINACION IS NULL');

        return {
            success: true,
            data: {
                rows,
                totalEmployees: total[0]?.count || 0
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener detalle de una liquidación específica para el volante
 * Migración 007: OS_LIQUIDACIONES, OS_USUARIOS, OS_CARGOS, OS_DETALLE_LIQUIDACION
 */
export async function getLiquidacionById(id: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [maestra] = await pool.execute<any[]>(
            `SELECT 
                l.LQ_IDLIQUIDACION_PK   as id,
                l.LQ_PERIODO_MES        as periodo_mes,
                l.LQ_PERIODO_ANIO       as periodo_anio,
                l.LQ_QUINCENA           as quincena,
                l.LQ_FECHA_LIQUIDACION  as fecha_liquidacion,
                l.LQ_TOTAL_DEVENGADO    as total_devengado,
                l.LQ_TOTAL_DEDUCCIONES  as total_deducciones,
                l.LQ_DIAS_TRABAJADOS    as dias_trabajados,
                l.LQ_DIAS_INCAPACIDAD   as dias_incapacidad,
                l.LQ_NETO_PAGAR         as neto_pagar,
                l.LQ_IBC_SALUD          as ibc_salud,
                l.LQ_ESTADO             as estado,
                u.US_NOMBRE             as first_name,
                u.US_APELLIDO           as last_name,
                u.US_NUMERO_DOCUMENTO   as document_number,
                u.US_TIPO_DOCUMENTO     as document_type,
                COALESCE(eb.EB_NOMBRE, u.US_NOMBRE_BANCO) as bank_name,
                u.US_NUMERO_CUENTA      as account_number,
                u.US_TIPO_CUENTA        as account_type,
                u.US_HORARIO_TRABAJO    as work_schedule,
                u.EP_IDEPS_FK           as eps_id,
                u.AR_IDARL_FK           as arl_id,
                u.PE_IDPENSION_FK       as pension_fund_id,
                c.CA_NOMBRE             as cargo_nombre,
                c.CA_SUELDO_BASE        as sueldo_mensual_base
             FROM OS_LIQUIDACIONES l
             JOIN OS_USUARIOS u ON l.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
             LEFT JOIN OS_CARGOS c ON u.CA_IDCARGO_FK = c.CA_IDCARGO_PK
             LEFT JOIN OS_ENTIDADES_BANCARIAS eb ON u.US_NOMBRE_BANCO = eb.EB_IDBANCO_PK
             WHERE l.LQ_IDLIQUIDACION_PK = ?`,
            [id]
        );

        if (maestra.length === 0) return { success: false, message: 'No se encontró la liquidación' };

        const [detalles] = await pool.execute<any[]>(
            `SELECT 
                DL_IDDETALLE_PK     as id,
                DL_DESCRIPCION      as descripcion,
                DL_CANTIDAD         as cantidad,
                DL_VALOR_UNITARIO   as valor_unitario,
                DL_VALOR_TOTAL      as valor_total,
                DL_TIPO             as tipo
             FROM OS_DETALLE_LIQUIDACION 
             WHERE LQ_IDLIQUIDACION_FK = ? 
             ORDER BY DL_TIPO DESC, CN_IDCONCEPTO_FK ASC`,
            [id]
        );

        return {
            success: true,
            data: {
                ...maestra[0],
                detalles
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Aprobar masivamente toda la nómina del periodo
 * Migración 007: OS_LIQUIDACIONES con columnas LQ_
 */
export async function aprobarNominaPeriodo(mes: number, anio: number, quincena: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        await pool.execute(
            'UPDATE OS_LIQUIDACIONES SET LQ_ESTADO = "Aprobado" WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_QUINCENA = ? AND LQ_ESTADO != "Anulado"',
            [mes, anio, quincena]
        );

        revalidatePath('/inicio/nomina/liquidaciones');
        return { success: true, message: `PERIODO ${MESES[mes - 1].toUpperCase()}, ${quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA aprobado correctamente.` };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Verificar si un periodo ya está aprobado
 * Migración 007: OS_LIQUIDACIONES con columnas LQ_
 */
export async function isPeriodoAprobadoAction(mes: number, anio: number, quincena: number): Promise<boolean> {
    try {
        const [rows] = await pool.execute<any[]>(
            'SELECT LQ_IDLIQUIDACION_PK FROM OS_LIQUIDACIONES WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_QUINCENA = ? AND LQ_ESTADO = "Aprobado" LIMIT 1',
            [mes, anio, quincena]
        );
        return rows.length > 0;
    } catch (e) {
        return false;
    }
}

/**
 * Eliminar una liquidación individual (Solo si no está aprobada)
 */
export async function eliminarLiquidacion(id: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [existing] = await pool.execute<any[]>(
            'SELECT LQ_ESTADO FROM OS_LIQUIDACIONES WHERE LQ_IDLIQUIDACION_PK = ?',
            [id]
        );

        if (existing.length === 0) throw new Error("Liquidación no encontrada.");
        if (existing[0].LQ_ESTADO === 'Aprobado') throw new Error("No se puede eliminar una liquidación aprobada.");

        await pool.execute('DELETE FROM OS_DETALLE_LIQUIDACION WHERE LQ_IDLIQUIDACION_FK = ?', [id]);
        await pool.execute('DELETE FROM OS_LIQUIDACIONES WHERE LQ_IDLIQUIDACION_PK = ?', [id]);

        return { success: true, message: "Liquidación eliminada correctamente." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Eliminar toda la nómina de un periodo/quincena (Solo si no hay nada aprobado)
 */
export async function eliminarNominaPeriodo(mes: number, anio: number, quincena: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const isAprobado = await isPeriodoAprobadoAction(mes, anio, quincena);
        if (isAprobado) throw new Error("No se puede eliminar un periodo que ya tiene liquidaciones aprobadas.");

        // Borrar todos los detalles de ese periodo
        await pool.execute(
            `DELETE det FROM OS_DETALLE_LIQUIDACION det
             JOIN OS_LIQUIDACIONES liq ON det.LQ_IDLIQUIDACION_FK = liq.LQ_IDLIQUIDACION_PK
             WHERE liq.LQ_PERIODO_MES = ? AND liq.LQ_PERIODO_ANIO = ? AND liq.LQ_QUINCENA = ?`,
            [mes, anio, quincena]
        );

        // Borrar las maestras
        await pool.execute(
            'DELETE FROM OS_LIQUIDACIONES WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_QUINCENA = ?',
            [mes, anio, quincena]
        );

        revalidatePath('/inicio/nomina/liquidaciones');
        return { success: true, message: "Todos los borradores del periodo han sido eliminados." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener las liquidaciones (volantes) del usuario autenticado
 */
export async function getMisVolantesAction(): Promise<ActionResponse<any[]>> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<any[]>(
            `SELECT 
                LQ_IDLIQUIDACION_PK     as id,
                LQ_PERIODO_MES          as periodo_mes,
                LQ_PERIODO_ANIO         as periodo_anio,
                LQ_QUINCENA             as quincena,
                LQ_TOTAL_DEVENGADO      as total_devengado,
                LQ_TOTAL_DEDUCCIONES    as total_deducciones,
                LQ_NETO_PAGAR           as neto_pagar,
                LQ_ESTADO               as estado,
                LQ_FECHA_LIQUIDACION    as fecha_liquidacion
             FROM OS_LIQUIDACIONES 
             WHERE US_IDUSUARIO_FK = ? AND LQ_ESTADO = 'Aprobado'
             ORDER BY LQ_PERIODO_ANIO DESC, LQ_PERIODO_MES DESC, LQ_QUINCENA DESC`,
            [user.id]
        );

        return { success: true, data: rows };
    } catch (error: any) {
        console.error('Error fetching user volantes:', error);
        return { success: false, message: error.message };
    }
}
