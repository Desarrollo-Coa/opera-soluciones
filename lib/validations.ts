import { z } from "zod"
import { ROLE_CODES, FIELD_LENGTHS, VALIDATION_PATTERNS } from "./constants"

export const loginSchema = z.object({
  email: z.string().email("Email inválido").max(FIELD_LENGTHS.EMAIL_MAX, "Email demasiado largo"),
  password: z.string().min(FIELD_LENGTHS.PASSWORD_MIN, "La contraseña debe tener al menos 8 caracteres").max(FIELD_LENGTHS.PASSWORD_MAX, "Contraseña demasiado larga"),
})

export const userSchema = z.object({
  // Información básica
  first_name: z.string().min(2, "El nombre es requerido").max(FIELD_LENGTHS.NAME_MAX, "El nombre es demasiado largo"),
  last_name: z.string().min(2, "El apellido es requerido").max(FIELD_LENGTHS.NAME_MAX, "El apellido es demasiado largo"),
  email: z.string().email("Email inválido").max(FIELD_LENGTHS.EMAIL_MAX, "El email es demasiado largo"),
  
  // Información personal y documental
  document_type: z.enum(['CC', 'CE', 'TI', 'RC', 'PA']).default('CC'),
  document_number: z.string().optional().refine((val) => !val || VALIDATION_PATTERNS.DOCUMENT_NUMBER.test(val), "Número de documento inválido"),
  birth_date: z.string().optional(),
  gender: z.enum(['M', 'F', 'O']).optional(),
  marital_status: z.enum(['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Unión Libre']).optional(),
  emergency_contact_name: z.string().max(FIELD_LENGTHS.NAME_MAX, "Nombre de contacto de emergencia demasiado largo").optional(),
  emergency_contact_phone: z.string().optional().refine((val) => !val || VALIDATION_PATTERNS.PHONE.test(val), "Teléfono de contacto de emergencia inválido"),
  
  // Información de contacto
  phone: z.string().optional().refine((val) => !val || VALIDATION_PATTERNS.PHONE.test(val), "Número de teléfono inválido"),
  address: z.string().max(FIELD_LENGTHS.ADDRESS_MAX, "La dirección es demasiado larga").optional(),
  
  // Información laboral
  position: z.string().max(FIELD_LENGTHS.POSITION_MAX, "El cargo es demasiado largo").optional(),
  salary: z.string().optional().refine((val) => !val || /^\d+$/.test(val.replace(/[^\d]/g, '')), "El salario debe contener solo números"),
  hire_date: z.string().optional(),
  termination_date: z.string().optional(),
  work_schedule: z.string().optional(),
  department: z.string().max(FIELD_LENGTHS.DEPARTMENT_MAX, "El departamento es demasiado largo").optional(),
  manager_id: z.union([z.string(), z.number()]).optional().transform((val) => val === undefined ? undefined : String(val)),
  employment_type: z.enum(['Tiempo Completo', 'Medio Tiempo', 'Por Horas', 'Por Contrato']).default('Tiempo Completo'),
  
  // Información de seguridad social
  eps_id: z.string().optional(),
  arl_id: z.string().optional(),
  compensation_fund_id: z.string().optional(),
  pension_fund_id: z.string().optional(),
  
  // Información bancaria
  bank_name: z.string().max(FIELD_LENGTHS.BANK_NAME_MAX, "El nombre del banco es demasiado largo").optional(),
  account_number: z.string().max(FIELD_LENGTHS.ACCOUNT_NUMBER_MAX, "El número de cuenta es demasiado largo").optional(),
  account_type: z.enum(['Ahorros', 'Corriente']).optional(),
  
  // Información adicional
  profile_picture: z.string().max(FIELD_LENGTHS.PROFILE_PICTURE_MAX, "La URL de la foto de perfil es demasiado larga").nullable().optional(),
  notes: z.string().max(FIELD_LENGTHS.NOTES_MAX, "Las notas son demasiado largas").optional(),
  is_active: z.boolean().default(true),
  
  // Campos del sistema
  document_type_id: z.string().optional(),
  contract_status: z.enum(["Active", "Inactive", "Pending", "Suspended"]).default("Active"),
  role_id: z.string().min(1, "Rol requerido"),
  contract_status_id: z.string().min(1, "Estado de contrato requerido"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type UserInput = z.infer<typeof userSchema>
