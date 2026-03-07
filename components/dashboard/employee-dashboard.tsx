import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarDays, FileText, Receipt, UserCircle } from "lucide-react"
import Link from "next/link"

interface Module {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hoverColor: string;
  href?: string;
}

const EMPLOYEE_MODULES: Module[] = [
  {
    title: "Mi Perfil",
    description: "Ver y actualizar tu información personal",
    icon: UserCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    href: "/inicio/perfil",
  },
  {
    title: "Mis Volantes",
    description: "Consulta tus volantes de pago y liquidaciones",
    icon: Receipt,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverColor: "hover:bg-indigo-100",
    href: "/inicio/nomina/mis-volantes", // Ruta sugerida para volantes propios
  },
  {
    title: "Ausencias",
    description: "Solicitar permisos y ver historial de ausencias",
    icon: CalendarDays,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverColor: "hover:bg-emerald-100",
    href: "/ausencias",
  },
  {
    title: "SGI / Documentos",
    description: "Acceso al Sistema de Gestión Integrado",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    href: "/inicio/sgi",
  },
];

export function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal del Colaborador</h1>
          <p className="text-gray-600 mt-2">Bienvenido a tu panel de gestión personal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {EMPLOYEE_MODULES.map((module) => (
          <Link href={module.href || "#"} key={module.title}>
            <Card
              className={`transition-all duration-200 border-none shadow-sm hover:shadow-md cursor-pointer ${module.hoverColor}`}
            >
              <CardHeader className="text-center">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${module.bgColor} mb-4`}
                >
                  <module.icon className={`h-7 w-7 ${module.color}`} />
                </div>
                <CardTitle className="text-lg font-bold">{module.title}</CardTitle>
                <CardDescription className="text-sm font-medium mt-1">{module.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
