// =====================================================
// SGI Opera Soluciones - Token Service
// Servicio de tokens JWT siguiendo SRP
// =====================================================
// Description: Servicio para manejo de tokens JWT
// Descripción: Servicio para manejo de tokens JWT
// Author: Carlos Muñoz
// Date: 2025-09-17
// =====================================================

import { SignJWT, jwtVerify } from 'jose'
import { ITokenService, JWTPayload } from './interfaces'
import { DEFAULT_VALUES, ERROR_MESSAGES } from '@/lib/constants'

/**
 * JWT Token Service Implementation
 * Implementación del servicio de tokens JWT
 */
export class TokenService implements ITokenService {
  private readonly secret: Uint8Array

  constructor() {
    this.validateEnvironment()
    this.secret = this.createSecret()
  }

  /**
   * Validate required environment variables
   * Validar variables de entorno requeridas
   */
  private validateEnvironment(): void {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required')
    }
  }

  /**
   * Create secret from environment variable
   * Crear secreto desde variable de entorno
   */
  private createSecret(): Uint8Array {
    const jwtSecret = process.env.JWT_SECRET!
    return new TextEncoder().encode(jwtSecret)
  }

  /**
   * Sign JWT token
   * Firmar token JWT
   */
  async signToken(payload: JWTPayload): Promise<string> {
    try {
      return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(DEFAULT_VALUES.JWT_EXPIRATION)
        .sign(this.secret)
    } catch (error) {
      console.error('Error signing token:', error)
      throw new Error(ERROR_MESSAGES.TOKEN_SIGNING_ERROR)
    }
  }

  /**
   * Verify JWT token
   * Verificar token JWT
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secret)
      
      if (!this.isValidPayload(payload)) {
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN)
      }

      return payload as JWTPayload
    } catch (error) {
      console.error('Error verifying token:', error)
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN)
    }
  }

  /**
   * Validate JWT payload structure
   * Validar estructura del payload JWT
   */
  private isValidPayload(payload: any): payload is JWTPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.id === 'number' &&
      typeof payload.email === 'string' &&
      typeof payload.role === 'string' &&
      typeof payload.first_name === 'string' &&
      typeof payload.last_name === 'string'
    )
  }
}
