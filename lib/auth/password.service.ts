// =====================================================
// SGI Opera Soluciones - Password Service
// Servicio de contraseñas siguiendo SRP
// =====================================================
// Description: Servicio para manejo de contraseñas
// Descripción: Servicio para manejo de contraseñas
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

import bcrypt from 'bcryptjs'
import { IPasswordService } from './interfaces'
import { DEFAULT_VALUES, ERROR_MESSAGES } from '@/lib/constants'

/**
 * Password Service Implementation
 * Implementación del servicio de contraseñas
 */
export class PasswordService implements IPasswordService {
  private readonly saltRounds: number

  constructor() {
    this.saltRounds = DEFAULT_VALUES.PASSWORD_HASH_ROUNDS
  }

  /**
   * Hash password using bcrypt
   * Hashear contraseña usando bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    try {
      this.validatePassword(password)
      return await bcrypt.hash(password, this.saltRounds)
    } catch (error) {
      console.error('Error hashing password:', error)
      throw new Error(ERROR_MESSAGES.PASSWORD_HASH_ERROR)
    }
  }

  /**
   * Verify password against hash
   * Verificar contraseña contra hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      this.validatePassword(password)
      this.validateHash(hash)
      return await bcrypt.compare(password, hash)
    } catch (error) {
      console.error('Error verifying password:', error)
      return false
    }
  }

  /**
   * Validate password input
   * Validar entrada de contraseña
   */
  private validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_PASSWORD_INPUT)
    }

    if (password.length < 6) {
      throw new Error(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    }
  }

  /**
   * Validate hash input
   * Validar entrada de hash
   */
  private validateHash(hash: string): void {
    if (!hash || typeof hash !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_HASH_INPUT)
    }
  }
}
