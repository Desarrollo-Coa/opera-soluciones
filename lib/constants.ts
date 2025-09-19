// =====================================================
// SGI Opera Soluciones - Constants
// Constantes del sistema
// =====================================================
// Description: System-wide constants and configuration values
// Descripción: Constantes y valores de configuración del sistema
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

/**
 * Role codes for user roles
 * Códigos de roles de usuario
 */
export const ROLE_CODES = {
  ADMIN: 'ADMIN',
  EMPLOYEE: 'EMPLOYEE',
  HR: 'HR',
  AUDITOR: 'AUDITOR',
} as const;

/**
 * Field length limits for validation
 * Límites de longitud de campos para validación
 */
export const FIELD_LENGTHS = {
  EMAIL_MAX: 150,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 255,
  NAME_MAX: 100,
  PHONE_MAX: 20,
  ADDRESS_MAX: 255,
  POSITION_MAX: 100,
  DOCUMENT_NUMBER_MAX: 20,
  DEPARTMENT_MAX: 100,
  BANK_NAME_MAX: 100,
  ACCOUNT_NUMBER_MAX: 50,
  PROFILE_PICTURE_MAX: 500,
  NOTES_MAX: 1000,
} as const;

/**
 * Validation patterns for input validation
 * Patrones de validación para validación de entrada
 */
export const VALIDATION_PATTERNS = {
  DOCUMENT_NUMBER: /^[0-9]{6,12}$/,
  PHONE: /^[+]?[0-9\s\-\(\)]{7,15}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

/**
 * Default values for system configuration
 * Valores por defecto para configuración del sistema
 */
export const DEFAULT_VALUES = {
  ADMIN_ROLE_ID: 1,
  ADMIN_USER_ID: 1,
  ACTIVE_CONTRACT_STATUS_ID: 1,
  JWT_EXPIRATION: '24h',
  PASSWORD_HASH_ROUNDS: 12,
} as const;

/**
 * Error messages for consistent error handling
 * Mensajes de error para manejo consistente de errores
 */
export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  USER_NOT_FOUND: 'Usuario no encontrado',
  INVALID_PASSWORD: 'Contraseña incorrecta',
  UNAUTHORIZED: 'No autorizado',
  TOKEN_EXPIRED: 'Token expirado',
  INVALID_TOKEN: 'Token inválido',
  USER_ALREADY_EXISTS: 'El usuario ya existe',
  
  // Database errors
  DATABASE_ERROR: 'Error de base de datos',
  CONNECTION_ERROR: 'Error de conexión',
  
  // Validation errors
  INVALID_EMAIL: 'Email inválido',
  INVALID_EMAIL_FORMAT: 'Formato de email inválido',
  INVALID_EMAIL_INPUT: 'Entrada de email inválida',
  INVALID_ROLE: 'Rol inválido',
  MISSING_FIELDS: 'Faltan campos requeridos',
  INVALID_USER_DATA: 'Datos de usuario inválidos',
  INVALID_PASSWORD_INPUT: 'Entrada de contraseña inválida',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
  PASSWORD_HASH_ERROR: 'Error al hashear contraseña',
  INVALID_HASH_INPUT: 'Entrada de hash inválida',
  INVALID_ID_INPUT: 'ID inválido',
  INVALID_TOKEN_INPUT: 'Entrada de token inválida',
  TOKEN_SIGNING_ERROR: 'Error al firmar token',
  VALIDATION_ERROR: 'Datos de entrada inválidos',
  
  // General errors
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  NOT_FOUND: 'Recurso no encontrado',
  FORBIDDEN: 'Acceso denegado',
} as const;

/**
 * Success messages for consistent success handling
 * Mensajes de éxito para manejo consistente de éxitos
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Inicio de sesión exitoso',
  LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
} as const;

/**
 * Type definitions for better type safety
 * Definiciones de tipos para mejor seguridad de tipos
 */
export type RoleCode = typeof ROLE_CODES[keyof typeof ROLE_CODES];
export type ErrorMessage = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];
export type SuccessMessage = typeof SUCCESS_MESSAGES[keyof typeof SUCCESS_MESSAGES];

/**
 * Helper functions for role validation
 * Funciones auxiliares para validación de roles
 */
export const isAdmin = (role: string): boolean => role === ROLE_CODES.ADMIN;
export const isHR = (role: string): boolean => role === ROLE_CODES.HR;
export const isEmployee = (role: string): boolean => role === ROLE_CODES.EMPLOYEE;
export const isAuditor = (role: string): boolean => role === ROLE_CODES.AUDITOR;

/**
 * Check if role has admin privileges
 * Verificar si el rol tiene privilegios de administrador
 */
export const hasAdminPrivileges = (role: string): boolean => {
  return isAdmin(role) || isHR(role);
};

/**
 * Check if role can manage users
 * Verificar si el rol puede gestionar usuarios
 */
export const canManageUsers = (role: string): boolean => {
  return isAdmin(role) || isHR(role);
};

/**
 * Check if role can view reports
 * Verificar si el rol puede ver reportes
 */
export const canViewReports = (role: string): boolean => {
  return isAdmin(role) || isHR(role) || isAuditor(role);
};

/**
 * Navigation links for header
 * Enlaces de navegación para el header
 */
export const NAVIGATION_LINKS = [
  { href: "#inicio", label: "Inicio" },
  { href: "#quienes-somos", label: "Quiénes Somos" },
  { href: "#mision-vision", label: "Misión y Visión" },
] as const;

/**
 * Dashboard components mapping
 * Mapeo de componentes de dashboard
 */
export const DASHBOARD_COMPONENTS = {
  ADMIN: "AdminDashboard",
  EMPLOYEE: "EmployeeDashboard", 
  HR: "HRDashboard",
  AUDITOR: "AuditorDashboard",
} as const;


