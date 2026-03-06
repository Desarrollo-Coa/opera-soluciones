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
    let query = 'SELECT LQ_IDLIQUIDACION_PK FROM OS_LIQUIDACIONES WHERE LQ_PERIODO_MES = ? AND LQ_PERIODO_ANIO = ? AND LQ_ESTADO = "Aprobado"';
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
}): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        if (await isPeriodoBloqueado(data.periodo_mes, data.periodo_anio, data.quincena)) {
            const qStr = data.quincena === 1 ? 'PRIMERA' : 'SEGUNDA';
            throw new Error(`El PERIODO ${MESES[data.periodo_mes - 1].toUpperCase()}, ${qStr} QUINCENA se encuentra cerrado.`);
        }

        await pool.execute(
            `INSERT INTO OS_NOVEDADES 
             (US_IDUSUARIO_FK, CN_IDCONCEPTO_FK, NO_PERIODO_MES, NO_PERIODO_ANIO, NO_QUINCENA, NO_VALOR_TOTAL, NO_OBSERVACIONES, NO_CREADO_POR)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [data.empleado_id, data.concepto_codigo, data.periodo_mes, data.periodo_anio, data.quincena || 1, data.valor_total, data.observaciones || '', user.id]
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
            'SELECT NO_PERIODO_MES, NO_PERIODO_ANIO FROM OS_NOVEDADES WHERE NO_IDNOVEDAD_PK = ?',
            [id]
        );

        if (novedad.length > 0) {
            if (await isPeriodoBloqueado(novedad[0].NO_PERIODO_MES, novedad[0].NO_PERIODO_ANIO)) {
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
 * Editar valor y observaciones de una novedad (solo si periodo no aprobado)
 */
export async function editarNovedad(id: number, valor_total: number, observaciones: string): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [novedad] = await pool.execute<any[]>(
            'SELECT NO_PERIODO_MES, NO_PERIODO_ANIO FROM OS_NOVEDADES WHERE NO_IDNOVEDAD_PK = ?',
            [id]
        );

        if (novedad.length === 0) return { success: false, message: 'Novedad no encontrada.' };

        if (await isPeriodoBloqueado(novedad[0].NO_PERIODO_MES, novedad[0].NO_PERIODO_ANIO)) {
            return { success: false, message: 'No se puede editar una novedad de un periodo aprobado.' };
        }

        await pool.execute(
            'UPDATE OS_NOVEDADES SET NO_VALOR_TOTAL = ?, NO_OBSERVACIONES = ? WHERE NO_IDNOVEDAD_PK = ?',
            [valor_total, observaciones, id]
        );

        revalidatePath('/inicio/nomina/novedades');
        return { success: true, message: 'Novedad actualizada.' };
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
