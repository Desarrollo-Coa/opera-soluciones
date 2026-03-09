'use server'

import { pool } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types/actions';
import { RowDataPacket } from 'mysql2';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Tipo para filas de novedades con las nuevas columnas OS_ (mapeadas a camelCase para el frontend)
export interface NovedadRow extends RowDataPacket {
    id: number;
    first_name: string;
    last_name: string;
    concepto_nombre: string;
    concepto_codigo: string;
    valor_total: number;
    tipo: string;
    observaciones: string;
    document_number?: string;
    quincena: number | null;
    id_usuario: number;
    fecha_evento?: string | null;
}

/**
 * Obtener novedades por periodo
 * Migración 007: OS_NOVEDADES, OS_USUARIOS, OS_CONCEPTOS_NOMINA con nuevas columnas
 */
export async function getNovedades(mes: number, anio: number, quincena?: number): Promise<ActionResponse<NovedadRow[]>> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        let query = `SELECT 
                n.NO_IDNOVEDAD_PK as id, 
                n.US_IDUSUARIO_FK as id_usuario,
                u.US_NOMBRE as first_name, 
                u.US_APELLIDO as last_name, 
                u.US_NUMERO_DOCUMENTO as document_number,
                c.CN_NOMBRE as concepto_nombre, 
                n.CN_IDCONCEPTO_FK as concepto_codigo,
                n.NO_VALOR_TOTAL as valor_total, 
                n.NO_OBSERVACIONES as observaciones,
                n.NO_QUINCENA as quincena,
                n.NO_FECHA_EVENTO as fecha_evento,
                c.CN_TIPO as tipo
             FROM OS_NOVEDADES n
             JOIN OS_USUARIOS u ON n.US_IDUSUARIO_FK = u.US_IDUSUARIO_PK
             JOIN OS_CONCEPTOS_NOMINA c ON n.CN_IDCONCEPTO_FK = c.CN_IDCONCEPTO_PK
             WHERE n.NO_PERIODO_MES = ? AND n.NO_PERIODO_ANIO = ?`;

        const params: any[] = [mes, anio];

        if (quincena) {
            query += ` AND (n.NO_QUINCENA = ? OR n.NO_QUINCENA IS NULL)`;
            params.push(quincena);
        }

        query += ` ORDER BY n.NO_FECHA_CREACION DESC`;

        const [rows] = await pool.execute<NovedadRow[]>(query, params);
        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Helper: verificar si un periodo está aprobado y bloqueado
 * Migración 007: OS_LIQUIDACIONES con columnas LQ_
 */
async function isPeriodoBloqueado(mes: number, anio: number, quincena?: number): Promise<boolean> {
    // Bloquear si ya existe una liquidación en estado 'Aprobado' o 'Calculado' (revisión)
    let query = 'SELECT LQ_IDLIQUIDACION_PK FROM OS_LIQUIDACIONES WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_ESTADO IN ("Aprobado", "Calculado")';
    const params: any[] = [mes, anio];

    if (quincena) {
        query += ' AND LQ_QUINCENA = ?';
        params.push(quincena);
    }

    query += ' LIMIT 1';

    const [rows] = await pool.execute<any[]>(query, params);
    return rows.length > 0;
}

/**
 * Crear una nueva novedad
 * Migración 007: INSERT en OS_NOVEDADES con columnas NO_
 */
export async function crearNovedad(data: {
    empleado_id: number;
    concepto_codigo: string;
    periodo_mes: number;
    periodo_anio: number;
    quincena?: number;
    valor_total: number;
    observaciones?: string;
    fecha_evento?: string;
}): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        if (await isPeriodoBloqueado(data.periodo_mes, data.periodo_anio, data.quincena)) {
            const qStr = data.quincena === 1 ? 'PRIMERA' : 'SEGUNDA';
            throw new Error(`El PERIODO ${MESES[data.periodo_mes - 1].toUpperCase()}, ${qStr} QUINCENA se encuentra cerrado.`);
        }

        // --- VALIDACIÓN DE FECHA VS PERIODO ---
        if (data.fecha_evento) {
            const d = new Date(data.fecha_evento + 'T12:00:00');
            const dYear = d.getFullYear();
            const dMonth = d.getMonth() + 1;
            const dDay = d.getDate();

            const isWrongManual = (dYear !== data.periodo_anio || dMonth !== data.periodo_mes);
            const lastDayTotal = new Date(data.periodo_anio, data.periodo_mes, 0).getDate();

            let isWrongDay = false;
            if (Number(data.quincena) === 1) {
                isWrongDay = dDay < 1 || dDay > 15;
            } else {
                isWrongDay = dDay < 16 || dDay > lastDayTotal;
            }

            if (isWrongManual || isWrongDay) {
                throw new Error(`La fecha del evento (${data.fecha_evento}) no es válida para el periodo Q${data.quincena} de ${data.periodo_mes}/${data.periodo_anio}.`);
            }
        }

        await pool.execute(
            `INSERT INTO OS_NOVEDADES 
             (US_IDUSUARIO_FK, NO_FECHA_EVENTO, CN_IDCONCEPTO_FK, NO_PERIODO_MES, NO_PERIODO_ANIO, NO_QUINCENA, NO_VALOR_TOTAL, NO_OBSERVACIONES, NO_CREADO_POR)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.empleado_id, data.fecha_evento || null, data.concepto_codigo, data.periodo_mes,
                data.periodo_anio, data.quincena || null, data.valor_total, data.observaciones || '', user.id
            ]
        );

        revalidatePath('/inicio/nomina/novedades');
        return { success: true, message: 'Novedad registrada correctamente' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Eliminar una novedad (solo si no ha sido procesada en nómina)
 * Migración 007: OS_NOVEDADES con columnas NO_
 */
export async function eliminarNovedad(id: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        // Consultar periodo de la novedad antes de borrar
        const [novedad] = await pool.execute<any[]>(
            'SELECT NO_PERIODO_MES, NO_PERIODO_ANIO, NO_QUINCENA FROM OS_NOVEDADES WHERE NO_IDNOVEDAD_PK = ?',
            [id]
        );

        if (novedad.length > 0) {
            if (await isPeriodoBloqueado(novedad[0].NO_PERIODO_MES, novedad[0].NO_PERIODO_ANIO, novedad[0].NO_QUINCENA)) {
                throw new Error("No se pueden eliminar novedades de un periodo ya aprobado y cerrado.");
            }
        }

        await pool.execute('DELETE FROM OS_NOVEDADES WHERE NO_IDNOVEDAD_PK = ?', [id]);
        revalidatePath('/inicio/nomina/novedades');
        return { success: true, message: 'Novedad eliminada' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Editar una novedad (solo si periodo no aprobado)
 * Actualizado para permitir cambiar empleado y concepto
 */
export async function editarNovedad(
    id: number,
    valor_total: number,
    observaciones: string,
    empleado_id?: number,
    concepto_codigo?: string,
    periodo_mes?: number,
    periodo_anio?: number,
    quincena?: number,
    fecha_evento?: string
): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [novedad] = await pool.execute<any[]>(
            'SELECT NO_PERIODO_MES, NO_PERIODO_ANIO, NO_QUINCENA FROM OS_NOVEDADES WHERE NO_IDNOVEDAD_PK = ?',
            [id]
        );

        if (novedad.length === 0) return { success: false, message: 'Novedad no encontrada.' };

        // 1. Verificar si el periodo ORIGINAL está bloqueado
        if (await isPeriodoBloqueado(novedad[0].NO_PERIODO_MES, novedad[0].NO_PERIODO_ANIO, novedad[0].NO_QUINCENA)) {
            return { success: false, message: 'No se puede editar: el periodo original ya tiene una nómina generada o aprobada.' };
        }

        // 2. Si se cambia de periodo, verificar que el NUEVO periodo no esté bloqueado
        if (periodo_mes && periodo_anio && quincena) {
            if (await isPeriodoBloqueado(periodo_mes, periodo_anio, quincena)) {
                return { success: false, message: 'No se puede mover la novedad: el periodo destino ya tiene una nómina generada o aprobada.' };
            }
        }

        // 3. Validación de fecha_evento vs Periodo (si se proporciona)
        const targetMes = periodo_mes || novedad[0].NO_PERIODO_MES;
        const targetAnio = periodo_anio || novedad[0].NO_PERIODO_ANIO;
        const targetQuincena = quincena || novedad[0].NO_QUINCENA;
        const targetFecha = fecha_evento || novedad[0].NO_FECHA_EVENTO;

        if (targetFecha) {
            const d = new Date(targetFecha + 'T12:00:00');
            const dYear = d.getFullYear();
            const dMonth = d.getMonth() + 1;
            const dDay = d.getDate();

            const isWrongManual = (dYear !== targetAnio || dMonth !== targetMes);
            const lastDayTotal = new Date(targetAnio, targetMes, 0).getDate();

            let isWrongDay = false;
            if (Number(targetQuincena) === 1) {
                isWrongDay = dDay < 1 || dDay > 15;
            } else {
                isWrongDay = dDay < 16 || dDay > lastDayTotal;
            }

            if (isWrongManual || isWrongDay) {
                return { success: false, message: `La fecha del evento (${targetFecha}) no es válida para el periodo final Q${targetQuincena} de ${targetMes}/${targetAnio}.` };
            }
        }

        // Construir query dinámica
        let query = 'UPDATE OS_NOVEDADES SET NO_VALOR_TOTAL = ?, NO_OBSERVACIONES = ?';
        const params: any[] = [valor_total, observaciones];

        if (empleado_id) {
            query += ', US_IDUSUARIO_FK = ?';
            params.push(empleado_id);
        }

        if (concepto_codigo) {
            query += ', CN_IDCONCEPTO_FK = ?';
            params.push(concepto_codigo);
        }

        if (periodo_mes) {
            query += ', NO_PERIODO_MES = ?';
            params.push(periodo_mes);
        }

        if (periodo_anio) {
            query += ', NO_PERIODO_ANIO = ?';
            params.push(periodo_anio);
        }

        if (quincena) {
            query += ', NO_QUINCENA = ?';
            params.push(quincena);
        }

        if (fecha_evento) {
            query += ', NO_FECHA_EVENTO = ?';
            params.push(fecha_evento);
        }

        query += ' WHERE NO_IDNOVEDAD_PK = ?';
        params.push(id);

        await pool.execute(query, params);

        revalidatePath('/inicio/nomina/novedades');
        return { success: true, message: 'Novedad actualizada correctamente.' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener catálogo de conceptos de nómina
 * Migración 007: OS_CONCEPTOS_NOMINA con columnas CN_
 */
export async function getConceptos(): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute(
            'SELECT CN_IDCONCEPTO_PK as codigo, CN_NOMBRE as nombre, CN_ES_NOVEDAD as es_novedad FROM OS_CONCEPTOS_NOMINA ORDER BY CN_NOMBRE ASC'
        );
        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
