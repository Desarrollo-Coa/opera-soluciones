import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/auth/token-verifier"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth-token")?.value

  // Rutas de invitado (Solo accesibles si NO está autenticado)
  if (pathname === "/login") {
    if (token) {
      try {
        await verifyTokenEdge(token)
        // Token válido, redirigir al inicio
        return NextResponse.redirect(new URL("/inicio", request.url))
      } catch (error) {
        // Token inválido, dejar que entre al login (limpiar cookie si es necesario)
        return NextResponse.next()
      }
    }
  }

  // Rutas protegidas - Páginas del Dashboard
  if (pathname.startsWith("/inicio")) {
    if (!token) {
      console.log(`[Middleware] No token found for ${pathname}. Redirecting to /login`)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      await verifyTokenEdge(token)
      // Token válido, proceder
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
    "/inicio/:path*",
    "/login"
  ],
}
