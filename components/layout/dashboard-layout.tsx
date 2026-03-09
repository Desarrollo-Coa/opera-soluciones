"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getRoleInitials } from "@/lib/role-utils"
import { SUCCESS_MESSAGES, ERROR_MESSAGES, ROLE_CODES } from "@/lib/constants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, Users, FileText, Settings, LogOut, Shield, User, FolderOpen, CalendarDays } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      await fetch("/api/auth/logout", { method: "POST" })
      toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS)
      window.location.href = "/login"
    } catch (error) {
      toast.error(ERROR_MESSAGES.INTERNAL_SERVER_ERROR)
    }
  }

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: "Inicio", href: "/inicio" },
      { icon: CalendarDays, label: "Ausencias", href: "/ausencias" },
    ];

    if (userRole === ROLE_CODES.ADMIN) {
      return [
        ...baseItems,
        { icon: FolderOpen, label: "SGI", href: "/inicio/sgi" },
        { icon: Users, label: "Empleados", href: "/inicio/empleados" },
        { icon: User, label: "Mi Perfil", href: "/inicio/perfil" },
      ];
    }

    if (userRole === ROLE_CODES.HR) {
      return [
        ...baseItems,
        { icon: FolderOpen, label: "SGI", href: "/inicio/sgi" },
        { icon: Users, label: "Empleados", href: "/inicio/empleados" },
        { icon: FileText, label: "Nómina", href: "/inicio/nomina" },
        { icon: User, label: "Mi Perfil", href: "/inicio/perfil" },
      ];
    }

    if (userRole === ROLE_CODES.EMPLOYEE) {
      return [
        ...baseItems.filter(item => item.href !== "/ausencias"),
        { icon: FileText, label: "Mis Volantes", href: "/inicio/nomina/mis-volantes" },
        { icon: User, label: "Mi Perfil", href: "/inicio/perfil" },
      ];
    }

    return [
      ...baseItems,
      { icon: User, label: "Mi Perfil", href: "/inicio/perfil" },
    ];
  };

  const menuItems = getMenuItems()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-gray-200/60 bg-[#F8FAFC] print:hidden">
        <SidebarHeader className="flex flex-row items-center gap-3 p-4 pb-2 pt-6 pl-5 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
          <Image
            src="/recursos/logopera.png"
            alt="SGI Opera Logo"
            width={48}
            height={48}
            className="w-12 h-12 rounded-sm object-contain shrink-0 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10"
          />
          <span className="text-[22px] font-google font-medium text-gray-800 tracking-tight truncate group-data-[collapsible=icon]:hidden">
            SGI Opera
          </span>
        </SidebarHeader>

        <SidebarContent className="mt-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href || (pathname.startsWith(item.href + "/") && item.href !== "/inicio")

                  return (
                    <SidebarMenuItem key={item.href} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        className={`transition-all duration-200 h-11 mx-3 w-[calc(100%-1.5rem)] rounded-full group-data-[collapsible=icon]:!m-0 group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center ${isActive
                          ? "bg-[#C2E7FF] hover:bg-[#D3EEFF] text-[#001D35] font-semibold"
                          : "text-[#444746] hover:bg-gray-100 hover:text-[#1F1F1F]"
                          }`}
                      >
                        <a href={item.href} className="flex items-center gap-4 px-4 h-full w-full group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:justify-center">
                          <item.icon
                            className={`!w-[20px] !h-[20px] shrink-0 group-data-[collapsible=icon]:!w-[20px] group-data-[collapsible=icon]:!h-[20px] ${isActive ? "text-[#001D35]" : "text-[#5F6368]"}`}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                          <span className={`text-[14px] leading-5 tracking-wide group-data-[collapsible=icon]:hidden ${isActive ? "font-semibold" : "font-medium"}`}>
                            {item.label}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="flex-1 flex flex-col min-w-0 bg-white w-full overflow-x-hidden min-h-screen print:h-auto">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 h-16 flex items-center px-4 sm:px-6 sticky top-0 z-30 gap-4 print:hidden">
          {/* Estilo para impresión limpia */}
          <style dangerouslySetInnerHTML={{
            __html: `
            @media print {
              .print\\:hidden, [role="status"], [data-radix-portal], [data-sonner-toaster] { 
                display: none !important; 
              }
              body { background: white !important; }
              /* Ocultar scrol y forzar visibilidad */
              html, body, [data-sidebar-provider], [data-sidebar-inset], main { 
                overflow: visible !important; 
                height: auto !important;
              }
              * { scrollbar-width: none !important; }
              ::-webkit-scrollbar { display: none !important; }
            }
          `}} />
          <SidebarTrigger className="-ml-2 text-gray-500 hover:text-gray-900 focus:ring-gray-200 hover:bg-gray-100/50 rounded-full" />

          <div className="flex items-center space-x-4 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  suppressHydrationWarning
                  className="relative h-9 w-9 rounded-full flex items-center justify-center p-0 overflow-hidden ring-2 ring-transparent transition-all hover:ring-gray-200"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-semibold text-sm">
                      {getRoleInitials(userRole)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-lg border-gray-100 p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900 leading-none">Usuario</p>
                    <p className="text-xs leading-none text-gray-500">Rol: {userRole}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer transition-colors px-2 py-2 mt-1"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 w-full overflow-x-auto bg-[#F8FAFC] print:bg-white print:p-0">
          <div className="w-full h-full p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto rounded-xl print:p-0">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
