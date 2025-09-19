// =====================================================
// SGI Opera Soluciones - Password Verifier
// Verificador de contraseñas para operaciones sensibles
// =====================================================

import { executeQuery } from '@/lib/database';
import { verifyPassword } from '@/lib/auth';
import { NextRequest } from 'next/server';

/**
 * Verificar contraseña del usuario actual
 * @param userId ID del usuario
 * @param password Contraseña a verificar
 * @returns true si la contraseña es correcta
 */
export async function verifyUserPassword(userId: number, password: string): Promise<boolean> {
  try {
    // Obtener hash de contraseña del usuario
    const users = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ? AND is_active = TRUE',
      [userId]
    ) as any[];

    if (users.length === 0) {
      return false;
    }

    const passwordHash = users[0].password_hash;
    
    // Verificar contraseña usando la misma función que el login
    return await verifyPassword(password, passwordHash);
  } catch (error) {
    console.error('Error verifying user password:', error);
    return false;
  }
}

/**
 * Obtener ID del usuario desde el token JWT
 * @param request Request de Next.js
 * @returns ID del usuario o null
 */
export function getUserIdFromToken(request: NextRequest): number | null {
  try {
    // Obtener token de las cookies (mismo método que usa el sistema)
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return null;
    }

    // Decodificar el payload del JWT
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}
