// =====================================================
// SGI Opera Soluciones - Users API
// API de usuarios
// =====================================================
// Description: User management API endpoints
// Descripción: Endpoints de API para gestión de usuarios
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES, SUCCESS_MESSAGES, ROLE_CODES } from "@/lib/constants"
import { z } from "zod"

// Validation schema for user creation
const createUserSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["ADMIN", "EMPLOYEE", "HR", "AUDITOR"]),
  contract_status_id: z.number().optional(),
})

/**
 * Get all users
 * Obtener todos los usuarios
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
    
    // Check if user has permission to view users
    if (!["ADMIN", "HR", "AUDITOR"].includes(payload.role)) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.FORBIDDEN 
      }, { status: 403 })
    }

    // Get all users
    const users = await userService.getAllUsers()

    return NextResponse.json(users)

  } catch (error) {
    console.error("Error getting users:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}

/**
 * Create a new user
 * Crear un nuevo usuario
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }, { status: 401 })
    }

    // Verify token and get user info
    const payload = await verifyToken(token)
    
    // Check if user has permission to create users
    if (!["ADMIN", "HR"].includes(payload.role)) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.FORBIDDEN 
      }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Check if user is trying to create an admin user
    // Only ADMIN users can create other ADMIN users
    if (validatedData.role === ROLE_CODES.ADMIN && payload.role !== ROLE_CODES.ADMIN) {
      return NextResponse.json({ 
        error: "Solo los administradores pueden crear otros administradores" 
      }, { status: 403 })
    }

    // Create user
    const user = await userService.createUser({
      ...validatedData,
      created_by: payload.id
    })

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGES.USER_CREATED,
      user
    }, { status: 201 })

  } catch (error) {
    console.error("Error creating user:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.errors
      }, { status: 400 })
    }
    
    if (error instanceof Error && error.message.includes("ya está registrado")) {
      return NextResponse.json({ 
        error: "El email ya está registrado" 
      }, { status: 409 })
    }
    
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}
