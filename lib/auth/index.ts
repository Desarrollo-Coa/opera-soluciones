// =====================================================
// SGI Opera Soluciones - Auth Module
// Módulo de autenticación refactorizado siguiendo Clean Code y SOLID
// =====================================================
// Description: Punto de entrada principal para el módulo de autenticación
// Descripción: Punto de entrada principal para el módulo de autenticación
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

// Export interfaces
export * from './interfaces'

// Export services
export { AuthService } from './auth.service'
export { TokenService } from './token.service'
export { PasswordService } from './password.service'
export { MySQLUserRepository } from './user.repository'

// Export factory
export { AuthFactory } from './auth.factory'

// Export convenience functions for backward compatibility
import { AuthFactory } from './auth.factory'
import { type RoleCode } from '@/lib/constants'
import { type RegisterUserData } from './interfaces'

// Export Edge-compatible functions
export { verifyTokenEdge } from './token-verifier'

/**
 * Login user (convenience function)
 * Iniciar sesión de usuario (función de conveniencia)
 */
export async function login(email: string, password: string): Promise<string> {
  const authService = await AuthFactory.createAuthService()
  return authService.login(email, password)
}

/**
 * Register user (convenience function)
 * Registrar usuario (función de conveniencia)
 */
export async function register(
  email: string,
  password: string,
  role: RoleCode,
  first_name: string,
  last_name: string
): Promise<string> {
  const authService = await AuthFactory.createAuthService()
  const userData: RegisterUserData = {
    email,
    password,
    role,
    first_name,
    last_name
  }
  return authService.register(userData)
}

/**
 * Verify token (convenience function)
 * Verificar token (función de conveniencia)
 */
export async function verifyToken(token: string) {
  const authService = await AuthFactory.createAuthService()
  return authService.verifyToken(token)
}

/**
 * Hash password (convenience function)
 * Hashear contraseña (función de conveniencia)
 */
export async function hashPassword(password: string): Promise<string> {
  const passwordService = AuthFactory.getPasswordService()
  return passwordService.hashPassword(password)
}

/**
 * Verify password (convenience function)
 * Verificar contraseña (función de conveniencia)
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordService = AuthFactory.getPasswordService()
  return passwordService.verifyPassword(password, hash)
}

/**
 * Sign token (convenience function)
 * Firmar token (función de conveniencia)
 */
export async function signToken(payload: any): Promise<string> {
  const tokenService = AuthFactory.getTokenService()
  return tokenService.signToken(payload)
}
