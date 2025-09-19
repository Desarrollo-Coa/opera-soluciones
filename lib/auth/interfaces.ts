// =====================================================
// SGI Opera Soluciones - Auth Interfaces
// Interfaces de autenticación siguiendo SOLID
// =====================================================
// Description: Interfaces para el sistema de autenticación
// Descripción: Interfaces para el sistema de autenticación
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

import { type RoleCode } from '@/lib/constants'

/**
 * User entity interface
 * Interfaz de entidad usuario
 */
export interface User {
  id: number
  email: string
  password: string
  role: RoleCode
  first_name: string
  last_name: string
}

/**
 * JWT payload interface
 * Interfaz del payload JWT
 */
export interface JWTPayload {
  id: number
  email: string
  role: RoleCode
  first_name: string
  last_name: string
  [key: string]: any
}

/**
 * User repository interface (ISP - Interface Segregation)
 * Interfaz del repositorio de usuarios
 */
export interface IUserRepository {
  getUserByEmail(email: string): Promise<User | null>
  createUser(userData: CreateUserData): Promise<User>
  getUserById(id: number): Promise<User | null>
}

/**
 * Token service interface (ISP)
 * Interfaz del servicio de tokens
 */
export interface ITokenService {
  signToken(payload: JWTPayload): Promise<string>
  verifyToken(token: string): Promise<JWTPayload>
}

/**
 * Password service interface (ISP)
 * Interfaz del servicio de contraseñas
 */
export interface IPasswordService {
  hashPassword(password: string): Promise<string>
  verifyPassword(password: string, hash: string): Promise<boolean>
}

/**
 * Auth service interface (ISP)
 * Interfaz del servicio de autenticación
 */
export interface IAuthService {
  login(email: string, password: string): Promise<string>
  register(userData: RegisterUserData): Promise<string>
  verifyToken(token: string): Promise<JWTPayload>
}

/**
 * Create user data interface
 * Interfaz de datos para crear usuario
 */
export interface CreateUserData {
  email: string
  password: string
  role: RoleCode
  first_name: string
  last_name: string
  role_id: number
  contract_status_id: number
  created_by: number
}

/**
 * Register user data interface
 * Interfaz de datos para registro de usuario
 */
export interface RegisterUserData {
  email: string
  password: string
  role: RoleCode
  first_name: string
  last_name: string
}

/**
 * Auth result interface
 * Interfaz de resultado de autenticación
 */
export interface AuthResult {
  token: string
  user: User
}

/**
 * Login credentials interface
 * Interfaz de credenciales de login
 */
export interface LoginCredentials {
  email: string
  password: string
}
