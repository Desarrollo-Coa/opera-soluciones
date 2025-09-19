// =====================================================
// SGI Opera Soluciones - Auth Service
// Servicio de autenticación siguiendo SRP y DIP
// =====================================================
// Description: Servicio principal de autenticación
// Descripción: Servicio principal de autenticación
// Author: Carlos Muñoz
// Date: 2025-09-16
// =====================================================

import { IAuthService, IUserRepository, ITokenService, IPasswordService, User, JWTPayload, RegisterUserData, LoginCredentials } from './interfaces'
import { ERROR_MESSAGES, DEFAULT_VALUES } from '@/lib/constants'

/**
 * Authentication Service Implementation
 * Implementación del servicio de autenticación
 */
export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordService: IPasswordService
  ) {}

  /**
   * Login user with email and password
   * Iniciar sesión con email y contraseña
   */
  async login(email: string, password: string): Promise<string> {
    try {
      this.validateLoginCredentials({ email, password })
      
      const user = await this.userRepository.getUserByEmail(email)
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND)
      }

      const isValidPassword = await this.passwordService.verifyPassword(password, user.password)
      if (!isValidPassword) {
        throw new Error(ERROR_MESSAGES.INVALID_PASSWORD)
      }

      const payload = this.createJWTPayload(user)
      return await this.tokenService.signToken(payload)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  /**
   * Register new user
   * Registrar nuevo usuario
   */
  async register(userData: RegisterUserData): Promise<string> {
    try {
      this.validateRegisterData(userData)
      
      // Check if user already exists
      const existingUser = await this.userRepository.getUserByEmail(userData.email)
      if (existingUser) {
        throw new Error(ERROR_MESSAGES.USER_ALREADY_EXISTS)
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(userData.password)
      
      // Create user
      const createUserData = {
        ...userData,
        password: hashedPassword,
        role_id: DEFAULT_VALUES.ADMIN_ROLE_ID,
        contract_status_id: DEFAULT_VALUES.ACTIVE_CONTRACT_STATUS_ID,
        created_by: DEFAULT_VALUES.ADMIN_USER_ID
      }

      const user = await this.userRepository.createUser(createUserData)
      
      const payload = this.createJWTPayload(user)
      return await this.tokenService.signToken(payload)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  /**
   * Verify JWT token
   * Verificar token JWT
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      this.validateToken(token)
      return await this.tokenService.verifyToken(token)
    } catch (error) {
      console.error('Token verification error:', error)
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN)
    }
  }

  /**
   * Create JWT payload from user
   * Crear payload JWT desde usuario
   */
  private createJWTPayload(user: User): JWTPayload {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    }
  }

  /**
   * Validate login credentials
   * Validar credenciales de login
   */
  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (!credentials.email || !credentials.password) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS)
    }

    if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS)
    }
  }

  /**
   * Validate register data
   * Validar datos de registro
   */
  private validateRegisterData(data: RegisterUserData): void {
    if (!data.email || !data.password || !data.role || !data.first_name || !data.last_name) {
      throw new Error(ERROR_MESSAGES.INVALID_USER_DATA)
    }

    if (data.password.length < 6) {
      throw new Error(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    }
  }

  /**
   * Validate token input
   * Validar entrada de token
   */
  private validateToken(token: string): void {
    if (!token || typeof token !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_TOKEN)
    }
  }
}
