// =====================================================
// SGI Opera Soluciones - User Repository
// Repositorio de usuarios siguiendo SRP y DIP
// =====================================================
// Description: Repositorio para acceso a datos de usuarios
// Descripción: Repositorio para acceso a datos de usuarios
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

import { DatabaseConnection } from '@/lib/database'
import { IUserRepository, User, CreateUserData } from './interfaces'
import { ERROR_MESSAGES } from '@/lib/constants'

/**
 * MySQL User Repository Implementation
 * Implementación del repositorio de usuarios MySQL
 */
export class MySQLUserRepository implements IUserRepository {
  private readonly connection: DatabaseConnection

  constructor(connection: DatabaseConnection) {
    this.connection = connection
  }

  /**
   * Get user by email
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      this.validateEmail(email)
      
      const rows = await this.connection.execute(
        `SELECT u.id, u.email, u.password_hash as password, ur.code as role, u.first_name, u.last_name 
         FROM users u 
         LEFT JOIN user_roles ur ON u.role_id = ur.id 
         WHERE u.email = ? AND u.deleted_at IS NULL`,
        [email]
      ) as any[]
      
      return rows.length > 0 ? this.mapToUser(rows[0]) : null
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
    }
  }

  /**
   * Get user by ID
   * Obtener usuario por ID
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      this.validateId(id)
      
      const rows = await this.connection.execute(
        `SELECT u.id, u.email, u.password_hash as password, ur.code as role, u.first_name, u.last_name 
         FROM users u 
         LEFT JOIN user_roles ur ON u.role_id = ur.id 
         WHERE u.id = ? AND u.deleted_at IS NULL`,
        [id]
      ) as any[]
      
      return rows.length > 0 ? this.mapToUser(rows[0]) : null
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
    }
  }

  /**
   * Create new user
   * Crear nuevo usuario
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      this.validateCreateUserData(userData)
      
      const result = await this.connection.execute(
        `INSERT INTO users (email, password_hash, role_id, first_name, last_name, contract_status_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.email,
          userData.password,
          userData.role_id,
          userData.first_name,
          userData.last_name,
          userData.contract_status_id,
          userData.created_by
        ]
      ) as any
      
      return {
        id: result.insertId,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        first_name: userData.first_name,
        last_name: userData.last_name
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
    }
  }

  /**
   * Map database row to User entity
   * Mapear fila de base de datos a entidad User
   */
  private mapToUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      role: row.role,
      first_name: row.first_name,
      last_name: row.last_name
    }
  }

  /**
   * Validate email input
   * Validar entrada de email
   */
  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL_INPUT)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL_FORMAT)
    }
  }

  /**
   * Validate ID input
   * Validar entrada de ID
   */
  private validateId(id: number): void {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_ID_INPUT)
    }
  }

  /**
   * Validate create user data
   * Validar datos de creación de usuario
   */
  private validateCreateUserData(data: CreateUserData): void {
    if (!data.email || !data.password || !data.role || !data.first_name || !data.last_name) {
      throw new Error(ERROR_MESSAGES.INVALID_USER_DATA)
    }

    this.validateEmail(data.email)
    
    if (data.password.length < 6) {
      throw new Error(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    }
  }
}
