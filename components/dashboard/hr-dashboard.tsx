import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calculator, Shield, CalendarDays, Receipt, FileText } from "lucide-react"
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

const HR_MODULES: Module[] = [
  {
    title: "Gestión de Empleados",
    description: "Administrar personal, contratos y perfiles",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    href: "/inicio/empleados",
  },
  {
    title: "Nómina y Liquidaciones",
    description: "Procesar pagos y gestionar volantes",
    icon: Receipt,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    hoverColor: "hover:bg-indigo-100",
    href: "/inicio/nomina",
  },
  {
    title: "Ausencias y Permisos",
    description: "Control de asistencias y novedades",
    icon: CalendarDays,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverColor: "hover:bg-emerald-100",
    href: "/ausencias",
  },
  {
    title: "SST / Seguridad",
    description: "Gestión de seguridad y salud en el trabajo",
    icon: Shield,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
    href: "/inicio/sst", // Ruta para SST
  },
  {
    title: "SGI / Normativa",
    description: "Sistema de Gestión Integrado y documentos",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    href: "/inicio/sgi",
  },
];

export function HRDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Talento Humano</h1>
        <p className="text-gray-600 mt-2">Bienvenido, gestiona los procesos de personal y nómina</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {HR_MODULES.map((module) => (
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
