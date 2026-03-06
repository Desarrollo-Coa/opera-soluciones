// =====================================================
// SGI Opera Soluciones - User Service
// Migración 007: usa UserWithRole con nuevas claves OS_
// =====================================================

import { createUser, getUserByEmailWithStatus, getAllActiveUsers, updateUser, softDeleteUser, getUserById as getUserByIdFromDB, type UserWithRole } from "@/lib/repositories/users"
import { hashPassword } from "@/lib/auth"
import { ROLE_CODES, DEFAULT_VALUES, ERROR_MESSAGES } from "@/lib/constants"
import type { RoleCode } from "@/lib/constants"

export interface CreateUserRequest {
  first_name: string
  last_name: string
  email: string
  password: string
  role: RoleCode
  contract_status_id?: number
  created_by?: number

  // Información personal y documental
  document_type?: string
  document_number?: string
  birth_date?: Date
  gender?: string
  marital_status?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string

  // Información de contacto
  phone?: string
  address?: string

  // Información laboral (nombres formulario, mapeados a OS_)
  position?: string
  hire_date?: Date
  termination_date?: Date
  work_schedule?: string
  department?: string
  manager_id?: number
  employment_type?: string

  // Información de seguridad social
  eps_id?: string
  arl_id?: string
  pension_fund_id?: string
  compensation_fund_id?: string

  // Información bancaria
  bank_name?: string
  account_number?: string
  account_type?: string

  // Información adicional
  profile_picture?: string
  notes?: string
  is_active?: boolean
}

export interface UpdateUserRequest {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  position?: string
  role_id?: number
  contract_status_id?: number
  updated_by?: number
}

export interface UserResponse {
  id: number
  first_name: string
  last_name: string
  email: string
  role: RoleCode
  role_name: string
  contract_status_name: string
  phone?: string
  document_number?: string
  position?: string
  salary?: number
  department?: string
  profile_picture?: string
  is_active?: boolean
  created_at: string
  termination_date?: string
  days_until_termination?: number
}

/**
 * Mapea UserWithRole (claves OS_) a UserResponse (claves legibles por el frontend)
 * Este helper centraliza la conversión para que el frontend no tenga que saber del estándar OS_
 */
function mapUserWithRoleToResponse(user: UserWithRole): UserResponse {
  const daysUntil = user.US_FECHA_RETIRO
    ? Math.floor((new Date(user.US_FECHA_RETIRO).getTime() - new Date(new Date().setHours(0, 0, 0, 0)).getTime()) / (1000 * 60 * 60 * 24))
    : undefined

  return {
    id: user.US_IDUSUARIO_PK,
    first_name: user.US_NOMBRE,
    last_name: user.US_APELLIDO,
    email: user.US_EMAIL,
    role: user.role_code as RoleCode,
    role_name: user.role_name,
    contract_status_name: user.contract_status_name,
    phone: user.US_TELEFONO,
    document_number: user.US_NUMERO_DOCUMENTO,
    position: user.position, // alias virtual 'CA_NOMBRE'
    salary: user.salary,     // alias virtual 'CA_SUELDO_BASE'
    department: user.US_DEPARTAMENTO,
    profile_picture: user.US_FOTO_PERFIL,
    is_active: Boolean(user.US_ACTIVO),
    created_at: user.US_FECHA_CREACION.toISOString(),
    termination_date: user.US_FECHA_RETIRO ? new Date(user.US_FECHA_RETIRO).toISOString() : undefined,
    days_until_termination: daysUntil
  }
}

export class UserService {
  /**
   * Crear un nuevo usuario (con validación de email único)
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const existingUser = await getUserByEmailWithStatus(userData.email)
    if (existingUser) {
      throw new Error("El email ya está registrado")
    }

    const hashedPassword = await hashPassword(userData.password)

    // Traduce claves de formulario a claves OS_
    await createUser({
      US_NOMBRE: userData.first_name,
      US_APELLIDO: userData.last_name,
      US_EMAIL: userData.email,
      password: hashedPassword,
      RO_IDROL_FK: this.getRoleIdByCode(userData.role),
      EC_IDESTADO_CONTRATO_FK: userData.contract_status_id || DEFAULT_VALUES.ACTIVE_CONTRACT_STATUS_ID,
      US_CREADO_POR: userData.created_by || DEFAULT_VALUES.ADMIN_USER_ID,
      US_TIPO_DOCUMENTO: userData.document_type,
      US_NUMERO_DOCUMENTO: userData.document_number,
      US_FECHA_NACIMIENTO: userData.birth_date,
      US_GENERO: userData.gender,
      US_ESTADO_CIVIL: userData.marital_status,
      US_CONTACTO_EMERGENCIA_NOMBRE: userData.emergency_contact_name,
      US_CONTACTO_EMERGENCIA_TELEFONO: userData.emergency_contact_phone,
      US_TELEFONO: userData.phone,
      US_DIRECCION: userData.address,
      US_FECHA_CONTRATACION: userData.hire_date,
      US_FECHA_RETIRO: userData.termination_date,
      US_HORARIO_TRABAJO: userData.work_schedule,
      US_DEPARTAMENTO: userData.department,
      US_IDMANAGER_FK: userData.manager_id,
      US_TIPO_EMPLEO: userData.employment_type,
      EP_IDEPS_FK: userData.eps_id,
      AR_IDARL_FK: userData.arl_id,
      PE_IDPENSION_FK: userData.pension_fund_id,
      CC_IDCAJA_FK: userData.compensation_fund_id,
      US_NOMBRE_BANCO: userData.bank_name,
      US_NUMERO_CUENTA: userData.account_number,
      US_TIPO_CUENTA: userData.account_type,
      US_FOTO_PERFIL: userData.profile_picture,
      US_NOTAS: userData.notes,
      US_ACTIVO: userData.is_active
    })

    const user = await getUserByEmailWithStatus(userData.email)
    if (!user) throw new Error(ERROR_MESSAGES.DATABASE_ERROR)

    return mapUserWithRoleToResponse(user)
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const user = await getUserByEmailWithStatus(email)
    if (!user) return null
    return mapUserWithRoleToResponse(user)
  }

  /**
   * Obtener todos los usuarios activos
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await getAllActiveUsers()
    return (users as UserWithRole[]).map(mapUserWithRoleToResponse)
  }

  /**
   * Actualizar usuario
   */
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<UserResponse> {
    // Traduce claves de formulario a claves OS_
    await updateUser(userId, {
      US_NOMBRE: userData.first_name,
      US_APELLIDO: userData.last_name,
      US_EMAIL: userData.email,
      US_TELEFONO: userData.phone,
      US_DIRECCION: userData.address,
      RO_IDROL_FK: userData.role_id,
      EC_IDESTADO_CONTRATO_FK: userData.contract_status_id,
      US_ACTUALIZADO_POR: userData.updated_by,
    })

    const updatedUser = await getUserByIdFromDB(userId)
    if (!updatedUser) throw new Error("Usuario no encontrado")

    return mapUserWithRoleToResponse(updatedUser)
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(userId: number, deletedBy: number): Promise<void> {
    await softDeleteUser(userId, deletedBy)
  }

  private getRoleIdByCode(roleCode: RoleCode): number {
    const roleMapping: Record<RoleCode, number> = {
      [ROLE_CODES.ADMIN]: 1,
      [ROLE_CODES.EMPLOYEE]: 2,
      [ROLE_CODES.HR]: 3,
      [ROLE_CODES.AUDITOR]: 4,
    }
    return roleMapping[roleCode] || DEFAULT_VALUES.ADMIN_ROLE_ID
  }
}

// Singleton instance
export const userService = new UserService()
