"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getRoleInitials } from "@/lib/role-utils"
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Users, FileText, Settings, LogOut, Shield, User, Menu, X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        description: "Has cerrado sesión exitosamente",
      })
      window.location.href = "/login"
    } catch (error) {
      toast({
        title: "Error",
        description: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        variant: "destructive",
      })
    }
  }

  const getMenuItems = () => {
    return [
      { icon: Home, label: "Inicio", href: "/inicio" },
      { icon: User, label: "Mi Perfil", href: "/inicio/perfil" },
    ]
  }

  const menuItems = getMenuItems()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 w-full max-w-full overflow-x-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <div
          className={`
          bg-white shadow-xl z-50
          w-64
          fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0
        `}
        >
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h1 className="text-xl font-bold text-blue-700 tracking-wide">SGI Opera</h1>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="mt-6 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-4rem)] pb-6">
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center px-6 py-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-900 transition-colors font-medium"
              >
                <item.icon className="w-5 h-5 mr-3 text-blue-500" />
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="bg-white/80 backdrop-blur-md shadow-sm border-b h-16 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full flex items-center justify-center">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                        {getRoleInitials(userRole)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Usuario</p>
                      <p className="text-xs leading-none text-muted-foreground">Rol: {userRole}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 w-full overflow-x-auto">
            <div className="w-full h-full p-4 sm:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
