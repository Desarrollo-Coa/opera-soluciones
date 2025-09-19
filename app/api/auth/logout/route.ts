import { NextResponse } from "next/server"
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"

/**
 * Logout endpoint - Clear authentication token
 * Endpoint de logout - Limpiar token de autenticación
 */
export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
    })

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    
    return NextResponse.json({ 
      success: false,
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    }, { status: 500 })
  }
}
