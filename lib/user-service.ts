// =====================================================
// SGI Opera Soluciones - User Service
// Servicio de usuarios
// =====================================================
// Description: Business logic for user management
// Descripción: Lógica de negocio para gestión de usuarios
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { createUser, getUserByEmailWithStatus, getAllActiveUsers, updateUser, softDeleteUser, getUserById as getUserByIdFromDB, type UserWithRole } from "@/database/users"
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
  
  // Información laboral
  position?: string
  salary?: number
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
  profile_picture?: string
  is_active?: boolean
  created_at: string
  termination_date?: string
  days_until_termination?: number
}

/**
 * User service for business logic
 * Servicio de usuarios para lógica de negocio
 */
export class UserService {
  /**
   * Create a new user with validation
   * Crear un nuevo usuario con validación
   */
  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    // Validate email uniqueness
    const existingUser = await getUserByEmailWithStatus(userData.email)
    if (existingUser) {
      throw new Error("El email ya está registrado")
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user
    const userId = await createUser({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: hashedPassword,
      role_id: this.getRoleIdByCode(userData.role),
      contract_status_id: userData.contract_status_id || DEFAULT_VALUES.ACTIVE_CONTRACT_STATUS_ID,
      created_by: userData.created_by || DEFAULT_VALUES.ADMIN_USER_ID,
      // Additional fields
      document_type: userData.document_type,
      document_number: userData.document_number,
      birth_date: userData.birth_date,
      gender: userData.gender,
      marital_status: userData.marital_status,
      emergency_contact_name: userData.emergency_contact_name,
      emergency_contact_phone: userData.emergency_contact_phone,
      phone: userData.phone,
      address: userData.address,
      position: userData.position,
      salary: userData.salary,
      hire_date: userData.hire_date,
      termination_date: userData.termination_date,
      work_schedule: userData.work_schedule,
      department: userData.department,
      manager_id: userData.manager_id,
      employment_type: userData.employment_type,
      eps_id: userData.eps_id,
      arl_id: userData.arl_id,
      pension_fund_id: userData.pension_fund_id,
      compensation_fund_id: userData.compensation_fund_id,
      bank_name: userData.bank_name,
      account_number: userData.account_number,
      account_type: userData.account_type,
      profile_picture: userData.profile_picture,
      notes: userData.notes,
      is_active: userData.is_active
    })

    // Get created user with full data
    const user = await getUserByEmailWithStatus(userData.email)
    if (!user) {
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
    }

    const daysUntil = user.termination_date
      ? Math.floor((new Date(user.termination_date).getTime() - new Date(new Date().setHours(0,0,0,0)).getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role_code as RoleCode,
      role_name: user.role_name,
      contract_status_name: user.contract_status_name,
      phone: user.phone,
      position: user.position,
      salary: user.salary,
      profile_picture: user.profile_picture,
      is_active: Boolean(user.is_active),
      created_at: user.created_at.toISOString(),
      termination_date: user.termination_date ? new Date(user.termination_date).toISOString() : undefined,
      days_until_termination: daysUntil
    }
  }

  /**
   * Get user by email
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const user = await getUserByEmailWithStatus(email)
    if (!user) {
      return null
    }

    const daysUntil = user.termination_date
      ? Math.floor((new Date(user.termination_date).getTime() - new Date(new Date().setHours(0,0,0,0)).getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role_code as RoleCode,
      role_name: user.role_name,
      contract_status_name: user.contract_status_name,
      phone: user.phone,
      position: user.position,
      salary: user.salary,
      profile_picture: user.profile_picture,
      is_active: Boolean(user.is_active),
      created_at: user.created_at.toISOString(),
      termination_date: user.termination_date ? new Date(user.termination_date).toISOString() : undefined,
      days_until_termination: daysUntil
    }
  }

  /**
   * Get all users
   * Obtener todos los usuarios
   */
  async getAllUsers(): Promise<UserResponse[]> {
    const users = await getAllActiveUsers()
    
    return (users as UserWithRole[]).map((user: UserWithRole) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role_code as RoleCode,
      role_name: user.role_name,
      contract_status_name: user.contract_status_name,
      phone: user.phone,
      document_number: user.document_number,
      position: user.position,
      salary: user.salary,
      profile_picture: user.profile_picture,
      is_active: Boolean(user.is_active),
      created_at: user.created_at.toISOString(),
      termination_date: user.termination_date ? new Date(user.termination_date).toISOString() : undefined,
      days_until_termination: user.termination_date
        ? Math.floor((new Date(user.termination_date).getTime() - new Date(new Date().setHours(0,0,0,0)).getTime()) / (1000 * 60 * 60 * 24))
        : undefined
    }))
  }

  /**
   * Update user
   * Actualizar usuario
   */
  async updateUser(userId: number, userData: UpdateUserRequest): Promise<UserResponse> {
    await updateUser(userId, userData)
    
    // Get updated user
    const updatedUser = await getUserByIdFromDB(userId)
    if (!updatedUser) {
      throw new Error("Usuario no encontrado")
    }

    const daysUntil = updatedUser.termination_date
      ? Math.floor((new Date(updatedUser.termination_date).getTime() - new Date(new Date().setHours(0,0,0,0)).getTime()) / (1000 * 60 * 60 * 24))
      : undefined

    return {
      id: updatedUser.id,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      role: updatedUser.role_code as RoleCode,
      role_name: updatedUser.role_name,
      contract_status_name: updatedUser.contract_status_name,
      phone: updatedUser.phone,
      document_number: updatedUser.document_number,
      position: updatedUser.position,
      salary: updatedUser.salary,
      profile_picture: updatedUser.profile_picture,
      created_at: updatedUser.created_at.toISOString(),
      termination_date: updatedUser.termination_date ? new Date(updatedUser.termination_date).toISOString() : undefined,
      days_until_termination: daysUntil
    }
  }

  /**
   * Delete user
   * Eliminar usuario
   */
  async deleteUser(userId: number, deletedBy: number): Promise<void> {
    await softDeleteUser(userId, deletedBy)
  }

  /**
   * Get role ID by role code
   * Obtener ID de rol por código de rol
   */
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

