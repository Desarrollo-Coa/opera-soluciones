// =====================================================
// SGI Opera Soluciones - Contract Statuses Reference API
// API de referencia de estados de contrato
// =====================================================
// Description: Contract statuses reference data API endpoint
// Descripción: Endpoint de API para datos de referencia de estados de contrato
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES } from "@/lib/constants"

/**
 * Get all contract statuses
 * Obtener todos los estados de contrato
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
    
    // Return contract statuses data
    const contract_statuses = [
      { id: 1, name: "Activo" },
      { id: 2, name: "Inactivo" },
      { id: 3, name: "Terminado" }
    ]

    return NextResponse.json({
      success: true,
      contract_statuses
    })

  } catch (error) {
    console.error("Error fetching contract statuses:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'