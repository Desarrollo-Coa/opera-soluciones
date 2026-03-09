'use server'

import { pool } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { RowDataPacket } from 'mysql2/promise';

// --- Tipos (columnas OS_PARAMETROS_NOMINA migración 007) ---
export interface ParametrosRow extends RowDataPacket {
    id: number;
    ano_vigencia: number;
    smmlv: number;
    auxilio_transporte: number;
    horas_semanales_maximas: number;
    horas_mensuales_promedio: number;
}

export type ActionResponse<T> = {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
};

// --- Schema de Validación ---
const parametrosSchema = z.object({
    id: z.coerce.number().optional(),
    ano_vigencia: z.coerce.number().min(2020).max(2100, "Año inválido"),
    smmlv: z.coerce.number().min(1, "El SMMLV debe ser mayor a 0"),
    auxilio_transporte: z.coerce.number().min(0, "El auxilio no puede ser negativo"),
    horas_semanales_maximas: z.coerce.number().min(1).max(168),
    horas_mensuales_promedio: z.coerce.number().min(1).max(744),
});

/**
 * Obtiene los parámetros del año más reciente
 * Migración 007: OS_PARAMETROS_NOMINA con columnas PN_
 */
export async function getUltimosParametrosAction(): Promise<ActionResponse<ParametrosRow>> {
    try {
        const [rows] = await pool.execute<ParametrosRow[]>(
            `SELECT
                PN_IDPARAMETRO_PK        as id,
                PN_ANIO_VIGENCIA         as ano_vigencia,
                PN_SMMLV                 as smmlv,
                PN_AUXILIO_TRANSPORTE    as auxilio_transporte,
                PN_HORAS_SEMANALES_MAX   as horas_semanales_maximas,
                PN_HORAS_MENSUALES_PROM  as horas_mensuales_promedio
             FROM OS_PARAMETROS_NOMINA
             ORDER BY PN_ANIO_VIGENCIA DESC LIMIT 1`
        );

        if (rows.length === 0) {
            return { success: false, message: 'No hay parámetros configurados aún.' };
        }

        return { success: true, data: rows[0] };
    } catch (error: any) {
        console.error('Error fetching parametros:', error);
        return { success: false, message: 'Error de base de datos al obtener parámetros.' };
    }
}

/**
 * Obtiene el historial completo de parámetros
 * Migración 007: OS_PARAMETROS_NOMINA con columnas PN_
 */
export async function getAllParametrosAction(): Promise<ActionResponse<ParametrosRow[]>> {
    try {
        const [rows] = await pool.execute<ParametrosRow[]>(
            `SELECT
                PN_IDPARAMETRO_PK        as id,
                PN_ANIO_VIGENCIA         as ano_vigencia,
                PN_SMMLV                 as smmlv,
                PN_AUXILIO_TRANSPORTE    as auxilio_transporte,
                PN_HORAS_SEMANALES_MAX   as horas_semanales_maximas,
                PN_HORAS_MENSUALES_PROM  as horas_mensuales_promedio
             FROM OS_PARAMETROS_NOMINA
             ORDER BY PN_ANIO_VIGENCIA DESC`
        );

        return { success: true, data: rows };
    } catch (error: any) {
        console.error('Error fetching todos los parametros:', error);
        return { success: false, message: 'Error de base de datos.' };
    }
}

/**
 * Verifica si un año tiene al menos una nómina en estado 'Calculado' o 'Aprobado'.
 */
async function isAnioBloqueado(anio: number): Promise<boolean> {
    const [rows] = await pool.execute<any[]>(
        'SELECT 1 FROM OS_LIQUIDACIONES WHERE LQ_PERIODO_ANIO = ? AND LQ_ESTADO = "Calculado" LIMIT 1',
        [anio]
    );
    return rows.length > 0;
}

/**
 * Guarda o actualiza los parámetros para un año específico
 * Migración 007: nombre de columnas PN_ANIO_VIGENCIA, PN_SMMLV, etc.
 */
export async function upsertParametrosAction(
    prevState: any,
    formData: FormData
): Promise<ActionResponse<void>> {
    try {
        const rawData: any = {};

        // Limpiamos strings de moneda ($ 1.234.567 -> 1234567)
        formData.forEach((value, key) => {
            if (typeof value === 'string' && (key === 'smmlv' || key === 'auxilio_transporte')) {
                rawData[key] = value.replace(/\$|\.|\ /g, '').replace(',', '.');
            } else {
                rawData[key] = value;
            }
        });

        const validatedData = parametrosSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Por favor, corrige los errores del formulario.',
                errors: validatedData.error.flatten().fieldErrors,
            };
        }

        const { ano_vigencia, smmlv, auxilio_transporte, horas_semanales_maximas, horas_mensuales_promedio } = validatedData.data;

        // --- BLOQUEO DE SEGURIDAD ---
        if (await isAnioBloqueado(ano_vigencia)) {
            return {
                success: false,
                message: `No se pueden modificar los parámetros del año ${ano_vigencia} porque ya existen nóminas en revisión o aprobadas. Debe anular dichas nóminas para poder realizar cambios globales.`
            };
        }

        // Verificar si el año ya existe
        const [existing] = await pool.execute<ParametrosRow[]>(
            `SELECT PN_IDPARAMETRO_PK as id FROM OS_PARAMETROS_NOMINA WHERE PN_ANIO_VIGENCIA = ?`,
            [ano_vigencia]
        );

        if (existing.length > 0) {
            // UPDATE
            await pool.execute(
                `UPDATE OS_PARAMETROS_NOMINA 
          SET PN_SMMLV = ?, PN_AUXILIO_TRANSPORTE = ?, PN_HORAS_SEMANALES_MAX = ?, PN_HORAS_MENSUALES_PROM = ?
          WHERE PN_ANIO_VIGENCIA = ?`,
                [smmlv, auxilio_transporte, horas_semanales_maximas, horas_mensuales_promedio, ano_vigencia]
            );
        } else {
            // INSERT
            await pool.execute(
                `INSERT INTO OS_PARAMETROS_NOMINA 
          (PN_ANIO_VIGENCIA, PN_SMMLV, PN_AUXILIO_TRANSPORTE, PN_HORAS_SEMANALES_MAX, PN_HORAS_MENSUALES_PROM) 
          VALUES (?, ?, ?, ?, ?)`,
                [ano_vigencia, smmlv, auxilio_transporte, horas_semanales_maximas, horas_mensuales_promedio]
            );
        }

        revalidatePath('/inicio/nomina/parametros');
        revalidatePath('/inicio/nomina/liquidaciones');

        return { success: true, message: 'Parámetros guardados exitosamente.' };
    } catch (error: any) {
        console.error('Error upserting parametros:', error);
        return { success: false, message: 'Ocurrió un error inesperado al guardar base de datos.' };
    }
}
