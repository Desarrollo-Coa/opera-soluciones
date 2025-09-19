import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log("Middleware called for pathname:", pathname)

  // Protected routes - Dashboard pages
  if (pathname.startsWith("/inicio")) {
    const token = request.cookies.get("auth-token")?.value
    console.log("Token found:", !!token)

    if (!token) {
      console.log("No token found, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      console.log("Verifying token with Edge verifier...")
      const payload = await verifyTokenEdge(token)
      console.log("Token verified successfully for user:", payload.email)
      return NextResponse.next()
    } catch (error) {
      console.error("Middleware token verification error:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // No protected API routes needed - only auth routes remain

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/inicio/:path*"
  ],
}
