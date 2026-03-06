// =====================================================
// SGI Opera Soluciones - User Repository
// Repositorio de usuarios siguiendo SRP y DIP
// Migración 007: tablas OS_USUARIOS y OS_ROLES con nuevas columnas
// =====================================================

import { DatabaseConnection } from '@/lib/db'
import { IUserRepository, User, CreateUserData } from './interfaces'
import { ERROR_MESSAGES } from '@/lib/constants'

/**
 * MySQL User Repository Implementation
 * Migración 007: OS_USUARIOS (US_), OS_ROLES (RO_)
 */
export class MySQLUserRepository implements IUserRepository {
  private readonly connection: DatabaseConnection

  constructor(connection: DatabaseConnection) {
    this.connection = connection
  }

  /**
   * Obtener usuario por email
   * Migración 007: OS_USUARIOS + OS_ROLES con nuevas columnas
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      this.validateEmail(email)

      const rows = await this.connection.execute(
        `SELECT u.US_IDUSUARIO_PK as id, u.US_EMAIL as email, u.US_PASSWORD_HASH as password,
                ur.RO_CODIGO as role, u.US_NOMBRE as first_name, u.US_APELLIDO as last_name 
         FROM OS_USUARIOS u 
         LEFT JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK 
         WHERE u.US_EMAIL = ? AND u.US_FECHA_ELIMINACION IS NULL`,
        [email]
      ) as any[]

      return rows.length > 0 ? this.mapToUser(rows[0]) : null
    } catch (error) {
      console.error('Error getting user by email:', error)
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
    }
  }

  /**
   * Obtener usuario por ID
   * Migración 007: OS_USUARIOS + OS_ROLES con nuevas columnas
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      this.validateId(id)

      const rows = await this.connection.execute(
        `SELECT u.US_IDUSUARIO_PK as id, u.US_EMAIL as email, u.US_PASSWORD_HASH as password,
                ur.RO_CODIGO as role, u.US_NOMBRE as first_name, u.US_APELLIDO as last_name 
         FROM OS_USUARIOS u 
         LEFT JOIN OS_ROLES ur ON u.RO_IDROL_FK = ur.RO_IDROL_PK 
         WHERE u.US_IDUSUARIO_PK = ? AND u.US_FECHA_ELIMINACION IS NULL`,
        [id]
      ) as any[]

      return rows.length > 0 ? this.mapToUser(rows[0]) : null
    } catch (error) {
      console.error('Error getting user by ID:', error)
      throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
    }
  }

  /**
   * Crear nuevo usuario
   * Migración 007: INSERT en OS_USUARIOS con nuevas columnas
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      this.validateCreateUserData(userData)

      const result = await this.connection.execute(
        `INSERT INTO OS_USUARIOS (US_EMAIL, US_PASSWORD_HASH, RO_IDROL_FK, US_NOMBRE, US_APELLIDO, EC_IDESTADO_CONTRATO_FK, US_CREADO_POR)
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
   * Mapear fila de base de datos a entidad User (alias ya vienen en el SELECT)
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

  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL_INPUT)
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL_FORMAT)
    }
  }

  private validateId(id: number): void {
    if (!id || typeof id !== 'number' || id <= 0) {
      throw new Error(ERROR_MESSAGES.INVALID_ID_INPUT)
    }
  }

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
