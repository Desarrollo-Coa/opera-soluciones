import { type NextRequest, NextResponse } from "next/server"
import { signToken, verifyPassword, hashPassword } from "@/lib/auth"
import { getUserByEmailWithStatus, createUser } from "@/database/users"
import { loginSchema } from "@/lib/validations"
import { ERROR_MESSAGES, SUCCESS_MESSAGES, type RoleCode, ROLE_CODES, DEFAULT_VALUES } from "@/lib/constants"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user by email with active contract status
    // Buscar usuario por email con estado de contrato activo
    const user = await getUserByEmailWithStatus(email)

    if (!user) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.INVALID_CREDENTIALS
      }, { status: 401 })
    }

    // Verify password
    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.INVALID_CREDENTIALS
      }, { status: 401 })
    }

    // Create JWT token
    // Crear token JWT
    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role_code as RoleCode,
      first_name: user.first_name,
      last_name: user.last_name,
    })

    // Set cookie and return response
    // Establecer cookie y devolver respuesta
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        nombres: user.first_name,
        apellidos: user.last_name, 
        email: user.email,
        role: user.role_code,
        role_name: user.role_name,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours / 24 horas
    })

    return response
  } catch (error) {
    console.error("Login error / Error de login:", error)
    
    // Handle specific validation errors
    // Manejar errores específicos de validación
    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.VALIDATION_ERROR
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    }, { status: 500 })
  }
}
