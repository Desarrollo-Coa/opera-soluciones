// =====================================================
// SGI Opera Soluciones - Role Utilities
// Utilidades para manejo de roles
// =====================================================
// Description: Utilities for role code and name conversion
// Descripción: Utilidades para conversión entre códigos y nombres de roles
// Author: Carlos Muñoz
// Date: 2025-07-12
// =====================================================

import { ROLE_CODES } from './constants'

/**
 * Get display name for role code
 * Obtener nombre de visualización para código de rol
 */
export function getRoleDisplayName(roleCode: string): string {
  switch (roleCode) {
    case ROLE_CODES.ADMIN:
      return "Administrador"
    case ROLE_CODES.EMPLOYEE:
      return "Empleado"
    case ROLE_CODES.SISO:
      return "SISO"
    case ROLE_CODES.HR:
      return "Recursos Humanos"
    case ROLE_CODES.MANAGER:
      return "Gerente"
    case ROLE_CODES.AUDITOR:
      return "Auditor"
    default:
      return roleCode
  }
}

/**
 * Get role code from display name
 * Obtener código de rol desde nombre de visualización
 */
export function getRoleCodeFromName(roleName: string): string {
  const normalizedName = roleName.toLowerCase().trim()
  
  switch (normalizedName) {
    case "administrador":
      return ROLE_CODES.ADMIN
    case "empleado":
      return ROLE_CODES.EMPLOYEE
    case "siso":
      return ROLE_CODES.SISO
    case "recursos humanos":
      return ROLE_CODES.HR
    case "gerente":
      return ROLE_CODES.MANAGER
    case "auditor":
      return ROLE_CODES.AUDITOR
    default:
      return roleName.toUpperCase()
  }
}

/**
 * Get role badge variant for UI components
 * Obtener variante de badge para componentes de UI
 */
export function getRoleBadgeVariant(roleCode: string): "default" | "secondary" | "destructive" | "outline" {
  switch (roleCode) {
    case ROLE_CODES.ADMIN:
      return "destructive"
    case ROLE_CODES.HR:
      return "default"
    case ROLE_CODES.SISO:
      return "secondary"
    case ROLE_CODES.MANAGER:
      return "default"
    case ROLE_CODES.AUDITOR:
      return "secondary"
    default:
      return "outline"
  }
}

/**
 * Get role color for UI components
 * Obtener color de rol para componentes de UI
 */
export function getRoleColor(roleCode: string): string {
  switch (roleCode) {
    case ROLE_CODES.ADMIN:
      return "text-red-600 bg-red-50"
    case ROLE_CODES.HR:
      return "text-blue-600 bg-blue-50"
    case ROLE_CODES.SISO:
      return "text-purple-600 bg-purple-50"
    case ROLE_CODES.MANAGER:
      return "text-green-600 bg-green-50"
    case ROLE_CODES.AUDITOR:
      return "text-indigo-600 bg-indigo-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

/**
 * Get role icon initials for avatars
 * Obtener iniciales de icono de rol para avatares
 */
export function getRoleInitials(roleCode: string): string {
  switch (roleCode) {
    case ROLE_CODES.ADMIN:
      return "AD"
    case ROLE_CODES.EMPLOYEE:
      return "EM"
    case ROLE_CODES.SISO:
      return "SI"
    case ROLE_CODES.HR:
      return "RH"
    case ROLE_CODES.MANAGER:
      return "GE"
    case ROLE_CODES.AUDITOR:
      return "AU"
    default:
      return roleCode.substring(0, 2).toUpperCase()
  }
}

/**
 * Check if role code is valid
 * Verificar si el código de rol es válido
 */
export function isValidRoleCode(roleCode: string): boolean {
  return Object.values(ROLE_CODES).includes(roleCode as any)
}

/**
 * Get all role options for select components
 * Obtener todas las opciones de roles para componentes select
 */
export function getRoleOptions() {
  return [
    { value: ROLE_CODES.ADMIN, label: getRoleDisplayName(ROLE_CODES.ADMIN) },
    { value: ROLE_CODES.EMPLOYEE, label: getRoleDisplayName(ROLE_CODES.EMPLOYEE) },
    { value: ROLE_CODES.SISO, label: getRoleDisplayName(ROLE_CODES.SISO) },
    { value: ROLE_CODES.HR, label: getRoleDisplayName(ROLE_CODES.HR) },
    { value: ROLE_CODES.MANAGER, label: getRoleDisplayName(ROLE_CODES.MANAGER) },
    { value: ROLE_CODES.AUDITOR, label: getRoleDisplayName(ROLE_CODES.AUDITOR) },
  ]
}

/**
 * Get role options filtered by current user permissions
 * Obtener opciones de roles filtradas por permisos del usuario actual
 */
export function getRoleOptionsForUser(currentUserRole: string) {
  const allOptions = getRoleOptions()
  
  // Admin can assign any role
  if (currentUserRole === ROLE_CODES.ADMIN) {
    return allOptions
  }
  
  // HR can assign all roles except admin
  if (currentUserRole === ROLE_CODES.HR) {
    return allOptions.filter(option => option.value !== ROLE_CODES.ADMIN)
  }
  
  // Other roles cannot assign roles
  return []
} 