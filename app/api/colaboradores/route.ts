// =====================================================
// SGI Opera Soluciones - Colaboradores API
// API de colaboradores para ausencias
// =====================================================
// Description: API para obtener colaboradores (excluyendo ADMIN)
// Descripción: API para obtener colaboradores (excluyendo ADMIN)
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES } from "@/lib/constants"

/**
 * Get all collaborators (excluding ADMIN users)
 * Obtener todos los colaboradores (excluyendo usuarios ADMIN)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }, { status: 401 })
    }

    // Verify token
    const payload = await verifyToken(token)
    
    // Check if user has permission to view collaborators
    if (!["ADMIN", "HR", "AUDITOR"].includes(payload.role)) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.FORBIDDEN 
      }, { status: 403 })
    }

    // Get all users and filter out ADMIN users
    const allUsers = await userService.getAllUsers()
    const colaboradores = allUsers.filter(user => user.role !== 'ADMIN')

    return NextResponse.json(colaboradores)

  } catch (error) {
    console.error("Error getting collaborators:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}
