import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/user-service"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES, ROLE_CODES } from "@/lib/constants"

// Forzar que esta ruta sea dinámica
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.UNAUTHORIZED 
      }, { status: 401 })
    }

    const payload = await verifyToken(token)
    
    // Only ADMIN, HR, AUDITOR can view collaborators
    if (!["ADMIN", "HR", "AUDITOR"].includes(payload.role)) {
      return NextResponse.json({ 
        error: ERROR_MESSAGES.FORBIDDEN 
      }, { status: 403 })
    }

    const allUsers = await userService.getAllUsers()
    // Filter out ADMIN users for the collaborators list
    const collaborators = allUsers.filter(user => user.role !== ROLE_CODES.ADMIN)

    return NextResponse.json(collaborators)

  } catch (error) {
    console.error("Error getting collaborators:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR 
    }, { status: 500 })
  }
}