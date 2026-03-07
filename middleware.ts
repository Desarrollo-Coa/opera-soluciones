import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/token-verifier"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes - Dashboard pages
  if (pathname.startsWith("/inicio")) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      console.log(`[Middleware] No token found for ${pathname}. Redirecting to /login`)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      const payload = await verifyTokenEdge(token)
      // Token is valid, proceed
      return NextResponse.next()
    } catch (error) {
      console.error(`[Middleware] Token verification failed for ${pathname}:`, error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/inicio/:path*"
  ],
}
