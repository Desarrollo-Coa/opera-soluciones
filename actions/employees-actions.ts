'use server'

import { pool } from '@/lib/db';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './reference-actions';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// --- Schema de Validación (sin cambios en claves del formulario, son nombres de campo HTML) ---
const employeeProfileSchema = z.object({
    id: z.coerce.number(),
    first_name: z.string().min(1, "El nombre es requerido"),
    last_name: z.string().min(1, "El apellido es requerido"),
    email: z.string().email("Email inválido"),

    // Información personal
    document_type: z.enum(['CC', 'CE', 'TI', 'RC', 'PA']).optional(),
    document_number: z.string().optional().nullable(),
    birth_date: z.string().optional().nullable(),
    gender: z.enum(['M', 'F', 'O']).optional().nullable(),
    marital_status: z.enum(['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre']).optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    departamento_id: z.coerce.number().optional().nullable(),
    municipio_id: z.coerce.number().optional().nullable(),
    emergency_contact_name: z.string().optional().nullable(),
    emergency_contact_phone: z.string().optional().nullable(),

    // Información laboral
    cargo_id: z.coerce.number().optional().nullable(),
    hire_date: z.string().optional().nullable(),
    termination_date: z.string().optional().nullable(),
    work_schedule: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    employment_type: z.enum(['Tiempo Completo', 'Medio Tiempo', 'Por Horas', 'Por Contrato']).optional().nullable(),

    // Seguridad Social
    eps_id: z.string().optional().nullable(),
    arl_id: z.string().optional().nullable(),
    pension_fund_id: z.string().optional().nullable(),
    compensation_fund_id: z.string().optional().nullable(),

    // Información bancaria
    bank_name: z.string().optional().nullable(),
    account_number: z.string().optional().nullable(),
    account_type: z.enum(['Ahorros', 'Corriente']).optional().nullable(),

    notes: z.string().optional().nullable(),
    is_active: z.coerce.boolean().optional().default(true),
    role_id: z.coerce.number().optional().nullable(),
    contract_status_id: z.coerce.number().optional().nullable(),

    // Sueldo (aunque se guarde en cargos, se permite en el schema para fluidez)
    salary: z.coerce.number().optional().nullable(),

    // Solo para creación
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").optional(),
});

/**
 * Actualiza el perfil completo de un empleado
 * Migración 007: columnas OS_USUARIOS actualizadas al nuevo estándar
 */
export async function updateEmployeeProfileAction(
    prevState: any,
    formData: FormData
): Promise<ActionResponse<void>> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        let updaterId = 1;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.id) updaterId = parseInt(payload.id);
            } catch (e) { }
        }

        const rawData: any = {};
        formData.forEach((value, key) => {
            if (key === 'salary' && typeof value === 'string') {
                rawData[key] = value.replace(/\$|\.|\ /g, '').replace(',', '.');
                if (rawData[key] === '') rawData[key] = null;
            } else {
                rawData[key] = value === "" ? null : value;
            }
        });

        rawData.is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

        const validatedData = employeeProfileSchema.safeParse(rawData);
        console.log('--- BACKEND: PROCESSING UPDATE ---');
        console.log('Processed Data for Validation:', rawData);

        if (!validatedData.success) {
            console.error('Validation Error (Update):', JSON.stringify(validatedData.error.flatten().fieldErrors, null, 2));
            const fieldErrors = validatedData.error.flatten().fieldErrors;
            const errorMessages = Object.entries(fieldErrors)
                .map(([field, errors]) => `${field}: ${errors?.join(', ')}`)
                .join(' | ');

            return {
                success: false,
                message: `Campos inválidos: ${errorMessages}`,
                errors: fieldErrors,
            };
        }

        console.log('Validation Success (Update)');
        const d = validatedData.data;

        await pool.execute(
            `UPDATE OS_USUARIOS SET 
        US_NOMBRE = ?, US_APELLIDO = ?, US_EMAIL = ?, 
        US_TIPO_DOCUMENTO = ?, US_NUMERO_DOCUMENTO = ?, US_FECHA_NACIMIENTO = ?, US_GENERO = ?, US_ESTADO_CIVIL = ?,
        US_TELEFONO = ?, US_DIRECCION = ?, DE_IDDEPARTAMENTO_FK = ?, MU_IDMUNICIPIO_FK = ?,
        CA_IDCARGO_FK = ?, US_FECHA_CONTRATACION = ?, US_FECHA_RETIRO = ?, 
        US_HORARIO_TRABAJO = ?, US_DEPARTAMENTO = ?, US_TIPO_EMPLEO = ?,
        EP_IDEPS_FK = ?, AR_IDARL_FK = ?, PE_IDPENSION_FK = ?, CC_IDCAJA_FK = ?,
        US_NOMBRE_BANCO = ?, US_NUMERO_CUENTA = ?, US_TIPO_CUENTA = ?,
        US_CONTACTO_EMERGENCIA_NOMBRE = ?, US_CONTACTO_EMERGENCIA_TELEFONO = ?,
        RO_IDROL_FK = ?, EC_IDESTADO_CONTRATO_FK = ?,
        US_NOTAS = ?, US_ACTIVO = ?, US_ACTUALIZADO_POR = ?
       WHERE US_IDUSUARIO_PK = ?`,
            [
                d.first_name, d.last_name, d.email,
                d.document_type || 'CC', d.document_number ?? null, d.birth_date || null, d.gender || null, d.marital_status || null,
                d.phone ?? null, d.address ?? null, d.departamento_id || null, d.municipio_id || null,
                d.cargo_id || null, d.hire_date || null, d.termination_date || null,
                d.work_schedule ?? null, d.department ?? null, d.employment_type || 'Tiempo Completo',
                d.eps_id ?? null, d.arl_id ?? null, d.pension_fund_id ?? null, d.compensation_fund_id ?? null,
                d.bank_name ?? null, d.account_number ?? null, d.account_type ?? null,
                d.emergency_contact_name ?? null, d.emergency_contact_phone ?? null,
                d.role_id ?? 2, d.contract_status_id ?? 1,
                d.notes ?? null, d.is_active ? 1 : 0, updaterId,
                d.id
            ]
        );

        revalidatePath(`/inicio/empleados/${d.id}`);
        revalidatePath('/inicio/empleados');

        return { success: true, message: 'Perfil del empleado actualizado correctamente.' };
    } catch (error: any) {
        console.error('Error updating employee profile:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'El correo electrónico o número de documento ya está en uso.' };
        }
        return { success: false, message: 'Error interno al actualizar el perfil.' };
    }
}

/**
 * Crea un nuevo empleado en el sistema
 * Migración 007: INSERT en OS_USUARIOS con nuevos nombres de columna
 */
export async function createEmployeeAction(
    prevState: any,
    formData: FormData
): Promise<ActionResponse<number>> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;
        let creatorId = 1;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.id) creatorId = parseInt(payload.id);
            } catch (e) { }
        }

        const rawData: any = {};
        formData.forEach((value, key) => {
            if (key === 'salary' && typeof value === 'string') {
                rawData[key] = value.replace(/\$|\.|\ /g, '').replace(',', '.');
                if (rawData[key] === '') rawData[key] = null;
            } else {
                rawData[key] = value === "" ? null : value;
            }
        });

        rawData.is_active = formData.get('is_active') === 'on' || formData.get('is_active') === 'true';

        const validatedData = employeeProfileSchema.safeParse(rawData);
        console.log('--- BACKEND: PROCESSING CREATE ---');
        console.log('Processed Data for Validation:', rawData);

        if (!validatedData.success) {
            console.error('Validation Error (Create):', JSON.stringify(validatedData.error.flatten().fieldErrors, null, 2));
            const fieldErrors = validatedData.error.flatten().fieldErrors;
            const errorMessages = Object.entries(fieldErrors)
                .map(([field, errors]) => `${field}: ${errors?.join(', ')}`)
                .join(' | ');

            return {
                success: false,
                message: `Campos inválidos: ${errorMessages}`,
                errors: fieldErrors,
            };
        }

        console.log('Validation Success (Create)');
        const d = validatedData.data;
        if (!d.password) {
            return { success: false, message: 'La contraseña es requerida para nuevos empleados.' };
        }

        const passwordHash = await bcrypt.hash(d.password, 12);

        // Migración 007: INSERT en OS_USUARIOS con nuevas columnas
        const [result]: any = await pool.execute(
            `INSERT INTO OS_USUARIOS (
                US_NOMBRE, US_APELLIDO, US_EMAIL, US_PASSWORD_HASH,
                US_TIPO_DOCUMENTO, US_NUMERO_DOCUMENTO, US_FECHA_NACIMIENTO, US_GENERO, US_ESTADO_CIVIL,
                US_TELEFONO, US_DIRECCION, DE_IDDEPARTAMENTO_FK, MU_IDMUNICIPIO_FK,
                CA_IDCARGO_FK, US_FECHA_CONTRATACION, US_FECHA_RETIRO, 
                US_HORARIO_TRABAJO, US_DEPARTAMENTO, US_TIPO_EMPLEO,
                EP_IDEPS_FK, AR_IDARL_FK, PE_IDPENSION_FK, CC_IDCAJA_FK,
                US_NOMBRE_BANCO, US_NUMERO_CUENTA, US_TIPO_CUENTA,
                US_CONTACTO_EMERGENCIA_NOMBRE, US_CONTACTO_EMERGENCIA_TELEFONO,
                US_NOTAS, US_ACTIVO, RO_IDROL_FK, EC_IDESTADO_CONTRATO_FK, US_CREADO_POR
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                d.first_name, d.last_name, d.email, passwordHash,
                d.document_type || 'CC', d.document_number ?? null, d.birth_date || null, d.gender || null, d.marital_status || null,
                d.phone ?? null, d.address ?? null, d.departamento_id || null, d.municipio_id || null,
                d.cargo_id || null, d.hire_date || null, d.termination_date || null,
                d.work_schedule ?? null, d.department ?? null, d.employment_type || 'Tiempo Completo',
                d.eps_id ?? null, d.arl_id ?? null, d.pension_fund_id ?? null, d.compensation_fund_id ?? null,
                d.bank_name ?? null, d.account_number ?? null, d.account_type ?? null,
                d.emergency_contact_name ?? null, d.emergency_contact_phone ?? null,
                d.notes ?? null, d.is_active ? 1 : 0,
                d.role_id || 2,
                d.contract_status_id || 1,
                creatorId
            ]
        );

        revalidatePath('/inicio/empleados');

        return {
            success: true,
            message: 'Empleado creado correctamente.',
            data: result.insertId
        };
    } catch (error: any) {
        console.error('Error creating employee:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return { success: false, message: 'El correo electrónico o número de documento ya está en uso.' };
        }
        return { success: false, message: 'Error interno al crear el empleado.' };
    }
}

/**
 * Obtener listado simple de empleados para selectores
 * Migración 007: query en OS_USUARIOS
 */
export async function getEmployeesSimple(): Promise<ActionResponse<any[]>> {
    try {
        const [rows] = await pool.execute(
            'SELECT US_IDUSUARIO_PK as id, US_NOMBRE as first_name, US_APELLIDO as last_name, US_NUMERO_DOCUMENTO as document_number FROM OS_USUARIOS WHERE US_ACTIVO = 1 AND US_FECHA_ELIMINACION IS NULL ORDER BY US_APELLIDO, US_NOMBRE'
        );
        return { success: true, data: rows as any[] };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
