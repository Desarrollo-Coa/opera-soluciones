'use server'

import { pool } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from '@/types/actions';
import { ClausulaRow, UsuarioClausulaRow } from '@/types/db';
import { clausulaSchema, usuarioClausulaSchema, ClausulaInput, UsuarioClausulaInput } from '@/lib/validations';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/**
 * Helper: Verifica si una cláusula de usuario está bloqueada por una nómina generada o aprobada
 */
async function isUsuarioClausulaLocked(usuarioId: number, fechaInicio: string | Date, fechaFin: string | Date | null): Promise<boolean> {
    const [liquidaciones] = await pool.execute<any[]>(
        `SELECT LQ_IDLIQUIDACION_PK, LQ_QUINCENA, LQ_PERIODO_MES, LQ_PERIODO_ANIO 
         FROM OS_LIQUIDACIONES 
         WHERE US_IDUSUARIO_FK = ? AND LQ_ESTADO IN ('Calculado', 'Aprobado')`,
        [usuarioId]
    );

    const cStart = new Date(fechaInicio);
    const cEnd = fechaFin ? new Date(fechaFin) : new Date(2100, 0, 1); // Fecha muy lejana si es indefinida

    for (const liq of liquidaciones) {
        const qStart = new Date(liq.LQ_PERIODO_ANIO, liq.LQ_PERIODO_MES - 1, liq.LQ_QUINCENA === 1 ? 1 : 16);
        const qEnd = new Date(liq.LQ_PERIODO_ANIO, liq.LQ_PERIODO_MES - 1, liq.LQ_QUINCENA === 1 ? 15 : new Date(liq.LQ_PERIODO_ANIO, liq.LQ_PERIODO_MES, 0).getDate());

        if (Math.max(qStart.getTime(), cStart.getTime()) <= Math.min(qEnd.getTime(), cEnd.getTime())) {
            return true;
        }
    }
    return false;
}

export async function getClausulasMaster(): Promise<ActionResponse<ClausulaRow[]>> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<ClausulaRow[]>(
            `SELECT 
                CL_IDCLAUSULA_PK as id,
                CL_NOMBRE as nombre,
                CL_DESCRIPCION as descripcion,
                CN_IDCONCEPTO_FK as concepto_id,
                CL_ACTIVO as activo
             FROM OS_CLAUSULAS ORDER BY CL_NOMBRE ASC`
        );
        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Crear o editar una cláusula maestra
 */
export async function upsertClausulaMaster(data: ClausulaInput, id?: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    const validated = clausulaSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, message: 'Datos inválidos', errors: validated.error.flatten().fieldErrors };
    }

    const { nombre, descripcion, concepto_id, activo } = validated.data;

    try {
        if (id) {
            await pool.execute(
                `UPDATE OS_CLAUSULAS SET CL_NOMBRE=?, CL_DESCRIPCION=?, CN_IDCONCEPTO_FK=?, CL_ACTIVO=? WHERE CL_IDCLAUSULA_PK=?`,
                [nombre, descripcion, concepto_id, activo ? 1 : 0, id]
            );
        } else {
            await pool.execute(
                `INSERT INTO OS_CLAUSULAS (CL_NOMBRE, CL_DESCRIPCION, CN_IDCONCEPTO_FK, CL_ACTIVO, CL_CREADO_POR) VALUES (?, ?, ?, ?, ?)`,
                [nombre, descripcion, concepto_id, activo ? 1 : 0, user.id]
            );
        }
        revalidatePath('/inicio/nomina/clausulas');
        return { success: true, message: id ? 'Cláusula actualizada' : 'Cláusula creada' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener cláusulas asignadas a un usuario
 */
export async function getClausulasUsuario(usuarioId: number): Promise<ActionResponse<UsuarioClausulaRow[]>> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<UsuarioClausulaRow[]>(
            `SELECT 
                uc.UC_IDUSUARIOCLAUSULA_PK as id,
                uc.US_IDUSUARIO_FK as usuario_id,
                uc.CL_IDCLAUSULA_FK as clausula_id,
                uc.UC_MONTO_MENSUAL as monto_mensual,
                uc.UC_FECHA_INICIO as fecha_inicio,
                uc.UC_FECHA_FIN as fecha_fin,
                uc.UC_ACTIVO as activo,
                uc.UC_NOTAS_AUDITORIA as notas_auditoria,
                cl.CL_NOMBRE as nombre_clausula
             FROM OS_USUARIOS_CLAUSULAS uc
             JOIN OS_CLAUSULAS cl ON uc.CL_IDCLAUSULA_FK = cl.CL_IDCLAUSULA_PK
             WHERE uc.US_IDUSUARIO_FK = ?`,
            [usuarioId]
        );
        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Asignar o editar cláusula a un usuario
 */
export async function upsertUsuarioClausula(data: UsuarioClausulaInput, id?: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    const validated = usuarioClausulaSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, message: 'Datos inválidos', errors: validated.error.flatten().fieldErrors };
    }

    const { usuario_id, clausula_id, monto_mensual, fecha_inicio, fecha_fin, activo, notas_auditoria } = validated.data;

    try {
        if (id) {
            // Verificar si la versión actual está bloqueada
            const [current] = await pool.execute<any[]>('SELECT UC_FECHA_INICIO, UC_FECHA_FIN FROM OS_USUARIOS_CLAUSULAS WHERE UC_IDUSUARIOCLAUSULA_PK = ?', [id]);
            if (current.length > 0) {
                // Asegurar que fecha_fin sea null si no existe
                const currentFin = current[0].UC_FECHA_FIN ?? null;
                if (await isUsuarioClausulaLocked(usuario_id, current[0].UC_FECHA_INICIO, currentFin)) {
                    throw new Error("No se puede editar: la cláusula se solapa con una nómina ya generada o aprobada.");
                }
            }

            await pool.execute(
                `UPDATE OS_USUARIOS_CLAUSULAS SET CL_IDCLAUSULA_FK=?, UC_MONTO_MENSUAL=?, UC_FECHA_INICIO=?, UC_FECHA_FIN=?, UC_ACTIVO=?, UC_NOTAS_AUDITORIA=? WHERE UC_IDUSUARIOCLAUSULA_PK=?`,
                [clausula_id, monto_mensual, fecha_inicio, fecha_fin, activo ? 1 : 0, notas_auditoria, id]
            );
        } else {
            // Para nuevas asignaciones, verificar si el rango propuesto toca una nomina ya generada
            if (await isUsuarioClausulaLocked(usuario_id, fecha_inicio, fecha_fin ?? null)) {
                throw new Error("No se puede asignar: el rango de fechas se solapa con una nómina ya generada o aprobada.");
            }

            await pool.execute(
                `INSERT INTO OS_USUARIOS_CLAUSULAS (US_IDUSUARIO_FK, CL_IDCLAUSULA_FK, UC_MONTO_MENSUAL, UC_FECHA_INICIO, UC_FECHA_FIN, UC_ACTIVO, UC_NOTAS_AUDITORIA, UC_CREADO_POR) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [usuario_id, clausula_id, monto_mensual, fecha_inicio, fecha_fin, activo ? 1 : 0, notas_auditoria, user.id]
            );
        }
        revalidatePath(`/inicio/empleados`);
        revalidatePath(`/inicio/nomina/clausulas`);
        return { success: true, message: id ? 'Asignación actualizada' : 'Cláusula asignada' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Eliminar una asignación de cláusula
 */
export async function deleteUsuarioClausula(id: number): Promise<ActionResponse> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [current] = await pool.execute<any[]>('SELECT US_IDUSUARIO_FK, UC_FECHA_INICIO, UC_FECHA_FIN FROM OS_USUARIOS_CLAUSULAS WHERE UC_IDUSUARIOCLAUSULA_PK = ?', [id]);
        if (current.length > 0) {
            const currentFin = current[0].UC_FECHA_FIN ?? null;
            if (await isUsuarioClausulaLocked(current[0].US_IDUSUARIO_FK, current[0].UC_FECHA_INICIO, currentFin)) {
                throw new Error("No se puede eliminar: la cláusula está asociada a una nómina ya generada o aprobada.");
            }
        }

        await pool.execute('DELETE FROM OS_USUARIOS_CLAUSULAS WHERE UC_IDUSUARIOCLAUSULA_PK = ?', [id]);
        revalidatePath(`/inicio/empleados`);
        return { success: true, message: 'Asignación eliminada' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener todos los conceptos de nómina para selects
 */
export async function getConceptosAction(): Promise<ActionResponse<any[]>> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<any[]>(
            'SELECT CN_IDCONCEPTO_PK as id, CN_NOMBRE as nombre, CN_TIPO as tipo FROM OS_CONCEPTOS_NOMINA ORDER BY CN_IDCONCEPTO_PK ASC'
        );
        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

/**
 * Obtener valores comunes usados para una cláusula (Sugerencias) en otros empleados
 */
export async function getValoresComunesAction(clausulaId: number): Promise<ActionResponse<number[]>> {
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'No autorizado' };

    try {
        const [rows] = await pool.execute<any[]>(
            `SELECT DISTINCT UC_MONTO_MENSUAL as monto 
             FROM OS_USUARIOS_CLAUSULAS 
             WHERE CL_IDCLAUSULA_FK = ? AND UC_ACTIVO = 1
             ORDER BY monto DESC
             LIMIT 5`,
            [clausulaId]
        );
        return { success: true, data: rows.map(r => Number(r.monto)) };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
