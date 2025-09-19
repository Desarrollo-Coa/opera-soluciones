import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SGI Opera Soluciones - Sistema de Gestión Integral",
  description: "Sistema de Gestión Integral para Opera Soluciones - Innovación y Excelencia",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* <header className="w-full flex justify-center py-4">
          <img src="/recursos/logopera.jpeg" alt="Opera Soluciones" className="h-12 w-auto" />
        </header> */}
        {children}
        <Toaster />
      </body>
    </html>
  )
}
