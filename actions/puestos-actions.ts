'use server';

import { pool } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Puesto, PuestoRow, HistorialPuesto, HistorialPuestoRow } from '@/types/puestos';

// Schema para Puesto
const PuestoSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(150),
    direccion: z.string().max(255).optional().nullable(),
    ciudad: z.string().max(100).optional().nullable(),
    notas: z.string().optional().nullable(),
    activo: z.boolean().default(true),
});

export type PuestoActionState = {
    success: boolean;
    data?: Puesto | Puesto[];
    errors?: Record<string, string[]>;
    message?: string;
};

// ==========================================
// 1. OBTENER TODOS LOS PUESTOS
// ==========================================
export async function getPuestosAction(soloActivos: boolean = false): Promise<PuestoActionState> {
    try {
        let query = 'SELECT * FROM OS_PUESTOS';
        if (soloActivos) {
            query += ' WHERE PU_ACTIVO = 1';
        }
        query += ' ORDER BY PU_NOMBRE ASC';
        
        const [rows] = await pool.execute<PuestoRow[]>(query);
        
        const puestos: Puesto[] = rows.map(row => ({
            id: row.PU_IDPUESTO_PK,
            nombre: row.PU_NOMBRE,
            direccion: row.PU_DIRECCION,
            ciudad: row.PU_CIUDAD,
            notas: row.PU_NOTAS,
            activo: row.PU_ACTIVO === 1,
            fecha_creacion: new Date(row.PU_FECHA_CREACION).toISOString(),
            creado_por: row.PU_CREADO_POR,
        }));
        
        return { success: true, data: puestos };
    } catch (error) {
        console.error("Error obteniendo puestos:", error);
        return { success: false, message: "Error al cargar los puestos de trabajo" };
    }
}

// ==========================================
// 2. CREAR UN PUESTO
// ==========================================
export async function createPuestoAction(
    prevState: PuestoActionState, 
    formData: FormData
): Promise<PuestoActionState> {
    const validData = PuestoSchema.safeParse({
        nombre: formData.get('nombre'),
        direccion: formData.get('direccion') || null,
        ciudad: formData.get('ciudad') || null,
        notas: formData.get('notas') || null,
        activo: formData.get('activo') === 'true' || formData.get('activo') === 'on',
    });

    if (!validData.success) {
        return {
            success: false,
            errors: validData.error.flatten().fieldErrors,
            message: "Por favor revisa los datos ingresados"
        };
    }

    try {
        // FIXME: Obtener el ID del usuario real desde la sesión cuando esté implementada. Usamos 1 por defecto por ahora.
        const CREADO_POR = 1; 

        await pool.execute(
            'INSERT INTO OS_PUESTOS (PU_NOMBRE, PU_DIRECCION, PU_CIUDAD, PU_NOTAS, PU_ACTIVO, PU_CREADO_POR) ' +
             'VALUES (?, ?, ?, ?, ?, ?)',
            [
                validData.data.nombre,
                validData.data.direccion,
                validData.data.ciudad,
                validData.data.notas,
                validData.data.activo ? 1 : 0,
                CREADO_POR
            ]
        );
        
        revalidatePath('/inicio/puestos');
        revalidatePath('/inicio/empleados');
        
        return { success: true, message: "Puesto de trabajo creado exitosamente" };
    } catch (error) {
        console.error("Error creando puesto:", error);
        return { success: false, message: "Error interno del servidor al crear el puesto" };
    }
}

// ==========================================
// 3. ACTUALIZAR UN PUESTO
// ==========================================
export async function updatePuestoAction(
    id: number,
    prevState: PuestoActionState,
    formData: FormData
): Promise<PuestoActionState> {
    const validData = PuestoSchema.safeParse({
        nombre: formData.get('nombre'),
        direccion: formData.get('direccion') || null,
        ciudad: formData.get('ciudad') || null,
        notas: formData.get('notas') || null,
        activo: formData.get('activo') === 'true' || formData.get('activo') === 'on',
    });

    if (!validData.success) {
        return {
            success: false,
            errors: validData.error.flatten().fieldErrors,
            message: "Por favor revisa los datos ingresados"
        };
    }

    try {
        await pool.execute(
            'UPDATE OS_PUESTOS ' +
             'SET PU_NOMBRE = ?, PU_DIRECCION = ?, PU_CIUDAD = ?, PU_NOTAS = ?, PU_ACTIVO = ? ' +
             'WHERE PU_IDPUESTO_PK = ?',
            [
                validData.data.nombre,
                validData.data.direccion,
                validData.data.ciudad,
                validData.data.notas,
                validData.data.activo ? 1 : 0,
                id
            ]
        );
        
        revalidatePath('/inicio/puestos');
        revalidatePath('/inicio/empleados');
        return { success: true, message: "Puesto actualizado exitosamente" };
    } catch (error) {
        console.error("Error actualizando puesto:", error);
        return { success: false, message: "Error interno al actualizar el puesto" };
    }
}

// ==========================================
// 4. ELIMINAR UN PUESTO (Soft o Hard Delete dependiendo si está en uso)
// ==========================================
export async function deletePuestoAction(id: number): Promise<PuestoActionState> {
    try {
        // Verificar si el puesto está asignado actualmente a algún usuario
        const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM OS_USUARIOS WHERE PU_IDPUESTO_FK = ?', 
            [id]
        );
        
        // Verificar si está en el historial
        const [history] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM OS_HISTORIAL_PUESTOS WHERE PU_IDPUESTO_FK = ?', 
            [id]
        );
        
        if (users[0].count > 0 || history[0].count > 0) {
            // Soft delete: solo lo inactivamos
            await pool.execute('UPDATE OS_PUESTOS SET PU_ACTIVO = 0 WHERE PU_IDPUESTO_PK = ?', [id]);
            revalidatePath('/inicio/puestos');
            return { success: true, message: "Puesto inactivado (no se borró por completo porque está en uso)" };
        } else {
            // Hard delete
            await pool.execute('DELETE FROM OS_PUESTOS WHERE PU_IDPUESTO_PK = ?', [id]);
            revalidatePath('/inicio/puestos');
            return { success: true, message: "Puesto eliminado exitosamente" };
        }
    } catch (error) {
        console.error("Error eliminando puesto:", error);
        return { success: false, message: "Error interno al eliminar el puesto" };
    }
}

// ==========================================
// 5. ASIGNAR PUESTO A UN EMPLEADO
// ==========================================
export async function asignarPuestoEmpleadoAction(
    empleadoId: number, 
    nuevoPuestoId: number | null, 
    notasCambio: string = "",
    fechaInicio?: string | null,
    fechaFinAnterior?: string | null
): Promise<PuestoActionState> {
    try {
        // 1. Obtener el puesto actual
        const [currentUser] = await pool.execute<RowDataPacket[]>(
            'SELECT PU_IDPUESTO_FK FROM OS_USUARIOS WHERE US_IDUSUARIO_PK = ?',
            [empleadoId]
        );

        if (currentUser.length === 0) {
            return { success: false, message: "Empleado no encontrado" };
        }

        const puestoActualId = currentUser[0].PU_IDPUESTO_FK;

        // Si no ha cambiado, no hacemos nada
        if (puestoActualId === nuevoPuestoId) {
            return { success: true, message: "El empleado ya tiene asignado ese puesto" };
        }

        // FIXME: Usar usuario de sesión.
        const CREADO_POR = 1;

        // Iniciar transacción (manualmente con connection)
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 2. Actualizar el usuario
            await connection.execute(
                'UPDATE OS_USUARIOS SET PU_IDPUESTO_FK = ? WHERE US_IDUSUARIO_PK = ?',
                [nuevoPuestoId, empleadoId]
            );

            // Cerrar el puesto anterior si se proporcionó una fecha
            if (fechaFinAnterior) {
                await connection.execute(
                    'UPDATE OS_HISTORIAL_PUESTOS SET HP_FECHA_FIN = ? WHERE US_IDUSUARIO_FK = ? AND HP_FECHA_FIN IS NULL',
                    [fechaFinAnterior, empleadoId]
                );
            }

            // 3. Registrar en el historial si asignaron uno nuevo
            if (nuevoPuestoId) {
                const fInicio = fechaInicio || new Date().toISOString().split('T')[0];
                await connection.execute(
                    'INSERT INTO OS_HISTORIAL_PUESTOS ' +
                     '(US_IDUSUARIO_FK, PU_IDPUESTO_FK, HP_FECHA_ASIGNACION, HP_CREADO_POR, HP_NOTAS) ' +
                     'VALUES (?, ?, ?, ?, ?)',
                    [empleadoId, nuevoPuestoId, fInicio, CREADO_POR, notasCambio || null]
                );
            }

            await connection.commit();
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }

        revalidatePath('/inicio/empleados');
        revalidatePath(`/inicio/empleados/${empleadoId}`);
        
        return { success: true, message: "Puesto actualizado exitosamente" };
    } catch (error) {
        console.error("Error asignando puesto:", error);
        return { success: false, message: "Error interno al asignar el puesto" };
    }
}

// ==========================================
// 6. OBTENER HISTORIAL DE PUESTOS DE UN EMPLEADO
// ==========================================
export async function getHistorialPuestosAction(empleadoId: number): Promise<{ success: boolean, data?: HistorialPuesto[], message?: string }> {
    try {
        const query = 'SELECT H.HP_IDHISTORIAL_PK, H.US_IDUSUARIO_FK, H.PU_IDPUESTO_FK, H.HP_FECHA_ASIGNACION, H.HP_FECHA_FIN, H.HP_FECHA_ACCION, H.HP_CREADO_POR, H.HP_NOTAS, P.PU_NOMBRE, U.US_NOMBRE as CREADOR_NOMBRE, U.US_APELLIDO as CREADOR_APELLIDO FROM OS_HISTORIAL_PUESTOS H JOIN OS_PUESTOS P ON H.PU_IDPUESTO_FK = P.PU_IDPUESTO_PK JOIN OS_USUARIOS U ON H.HP_CREADO_POR = U.US_IDUSUARIO_PK WHERE H.US_IDUSUARIO_FK = ? ORDER BY H.HP_FECHA_ASIGNACION DESC';
        
        const [rows] = await pool.execute<HistorialPuestoRow[]>(query, [empleadoId]);
        
        const historial: HistorialPuesto[] = rows.map(row => ({
            id: row.HP_IDHISTORIAL_PK,
            usuario_id: row.US_IDUSUARIO_FK,
            puesto_id: row.PU_IDPUESTO_FK,
            puesto_nombre: row.PU_NOMBRE || 'Desconocido',
            fecha_asignacion: new Date(row.HP_FECHA_ASIGNACION).toISOString(),
            fecha_fin: row.HP_FECHA_FIN ? new Date(row.HP_FECHA_FIN).toISOString() : null,
            fecha_accion: row.HP_FECHA_ACCION ? new Date(row.HP_FECHA_ACCION).toISOString() : new Date(row.HP_FECHA_ASIGNACION).toISOString(),
            creado_por: row.HP_CREADO_POR,
            creado_por_nombre: `${row.CREADOR_NOMBRE || ''} ${row.CREADOR_APELLIDO || ''}`.trim(),
            notas: row.HP_NOTAS
        }));
        
        return { success: true, data: historial };
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        return { success: false, message: "Error interno al cargar el historial" };
    }
}
