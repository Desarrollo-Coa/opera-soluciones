// =====================================================
// SGI Opera Soluciones - File Utilities
// Utilidades para archivos
// =====================================================
// Description: Utility functions for file naming and management
// Descripción: Funciones utilitarias para nomenclatura y gestión de archivos
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { v4 as uuidv4 } from "uuid"

/**
 * Generate simple unique filename with UUID
 * Generar nombre de archivo único simple con UUID
 */
export function generateSimpleFileName(originalName: string): string {
  const uuid = uuidv4()
  const fileExtension = originalName.split('.').pop()
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits for additional uniqueness
  
  return `${uuid}_${timestamp}.${fileExtension}`
}

/**
 * Extract file extension from filename
 * Extraer extensión de archivo del nombre
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Validate file type
 * Validar tipo de archivo
 */
export function isValidFileType(
  filename: string,
  allowedTypes: string[]
): boolean {
  const extension = getFileExtension(filename)
  return allowedTypes.includes(extension)
}

/**
 * Validate file size
 * Validar tamaño de archivo
 */
export function isValidFileSize(
  fileSize: number,
  maxSizeInMB: number = 5
): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return fileSize <= maxSizeInBytes
}

/**
 * Get human readable file size
 * Obtener tamaño de archivo legible
 */
export function getHumanReadableFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
