'use server';

import { executeQuery, getConnection } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getAuthUser } from '@/lib/auth';
import { ROLE_CODES } from '@/lib/constants';

export async function getTodasLasPreguntasAction() {
    try {
        const queryPreguntas = `
            SELECT 
                p.PA_IDPREGUNTA_PK as id, 
                p.PA_TEXTO as texto, 
                p.PA_TIPO as tipo, 
                p.PA_SECCION as seccion, 
                p.PA_OBLIGATORIA as obligatoria, 
                p.PA_ACTIVO as activo, 
                p.PA_ORDEN as orden,
                (SELECT COUNT(*) FROM OS_RESPUESTAS_AUTORREPORTE r WHERE r.PA_IDPREGUNTA_FK = p.PA_IDPREGUNTA_PK) as total_respuestas
            FROM OS_PREGUNTAS_AUTORREPORTE p
            ORDER BY p.PA_ORDEN ASC
        `;
        const preguntas = await executeQuery(queryPreguntas) as any[];

        const queryOpciones = `SELECT OP_IDOPCION_PK as id, PA_IDPREGUNTA_FK as pregunta_id, OP_TEXTO as texto, OP_VALOR as valor, OP_ORDEN as orden FROM OS_OPCIONES_PREGUNTA WHERE OP_ACTIVO = 1 ORDER BY OP_ORDEN ASC`;
        const opciones = await executeQuery(queryOpciones) as any[];

        const preguntasConOpciones = preguntas.map(p => ({
            ...p,
            obligatoria: Boolean(p.obligatoria),
            activo: Boolean(p.activo),
            has_respuestas: p.total_respuestas > 0,
            opciones: opciones.filter(o => o.pregunta_id === p.id)
        }));

        return { success: true, data: preguntasConOpciones };
    } catch (error: any) {
        console.error('[Preguntas Actions] Error al obtener preguntas:', error);
        return { success: false, message: 'Error al cargar preguntas' };
    }
}

export async function crearPreguntaAction(data: { texto: string, tipo: string, obligatoria: boolean, opciones?: { texto: string, valor: string }[] }) {
    try {
        const payload = await getAuthUser();
        if (payload?.role !== ROLE_CODES.ADMIN && payload?.role !== ROLE_CODES.HR) {
            return { success: false, message: 'No tienes permisos para esta acción' };
        }

        const connection = await getConnection();
        
        try {
            await connection.beginTransaction();

            const rows = await connection.execute(`SELECT COALESCE(MAX(PA_ORDEN), 0) + 1 as nextOrden FROM OS_PREGUNTAS_AUTORREPORTE`) as any[];
            const nextOrden = rows[0]?.nextOrden || 1;

            const result = await connection.execute(
                `INSERT INTO OS_PREGUNTAS_AUTORREPORTE (PA_TEXTO, PA_TIPO, PA_SECCION, PA_OBLIGATORIA, PA_ORDEN, PA_ACTIVO) VALUES (?, ?, ?, ?, ?, 1)`,
                [data.texto, data.tipo, 'GENERAL', data.obligatoria ? 1 : 0, nextOrden]
            ) as any;
            
            const preguntaId = result.insertId;

            if (data.tipo === 'RADIO' && data.opciones && data.opciones.length > 0) {
                for (let i = 0; i < data.opciones.length; i++) {
                    const opt = data.opciones[i];
                    await connection.execute(
                        `INSERT INTO OS_OPCIONES_PREGUNTA (PA_IDPREGUNTA_FK, OP_TEXTO, OP_VALOR, OP_ORDEN, OP_ACTIVO) VALUES (?, ?, ?, ?, 1)`,
                        [preguntaId, opt.texto, opt.valor, i + 1]
                    );
                }
            }

            await connection.commit();
            revalidatePath('/inicio/seguimiento-os');
            revalidatePath('/autorreporte');
            return { success: true, message: 'Pregunta creada exitosamente' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('[Preguntas Actions] Error al crear pregunta:', error);
        return { success: false, message: 'Error al crear la pregunta' };
    }
}

export async function actualizarPreguntaAction(id: number, data: { texto: string, tipo: string, obligatoria: boolean, activo: boolean, opciones?: { id?: number, texto: string, valor: string }[] }) {
    try {
        const payload = await getAuthUser();
        if (payload?.role !== ROLE_CODES.ADMIN && payload?.role !== ROLE_CODES.HR) {
            return { success: false, message: 'No tienes permisos' };
        }

        const connection = await getConnection();
        
        try {
            await connection.beginTransaction();

            await connection.execute(
                `UPDATE OS_PREGUNTAS_AUTORREPORTE SET PA_TEXTO = ?, PA_TIPO = ?, PA_OBLIGATORIA = ?, PA_ACTIVO = ? WHERE PA_IDPREGUNTA_PK = ?`,
                [data.texto, data.tipo, data.obligatoria ? 1 : 0, data.activo ? 1 : 0, id]
            );

            if (data.tipo === 'RADIO') {
                await connection.execute(`UPDATE OS_OPCIONES_PREGUNTA SET OP_ACTIVO = 0 WHERE PA_IDPREGUNTA_FK = ?`, [id]);
                
                if (data.opciones && data.opciones.length > 0) {
                    for (let i = 0; i < data.opciones.length; i++) {
                        const opt = data.opciones[i];
                        if (opt.id) {
                            await connection.execute(
                                `UPDATE OS_OPCIONES_PREGUNTA SET OP_TEXTO = ?, OP_VALOR = ?, OP_ORDEN = ?, OP_ACTIVO = 1 WHERE OP_IDOPCION_PK = ? AND PA_IDPREGUNTA_FK = ?`,
                                [opt.texto, opt.valor, i + 1, opt.id, id]
                            );
                        } else {
                            await connection.execute(
                                `INSERT INTO OS_OPCIONES_PREGUNTA (PA_IDPREGUNTA_FK, OP_TEXTO, OP_VALOR, OP_ORDEN, OP_ACTIVO) VALUES (?, ?, ?, ?, 1)`,
                                [id, opt.texto, opt.valor, i + 1]
                            );
                        }
                    }
                }
            } else {
                await connection.execute(`UPDATE OS_OPCIONES_PREGUNTA SET OP_ACTIVO = 0 WHERE PA_IDPREGUNTA_FK = ?`, [id]);
            }

            await connection.commit();
            revalidatePath('/inicio/seguimiento-os');
            revalidatePath('/autorreporte');
            return { success: true, message: 'Pregunta actualizada' };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('[Preguntas Actions] Error al actualizar pregunta:', error);
        return { success: false, message: 'Error al actualizar' };
    }
}

export async function togglePreguntaAction(id: number, nuevoEstado: boolean) {
    try {
        const payload = await getAuthUser();
        if (payload?.role !== ROLE_CODES.ADMIN && payload?.role !== ROLE_CODES.HR) {
            return { success: false, message: 'No tienes permisos' };
        }

        await executeQuery(
            `UPDATE OS_PREGUNTAS_AUTORREPORTE SET PA_ACTIVO = ? WHERE PA_IDPREGUNTA_PK = ?`,
            [nuevoEstado ? 1 : 0, id]
        );
        
        revalidatePath('/inicio/seguimiento-os');
        revalidatePath('/autorreporte');
        return { success: true, message: `Pregunta ${nuevoEstado ? 'activada' : 'desactivada'}` };
    } catch (error: any) {
        console.error('[Preguntas Actions] Error al cambiar estado:', error);
        return { success: false, message: 'Error al cambiar estado' };
    }
}

export async function actualizarOrdenPreguntasAction(preguntasIds: number[]) {
    try {
        const payload = await getAuthUser();
        if (payload?.role !== ROLE_CODES.ADMIN && payload?.role !== ROLE_CODES.HR) return { success: false };

        const connection = await getConnection();
        try {
            await connection.beginTransaction();
            for (let i = 0; i < preguntasIds.length; i++) {
                await connection.execute(
                    `UPDATE OS_PREGUNTAS_AUTORREPORTE SET PA_ORDEN = ? WHERE PA_IDPREGUNTA_PK = ?`,
                    [i + 1, preguntasIds[i]]
                );
            }
            await connection.commit();
            revalidatePath('/inicio/seguimiento-os');
            revalidatePath('/autorreporte');
            return { success: true };
        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }
    } catch (error) {
        return { success: false, message: 'Error al reordenar' };
    }
}

export async function eliminarPreguntaAction(id: number) {
    try {
        const payload = await getAuthUser();
        if (payload?.role !== ROLE_CODES.ADMIN && payload?.role !== ROLE_CODES.HR) {
            return { success: false, message: 'No tienes permisos' };
        }

        const connection = await getConnection();
        try {
            await connection.beginTransaction();

            const rows = await connection.execute(
                `SELECT COUNT(*) as total FROM OS_RESPUESTAS_AUTORREPORTE WHERE PA_IDPREGUNTA_FK = ?`,
                [id]
            ) as any[];

            if (rows[0].total > 0) {
                return { success: false, message: 'No se puede eliminar: tiene respuestas asociadas. Inactívala en su lugar.' };
            }

            await connection.execute(`DELETE FROM OS_OPCIONES_PREGUNTA WHERE PA_IDPREGUNTA_FK = ?`, [id]);
            await connection.execute(`DELETE FROM OS_PREGUNTAS_AUTORREPORTE WHERE PA_IDPREGUNTA_PK = ?`, [id]);

            await connection.commit();
            revalidatePath('/inicio/seguimiento-os');
            revalidatePath('/autorreporte');
            return { success: true, message: 'Pregunta eliminada permanentemente' };
        } catch (e) {
            await connection.rollback();
            throw e;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('[Preguntas Actions] Error al eliminar:', error);
        return { success: false, message: 'Error al eliminar la pregunta' };
    }
}

