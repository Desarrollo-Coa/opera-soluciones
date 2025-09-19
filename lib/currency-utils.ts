/**
 * Utility functions for currency formatting
 * Funciones utilitarias para formateo de moneda
 */

/**
 * Format a number as Colombian Peso currency
 * Formatear un número como moneda colombiana
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (!amount || amount === 0) return '$ 0'
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) return '$ 0'
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount)
}

/**
 * Parse currency string to number
 * Convertir string de moneda a número
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0
  
  // Remove all non-numeric characters except decimal point
  const numericString = currencyString.replace(/[^\d]/g, '')
  return parseFloat(numericString) || 0
}
