// =====================================================
// SGI Opera Soluciones - Auth Factory
// Factory para servicios de autenticación siguiendo DIP
// =====================================================
// Description: Factory para crear instancias de servicios de autenticación
// Descripción: Factory para crear instancias de servicios de autenticación
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

import { getConnection } from '@/lib/database'
import { IAuthService, IUserRepository, ITokenService, IPasswordService } from './interfaces'
import { AuthService } from './auth.service'
import { MySQLUserRepository } from './user.repository'
import { TokenService } from './token.service'
import { PasswordService } from './password.service'

/**
 * Authentication Factory
 * Factory de autenticación
 */
export class AuthFactory {
  private static tokenService: ITokenService | null = null
  private static passwordService: IPasswordService | null = null

  /**
   * Create authentication service with dependency injection
   * Crear servicio de autenticación con inyección de dependencias
   */
  static async createAuthService(): Promise<IAuthService> {
    try {
      const connection = await getConnection()
      const userRepository = new MySQLUserRepository(connection)
      const tokenService = this.getTokenService()
      const passwordService = this.getPasswordService()
      
      return new AuthService(userRepository, tokenService, passwordService)
    } catch (error) {
      console.error('Error creating auth service:', error)
      throw new Error('Failed to create authentication service')
    }
  }

  /**
   * Create user repository
   * Crear repositorio de usuarios
   */
  static async createUserRepository(): Promise<IUserRepository> {
    try {
      const connection = await getConnection()
      return new MySQLUserRepository(connection)
    } catch (error) {
      console.error('Error creating user repository:', error)
      throw new Error('Failed to create user repository')
    }
  }

  /**
   * Create token service (singleton)
   * Crear servicio de tokens (singleton)
   */
  static getTokenService(): ITokenService {
    if (!this.tokenService) {
      this.tokenService = new TokenService()
    }
    return this.tokenService
  }

  /**
   * Create password service (singleton)
   * Crear servicio de contraseñas (singleton)
   */
  static getPasswordService(): IPasswordService {
    if (!this.passwordService) {
      this.passwordService = new PasswordService()
    }
    return this.passwordService
  }

  /**
   * Reset singletons (for testing)
   * Reiniciar singletons (para testing)
   */
  static resetSingletons(): void {
    this.tokenService = null
    this.passwordService = null
  }
}
