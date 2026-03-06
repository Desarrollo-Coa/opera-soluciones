'use server'

import { pool } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { RowDataPacket } from 'mysql2/promise';
import { ActionResponse } from './parametros-actions';
import { cookies } from 'next/headers';

// --- Tipos (nombres limpios exportados para el frontend) ---
export interface CargoRow extends RowDataPacket {
    id: number;
    nombre: string;
    sueldo_mensual_base: number;
    jornada_diaria_estandar: number;
    aplica_auxilio_transporte: boolean;
    clase_riesgo_arl: string;
    porcentaje_riesgo_arl: number;
    description: string | null;
    is_active: boolean;
    CA_CREADO_POR?: number;
}

// --- Schema de Validación (nombres de campo del formulario HTML sin cambio) ---
const cargoSchema = z.object({
    id: z.coerce.number().optional(),
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100),
    sueldo_mensual_base: z.coerce.number().min(1, "El sueldo base debe ser mayor a 0"),
    jornada_diaria_estandar: z.coerce.number().min(1).max(24),
    aplica_auxilio_transporte: z.coerce.boolean().default(false),
    clase_riesgo_arl: z.string().min(1, "Selecciona una clase de riesgo"),
    porcentaje_riesgo_arl: z.coerce.number().min(0, "Porcentaje inválido").max(100),
    description: z.string().optional().nullable(),
    is_active: z.coerce.boolean().default(true),
});

/**
 * Obtener listado de cargos
 */
export async function getCargosAction(): Promise<ActionResponse<any[]>> {
    try {
        const [rows] = await pool.execute(
            `SELECT 
                CA_IDCARGO_PK as id, 
                CA_NOMBRE as nombre, 
                CA_SUELDO_BASE as sueldo_mensual_base, 
                CA_JORNADA_DIARIA as jornada_diaria_estandar, 
                CA_APLICA_AUXILIO as aplica_auxilio_transporte, 
                CA_CLASE_RIESGO_ARL as clase_riesgo_arl, 
                CA_PORCENTAJE_RIESGO_ARL as porcentaje_riesgo_arl, 
                CA_DESCRIPCION as description, 
                CA_ACTIVO as is_active
             FROM OS_CARGOS 
             ORDER BY CA_NOMBRE ASC`
        );
        return { success: true, data: rows as any[] };
    } catch (error: any) {
        console.error('Error fetching cargos:', error);
        return { success: false, message: 'Error al cargar los cargos desde la base de datos.' };
    }
}

/**
 * Crear o actualizar un cargo
 * Migración 007: OS_CARGOS con columnas CA_
 */
export async function upsertCargoAction(
    prevState: any,
    formData: FormData
): Promise<ActionResponse<void>> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        let userId = 1;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.id) userId = parseInt(payload.id);
            } catch (e) { }
        }

        // Limpiar formato COP ($ 1.200.000 → 1200000)
        const rawSueldo = (formData.get('sueldo_mensual_base') as string | null) ?? '';
        const cleanSueldo = rawSueldo.replace(/\$|\.|,|\s/g, '').trim();

        const rawData = {
            id: formData.get('id') ? Number(formData.get('id')) : undefined,
            nombre: formData.get('nombre'),
            sueldo_mensual_base: cleanSueldo,
            jornada_diaria_estandar: formData.get('jornada_diaria_estandar'),
            aplica_auxilio_transporte: formData.get('aplica_auxilio_transporte') === 'on',
            clase_riesgo_arl: formData.get('clase_riesgo_arl'),
            porcentaje_riesgo_arl: formData.get('porcentaje_riesgo_arl'),
            description: formData.get('description'),
            is_active: formData.get('is_active') === 'on' || formData.get('is_active') === 'true',
        };

        const validatedData = cargoSchema.safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: 'Revisa los campos del formulario.',
                errors: validatedData.error.flatten().fieldErrors,
            };
        }

        const data = validatedData.data;

        // UPDATE si tiene ID
        if (data.id) {
            await pool.execute(
                `UPDATE OS_CARGOS 
         SET CA_NOMBRE = ?, CA_SUELDO_BASE = ?, CA_JORNADA_DIARIA = ?, 
             CA_APLICA_AUXILIO = ?, CA_CLASE_RIESGO_ARL = ?, CA_PORCENTAJE_RIESGO_ARL = ?, 
             CA_DESCRIPCION = ?, CA_ACTIVO = ?, CA_ACTUALIZADO_POR = ?
         WHERE CA_IDCARGO_PK = ?`,
                [
                    data.nombre, data.sueldo_mensual_base, data.jornada_diaria_estandar,
                    data.aplica_auxilio_transporte ? 1 : 0, data.clase_riesgo_arl, data.porcentaje_riesgo_arl,
                    data.description || null, data.is_active ? 1 : 0, userId,
                    data.id
                ]
            );
        } else {
            // INSERT
            await pool.execute(
                `INSERT INTO OS_CARGOS 
         (CA_NOMBRE, CA_SUELDO_BASE, CA_JORNADA_DIARIA, CA_APLICA_AUXILIO, 
          CA_CLASE_RIESGO_ARL, CA_PORCENTAJE_RIESGO_ARL, CA_DESCRIPCION, CA_ACTIVO, CA_CREADO_POR)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    data.nombre, data.sueldo_mensual_base, data.jornada_diaria_estandar,
                    data.aplica_auxilio_transporte ? 1 : 0, data.clase_riesgo_arl, data.porcentaje_riesgo_arl,
                    data.description || null, data.is_active ? 1 : 0, userId
                ]
            );
        }

        revalidatePath('/inicio/nomina/cargos');
        return { success: true, message: data.id ? 'Cargo actualizado.' : 'Cargo creado exitosamente.' };

    } catch (error: any) {
        console.error('Error upserting cargo:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'Ya existe un cargo con ese nombre.' };
        }
        return { success: false, message: 'Ocurrió un error en el servidor.' };
    }
}

/**
 * Eliminar un cargo (valida uso previo)
 * Migración 007: OS_CARGOS y OS_USUARIOS con nuevos nombres de columna
 */
export async function deleteCargoAction(id: number): Promise<ActionResponse<void>> {
    try {
        // Validar si hay empleados usándolo antes de borrar
        const [users] = await pool.execute<RowDataPacket[]>(
            `SELECT US_IDUSUARIO_PK FROM OS_USUARIOS WHERE CA_IDCARGO_FK = ? LIMIT 1`, [id]
        );

        if (users.length > 0) {
            return { success: false, message: 'No se puede eliminar el cargo porque hay empleados asignados a él. Puedes marcarlo como inactivo en su lugar.' };
        }

        await pool.execute(`DELETE FROM OS_CARGOS WHERE CA_IDCARGO_PK = ?`, [id]);
        revalidatePath('/inicio/nomina/cargos');
        return { success: true, message: 'Cargo eliminado correctamente.' };
    } catch (error: any) {
        console.error('Error deleting cargo:', error);
        return { success: false, message: 'Error al intentar eliminar el cargo.' };
    }
}
