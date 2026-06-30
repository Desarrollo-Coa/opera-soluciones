'use server'

import { revalidatePath, revalidateTag } from 'next/cache';
import { pool } from '@/lib/db';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { FinModule, FinModuleColumn, FinModuleDataRow, FinSheet, ActionResponse } from '../types/fin-modules';

// --- Esquemas de Validación (Zod) ---

const ModuleSchema = z.object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    description: z.string().optional()
});

const ColumnSchema = z.object({
    module_id: z.number(),
    sheet_id: z.number(),
    field_key: z.string().regex(/^[a-z0-9_]+$/, "Solo minúsculas y guiones bajos (ej: total_bruto)"),
    header_name: z.string().min(2, "Nombre de cabecera requerido"),
    field_type: z.enum(['text', 'number', 'date', 'select', 'currency', 'boolean']),
    options: z.array(z.string()).optional().nullable(),
    is_required: z.boolean().default(false),
    column_order: z.number().default(0),
    width: z.number().default(150),
});

const DataRowSchema = z.object({
    id: z.number().optional(),
    module_id: z.number(),
    sheet_id: z.number(),
    transaction_date: z.string().nullable().optional(), // Fecha opcional 
    row_data: z.record(z.any()), // Objeto dinámico de la fila Excel
});

const SheetSchema = z.object({
    module_id: z.number(),
    name: z.string().min(1, "Nombre de hoja requerido"),
    sheet_order: z.number().default(0)
});

// --- Server Actions (Módulos) ---

// Crear un nuevo módulo ("Nueva Hoja/Excel")
export async function createFinModuleAction(input: z.infer<typeof ModuleSchema>, userId: number): Promise<ActionResponse<FinModule>> {
    try {
        const validData = ModuleSchema.parse(input);
        const [result] = await pool.execute(
            `INSERT INTO FIN_MODULES (name, description, created_by) VALUES (?, ?, ?)`,
            [validData.name, validData.description || null, userId]
        );

        revalidatePath('/inicio/contable-v2');

        // Devolvemos el módulo recién creado
        const insertId = (result as any).insertId;

        // REGLA: Cada módulo (Libro) debe nacer con al menos una hoja (Pestaña)
        await pool.execute(
            `INSERT INTO FIN_MODULE_SHEETS (module_id, name, sheet_order) VALUES (?, ?, ?)`,
            [insertId, 'Hoja 1', 0]
        );

        const [rows] = await pool.execute<FinModule[]>(`SELECT * FROM FIN_MODULES WHERE id = ?`, [insertId]);

        return { success: true, data: rows[0] };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.flatten().fieldErrors };
        }
        return { success: false, message: error.message };
    }
}

// Eliminar un módulo completo con verificación de contraseña
export async function deleteFinModuleAction(moduleId: number, password: string, userId: number): Promise<ActionResponse> {
    try {
        // 1. Verificar contraseña del usuario
        const [userRows] = await pool.execute<any[]>(
            `SELECT US_PASSWORD_HASH FROM OS_USUARIOS WHERE US_IDUSUARIO_PK = ?`,
            [userId]
        );

        if (userRows.length === 0) return { success: false, message: "Usuario no encontrado" };

        const isPasswordCorrect = await bcrypt.compare(password, userRows[0].US_PASSWORD_HASH);
        if (!isPasswordCorrect) {
            return { success: false, message: "Contraseña incorrecta. No se pudo eliminar el módulo." };
        }

        // 2. Proceder con la eliminación (las tablas dependientes tienen ON DELETE CASCADE)
        await pool.execute(`DELETE FROM FIN_MODULES WHERE id = ?`, [moduleId]);

        revalidatePath('/inicio/contable-v2');
        return { success: true, message: "Módulo eliminado permanentemente" };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Obtener todos los módulos ("Listado de Excels")
export async function getFinModulesAction(): Promise<ActionResponse<FinModule[]>> {
    try {
        const [rows] = await pool.execute<FinModule[]>(
            `SELECT * FROM FIN_MODULES WHERE is_active = TRUE ORDER BY created_at DESC`
        );
        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Actualizar un módulo (Libro)
export async function updateFinModuleAction(moduleId: number, input: Partial<z.infer<typeof ModuleSchema>>): Promise<ActionResponse> {
    try {
        const validData = ModuleSchema.partial().parse(input);

        const updates: string[] = [];
        const params: any[] = [];

        if (validData.name) {
            updates.push(`name = ?`);
            params.push(validData.name);
        }
        if (validData.description !== undefined) {
            updates.push(`description = ?`);
            params.push(validData.description);
        }

        if (updates.length === 0) return { success: true };

        params.push(moduleId);
        await pool.execute(
            `UPDATE FIN_MODULES SET ${updates.join(', ')} WHERE id = ?`,
            params
        );

        revalidatePath('/inicio/contable-v2');
        revalidatePath(`/inicio/contable-v2/${moduleId}`);

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
export async function getFinSheetContentAction(sheetId: number): Promise<ActionResponse<{ sheet: any, columns: FinModuleColumn[], data: FinModuleDataRow[] }>> {
    try {
        // 1. Obtener la metadata de la hoja
        const [sheetRows] = await pool.execute<any[]>(
            `SELECT * FROM FIN_MODULE_SHEETS WHERE id = ?`, [sheetId]
        );

        if (sheetRows.length === 0) {
            return { success: false, message: "Hoja no encontrada" };
        }

        const sheet = sheetRows[0];

        // 2. Obtener las definiciones de las columnas (Cabeceras) de esta hojaq
        const [columnRowsRaw] = await pool.execute<any[]>(
            `SELECT * FROM FIN_MODULE_COLUMNS WHERE sheet_id = ? ORDER BY column_order ASC`, [sheetId]
        );

        // Parsear options de cada columna (vienen como string JSON de la DB)
        const columns = columnRowsRaw.map(col => ({
            ...col,
            options: typeof col.options === 'string' ? JSON.parse(col.options) : col.options
        })) as FinModuleColumn[];

        // 3. Obtener toda la data de esta hoja (Las filas del Excel)
        const [dataRowsRaw] = await pool.execute<any[]>(
            `SELECT * FROM FIN_MODULE_DATA WHERE sheet_id = ? ORDER BY created_at DESC LIMIT 5000`, [sheetId]
        );

        // Parsear row_data de cada fila (viene como string JSON de la DB)
        const data = dataRowsRaw.map(row => ({
            ...row,
            row_data: typeof row.row_data === 'string' ? JSON.parse(row.row_data) : row.row_data
        })) as FinModuleDataRow[];

        console.log(`[DEBUG] Sheet Content (ID: ${sheetId}):`, {
            sheetName: sheet.name,
            totalColumns: columns.length,
            totalDataRows: data.length
        });

        return {
            success: true,
            data: {
                sheet,
                columns,
                data
            }
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Obtener todas las hojas de un módulo
export async function getFinModuleSheetsAction(moduleId: number): Promise<ActionResponse<any[]>> {
    try {
        const [rows] = await pool.execute<any[]>(
            `SELECT * FROM FIN_MODULE_SHEETS WHERE module_id = ? ORDER BY sheet_order ASC`, [moduleId]
        );
        return { success: true, data: rows };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Crear una nueva hoja
export async function createFinSheetAction(input: z.infer<typeof SheetSchema>): Promise<ActionResponse<any>> {
    try {
        const validData = SheetSchema.parse(input);
        const [result] = await pool.execute(
            `INSERT INTO FIN_MODULE_SHEETS (module_id, name, sheet_order) VALUES (?, ?, ?)`,
            [validData.module_id, validData.name, validData.sheet_order]
        );

        revalidatePath(`/inicio/contable-v2/${validData.module_id}`);

        const insertId = (result as any).insertId;
        return { success: true, data: { id: insertId } };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Actualizar nombre u orden de una hoja
export async function updateFinSheetAction(sheetId: number, input: Partial<z.infer<typeof SheetSchema>>): Promise<ActionResponse> {
    try {
        const [sheetRows] = await pool.execute<any[]>(`SELECT module_id FROM FIN_MODULE_SHEETS WHERE id = ?`, [sheetId]);
        if (sheetRows.length === 0) return { success: false, message: "Hoja no encontrada" };

        const moduleId = sheetRows[0].module_id;

        if (input.name) {
            await pool.execute(`UPDATE FIN_MODULE_SHEETS SET name = ? WHERE id = ?`, [input.name, sheetId]);
        }
        if (input.sheet_order !== undefined) {
            await pool.execute(`UPDATE FIN_MODULE_SHEETS SET sheet_order = ? WHERE id = ?`, [input.sheet_order, sheetId]);
        }

        revalidatePath(`/inicio/contable-v2/${moduleId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Eliminar una hoja completa
export async function deleteFinSheetAction(sheetId: number): Promise<ActionResponse> {
    try {
        const [sheetRows] = await pool.execute<any[]>(`SELECT module_id FROM FIN_MODULE_SHEETS WHERE id = ?`, [sheetId]);
        if (sheetRows.length === 0) return { success: false, message: "Hoja no encontrada" };

        const moduleId = sheetRows[0].module_id;

        await pool.execute(`DELETE FROM FIN_MODULE_SHEETS WHERE id = ?`, [sheetId]);

        revalidatePath(`/inicio/contable-v2/${moduleId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// --- Server Actions (Datos del Excel Dinámico) ---

// Agrega o actualiza una fila completa desde la grilla
export async function saveFinDataRowAction(input: z.infer<typeof DataRowSchema>, userId: number): Promise<ActionResponse<{ id: number }>> {
    try {
        const validData = DataRowSchema.parse(input);
        const jsonString = JSON.stringify(validData.row_data);

        let newId = validData.id;
        if (validData.id) {
            // UPDATE - Un valor de la celda de Excel cambió
            await pool.execute(
                `UPDATE FIN_MODULE_DATA 
          SET transaction_date = ?, row_data = ?, updated_by = ?
          WHERE id = ?`,
                [validData.transaction_date || null, jsonString, userId, validData.id]
            );
        } else {
            // INSERT - Se agregó una fila en blanco desde Excel y guardó
            const [insertResult] = await pool.execute<any>(
                `INSERT INTO FIN_MODULE_DATA (module_id, sheet_id, transaction_date, row_data, created_by) 
          VALUES (?, ?, ?, ?, ?)`,
                [validData.module_id, validData.sheet_id, validData.transaction_date || null, jsonString, userId]
            );
            newId = insertResult.insertId;
        }

        return { success: true, data: { id: newId! } };

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.flatten().fieldErrors };
        }
        return { success: false, message: error.message };
    }
}

// Eliminar filas enteras
export async function deleteFinDataRowsAction(ids: number[]): Promise<ActionResponse> {
    try {
        if (ids.length === 0) return { success: true };

        // Crear los placeholders (?, ?, ...)
        const placeholders = ids.map(() => '?').join(',');

        await pool.execute(
            `DELETE FROM FIN_MODULE_DATA WHERE id IN (${placeholders})`,
            ids
        );

        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Agregar una nueva columna desde la UI al "Excel" (Crear Metadato)
export async function addColumnToModuleAction(input: z.infer<typeof ColumnSchema>): Promise<ActionResponse> {
    try {
        const validData = ColumnSchema.parse(input);
        const optionsJson = validData.options ? JSON.stringify(validData.options) : null;

        await pool.execute(
            `INSERT INTO FIN_MODULE_COLUMNS 
       (module_id, sheet_id, field_key, header_name, field_type, options, is_required, column_order, width) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                validData.module_id,
                validData.sheet_id,
                validData.field_key,
                validData.header_name,
                validData.field_type,
                optionsJson,
                validData.is_required,
                validData.column_order,
                validData.width
            ]
        );

        revalidatePath(`/inicio/contable-v2/${validData.module_id}`);
        return { success: true };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: error.flatten().fieldErrors };
        }
        // Error clave duplicada en MySQL (ya existe esa columna)
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: "Ya existe una columna con esa misma llave del sistema." };
        }
        return { success: false, message: error.message };
    }
}

// Actualizar una columna existente
export async function updateFinColumnAction(columnId: number, input: Partial<z.infer<typeof ColumnSchema>>): Promise<ActionResponse> {
    try {
        const [columnRows] = await pool.execute<any[]>(`SELECT module_id FROM FIN_MODULE_COLUMNS WHERE id = ?`, [columnId]);
        if (columnRows.length === 0) return { success: false, message: "Columna no encontrada" };

        const moduleId = columnRows[0].module_id;

        const updates: string[] = [];
        const params: any[] = [];

        if (input.header_name !== undefined) {
            updates.push(`header_name = ?`);
            params.push(input.header_name);
        }
        if (input.field_type !== undefined) {
            updates.push(`field_type = ?`);
            params.push(input.field_type);
        }
        if (input.options !== undefined) {
            updates.push(`options = ?`);
            params.push(input.options ? JSON.stringify(input.options) : null);
        }
        if (input.is_required !== undefined) {
            updates.push(`is_required = ?`);
            params.push(input.is_required);
        }
        if (input.width !== undefined) {
            updates.push(`width = ?`);
            params.push(input.width);
        }
        if (input.column_order !== undefined) {
            updates.push(`column_order = ?`);
            params.push(input.column_order);
        }

        if (updates.length > 0) {
            params.push(columnId);
            await pool.execute(
                `UPDATE FIN_MODULE_COLUMNS SET ${updates.join(', ')} WHERE id = ?`,
                params
            );
        }

        revalidatePath(`/inicio/contable-v2/${moduleId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Eliminar una columna
export async function deleteFinColumnAction(columnId: number): Promise<ActionResponse> {
    try {
        const [columnRows] = await pool.execute<any[]>(`SELECT module_id FROM FIN_MODULE_COLUMNS WHERE id = ?`, [columnId]);
        if (columnRows.length === 0) return { success: false, message: "Columna no encontrada" };

        const moduleId = columnRows[0].module_id;

        await pool.execute(`DELETE FROM FIN_MODULE_COLUMNS WHERE id = ?`, [columnId]);

        revalidatePath(`/inicio/contable-v2/${moduleId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
