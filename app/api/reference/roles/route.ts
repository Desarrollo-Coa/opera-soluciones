// =====================================================
// SGI Opera Soluciones - Roles Reference API
// API de referencia de roles
// =====================================================
// Description: Roles reference data API endpoint
// Descripción: Endpoint de API para datos de referencia de roles
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES } from "@/lib/constants"

/**
 * Get all roles
 * Obtener todos los roles
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
    await verifyToken(token)
    
    // Return roles data
    const roles = [
      { id: 1, name: "Administrador", code: "ADMIN" },
      { id: 2, name: "Empleado", code: "EMPLOYEE" },
      { id: 3, name: "Recursos Humanos", code: "HR" },
      { id: 4, name: "Auditor", code: "AUDITOR" }
    ]

    return NextResponse.json({
      success: true,
      roles
    })

  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'