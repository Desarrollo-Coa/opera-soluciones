// =====================================================
// SGI Opera Soluciones - Token Verifier (Edge Compatible)
// Verificador de tokens compatible con Edge Runtime
// =====================================================
// Description: Token verification without database dependency for middleware
// Descripción: Verificación de tokens sin dependencia de base de datos para middleware
// Author: Carlos Muñoz
// Date: 2025-09-17
// =====================================================

import { jwtVerify } from 'jose'
import { ERROR_MESSAGES, DEFAULT_VALUES } from '@/lib/constants'
import { type JWTPayload } from './interfaces'

/**
 * Edge-compatible token verifier
 * Verificador de tokens compatible con Edge Runtime
 */
export class EdgeTokenVerifier {
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
   * Verify JWT token (Edge Runtime compatible)
   * Verificar token JWT (compatible con Edge Runtime)
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

// Singleton instance for middleware
const edgeTokenVerifier = new EdgeTokenVerifier()

/**
 * Edge-compatible token verification function
 * Función de verificación de tokens compatible con Edge Runtime
 */
export async function verifyTokenEdge(token: string): Promise<JWTPayload> {
  return edgeTokenVerifier.verifyToken(token)
}
