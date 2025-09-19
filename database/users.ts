import { executeQuery } from "@/lib/database"
import { hashPassword } from "@/lib/auth"
import { ERROR_MESSAGES, DEFAULT_VALUES } from "@/lib/constants"

// =====================================================
// SGI Opera Soluciones - User Management Functions
// Funciones para gestión de usuarios
// =====================================================

export interface UserWithRole {
  id: number
  first_name: string
  last_name: string
  email: string
  password_hash: string
  
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
  
  // Campos del sistema
  contract_status_name: string
  role_name: string
  role_code: string
  created_at: Date
  updated_at?: Date
}

export interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  password: string // This will be the hashed password
  
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
  
  // Campos del sistema
  role_id: number
  contract_status_id: number
  created_by: number
}

export interface UpdateUserData {
  first_name?: string
  last_name?: string
  email?: string
  
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
  
  // Campos del sistema
  role_id?: number
  contract_status_id?: number
  updated_by?: number
}

/**
 * Get user by email with role information
 * Obtener usuario por email con información de rol
 */
export async function getUserByEmailWithStatus(email: string): Promise<UserWithRole | null> {
  try {
    const users = await executeQuery(`
      SELECT u.*, 
             COALESCE(cs.name, 'Activo') as contract_status_name, 
             ur.name as role_name, 
             ur.code as role_code 
      FROM users u 
      LEFT JOIN contract_statuses cs ON u.contract_status_id = cs.id 
      LEFT JOIN user_roles ur ON u.role_id = ur.id 
      WHERE u.email = ? AND u.deleted_at IS NULL
    `, [email]) as UserWithRole[]
    
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error getting user by email:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Create new user with role and contract status
 * Crear nuevo usuario con rol y estado de contrato
 */
export async function createUser(userData: CreateUserData): Promise<number> {
  try {
    // userData.password is already hashed when called from login route
    const result = await executeQuery(`
      INSERT INTO users (
        first_name, last_name, email, password_hash, role_id, contract_status_id, created_by,
        document_type, document_number, birth_date, gender, marital_status, 
        emergency_contact_name, emergency_contact_phone, phone, address,
        position, salary, hire_date, termination_date, work_schedule, department, 
        manager_id, employment_type, eps_id, arl_id, pension_fund_id, compensation_fund_id,
        bank_name, account_number, account_type, profile_picture, notes, is_active
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userData.first_name,
      userData.last_name,
      userData.email,
      userData.password,
      userData.role_id,
      userData.contract_status_id,
      userData.created_by,
      userData.document_type || null,
      userData.document_number || null,
      userData.birth_date || null,
      userData.gender || null,
      userData.marital_status || null,
      userData.emergency_contact_name || null,
      userData.emergency_contact_phone || null,
      userData.phone || null,
      userData.address || null,
      userData.position || null,
      userData.salary || null,
      userData.hire_date || null,
      userData.termination_date || null,
      userData.work_schedule || null,
      userData.department || null,
      userData.manager_id || null,
      userData.employment_type || null,
      userData.eps_id || null,
      userData.arl_id || null,
      userData.pension_fund_id || null,
      userData.compensation_fund_id || null,
      userData.bank_name || null,
      userData.account_number || null,
      userData.account_type || null,
      userData.profile_picture || null,
      userData.notes || null,
      userData.is_active !== undefined ? userData.is_active : true
    ]) as any
    
    return result.insertId
  } catch (error: any) {
    console.error("Error creating user:", error)
    
    // Handle duplicate email error specifically
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('email')) {
      throw new Error('El email ya está registrado en el sistema')
    }
    
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Get user by ID with role and contract status
 * Obtener usuario por ID con rol y estado de contrato
 */
export async function getUserById(id: number): Promise<UserWithRole | null> {
  try {
    const users = await executeQuery(`
      SELECT u.*, cs.name as contract_status_name, ur.name as role_name, ur.code as role_code 
      FROM users u 
      LEFT JOIN contract_statuses cs ON u.contract_status_id = cs.id 
      LEFT JOIN user_roles ur ON u.role_id = ur.id 
      WHERE u.id = ? AND u.deleted_at IS NULL
    `, [id]) as UserWithRole[]
    
    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Error getting user by ID:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Get all active users with role and contract status
 * Obtener todos los usuarios activos con rol y estado de contrato
 */
export async function getAllActiveUsers(): Promise<UserWithRole[]> {
  try {
    const users = await executeQuery(`
      SELECT u.*, cs.name as contract_status_name, ur.name as role_name, ur.code as role_code 
      FROM users u 
      LEFT JOIN contract_statuses cs ON u.contract_status_id = cs.id 
      LEFT JOIN user_roles ur ON u.role_id = ur.id 
      WHERE u.deleted_at IS NULL 
      ORDER BY u.created_at DESC
    `) as UserWithRole[]
    
    return users
  } catch (error) {
    console.error("Error getting all active users:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Update user information
 * Actualizar información de usuario
 */
export async function updateUser(id: number, userData: UpdateUserData): Promise<void> {
  try {
    const updateFields = []
    const updateValues = []
    
    // Basic information
    if (userData.first_name) {
      updateFields.push("first_name = ?")
      updateValues.push(userData.first_name)
    }
    if (userData.last_name) {
      updateFields.push("last_name = ?")
      updateValues.push(userData.last_name)
    }
    if (userData.email) {
      updateFields.push("email = ?")
      updateValues.push(userData.email)
    }
    
    // Personal and document information
    if (userData.document_type !== undefined) {
      updateFields.push("document_type = ?")
      updateValues.push(userData.document_type)
    }
    if (userData.document_number !== undefined) {
      updateFields.push("document_number = ?")
      updateValues.push(userData.document_number)
    }
    if (userData.birth_date !== undefined) {
      updateFields.push("birth_date = ?")
      updateValues.push(userData.birth_date)
    }
    if (userData.gender !== undefined) {
      updateFields.push("gender = ?")
      updateValues.push(userData.gender)
    }
    if (userData.marital_status !== undefined) {
      updateFields.push("marital_status = ?")
      updateValues.push(userData.marital_status)
    }
    if (userData.emergency_contact_name !== undefined) {
      updateFields.push("emergency_contact_name = ?")
      updateValues.push(userData.emergency_contact_name)
    }
    if (userData.emergency_contact_phone !== undefined) {
      updateFields.push("emergency_contact_phone = ?")
      updateValues.push(userData.emergency_contact_phone)
    }
    
    // Contact information
    if (userData.phone !== undefined) {
      updateFields.push("phone = ?")
      updateValues.push(userData.phone)
    }
    if (userData.address !== undefined) {
      updateFields.push("address = ?")
      updateValues.push(userData.address)
    }
    
    // Work information
    if (userData.position !== undefined) {
      updateFields.push("position = ?")
      updateValues.push(userData.position)
    }
    if (userData.salary !== undefined) {
      updateFields.push("salary = ?")
      updateValues.push(userData.salary)
    }
    if (userData.hire_date !== undefined) {
      updateFields.push("hire_date = ?")
      updateValues.push(userData.hire_date)
    }
    if (userData.termination_date !== undefined) {
      updateFields.push("termination_date = ?")
      updateValues.push(userData.termination_date)
    }
    if (userData.work_schedule !== undefined) {
      updateFields.push("work_schedule = ?")
      updateValues.push(userData.work_schedule)
    }
    if (userData.department !== undefined) {
      updateFields.push("department = ?")
      updateValues.push(userData.department)
    }
    if (userData.manager_id !== undefined) {
      updateFields.push("manager_id = ?")
      updateValues.push(userData.manager_id)
    }
    if (userData.employment_type !== undefined) {
      updateFields.push("employment_type = ?")
      updateValues.push(userData.employment_type)
    }
    
    // Social security information
    if (userData.eps_id !== undefined) {
      updateFields.push("eps_id = ?")
      updateValues.push(userData.eps_id)
    }
    if (userData.arl_id !== undefined) {
      updateFields.push("arl_id = ?")
      updateValues.push(userData.arl_id)
    }
    if (userData.pension_fund_id !== undefined) {
      updateFields.push("pension_fund_id = ?")
      updateValues.push(userData.pension_fund_id)
    }
    if (userData.compensation_fund_id !== undefined) {
      updateFields.push("compensation_fund_id = ?")
      updateValues.push(userData.compensation_fund_id)
    }
    
    // Banking information
    if (userData.bank_name !== undefined) {
      updateFields.push("bank_name = ?")
      updateValues.push(userData.bank_name)
    }
    if (userData.account_number !== undefined) {
      updateFields.push("account_number = ?")
      updateValues.push(userData.account_number)
    }
    if (userData.account_type !== undefined) {
      updateFields.push("account_type = ?")
      updateValues.push(userData.account_type)
    }
    
    // Additional information
    if (userData.profile_picture !== undefined) {
      updateFields.push("profile_picture = ?")
      updateValues.push(userData.profile_picture)
    }
    if (userData.notes !== undefined) {
      updateFields.push("notes = ?")
      updateValues.push(userData.notes)
    }
    if (userData.is_active !== undefined) {
      updateFields.push("is_active = ?")
      updateValues.push(userData.is_active)
      console.log('Adding is_active to update:', userData.is_active)
    }
    
    // System fields
    if (userData.role_id !== undefined) {
      updateFields.push("role_id = ?")
      updateValues.push(userData.role_id)
    }
    if (userData.contract_status_id !== undefined) {
      updateFields.push("contract_status_id = ?")
      updateValues.push(userData.contract_status_id)
    }
    
    // Always update these fields
    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    if (userData.updated_by !== undefined) {
      updateFields.push("updated_by = ?")
      updateValues.push(userData.updated_by)
    }
    updateValues.push(id)
    
    console.log('Update SQL:', `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`)
    console.log('Update values:', updateValues)
    
    await executeQuery(`
      UPDATE users 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `, updateValues)
  } catch (error) {
    console.error("Error updating user:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Soft delete user
 * Eliminación lógica de usuario
 */
export async function softDeleteUser(id: number, deletedBy: number): Promise<void> {
  try {
    await executeQuery(`
      UPDATE users 
      SET deleted_at = CURRENT_TIMESTAMP, deleted_by = ?
      WHERE id = ?
    `, [deletedBy, id])
  } catch (error) {
    console.error("Error soft deleting user:", error)
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
} 