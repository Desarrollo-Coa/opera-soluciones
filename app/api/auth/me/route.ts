import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { ERROR_MESSAGES } from "@/lib/constants"

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  
  if (!token) {
    return NextResponse.json({ 
      error: ERROR_MESSAGES.UNAUTHORIZED 
    }, { status: 401 })
  }
  
  try {
    const payload = await verifyToken(token)
    return NextResponse.json({
      id: payload.id,
      role: payload.role,
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ 
      error: ERROR_MESSAGES.UNAUTHORIZED 
    }, { status: 401 })
  }
} 