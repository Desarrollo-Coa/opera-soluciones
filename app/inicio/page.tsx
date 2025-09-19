import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calculator, Shield, FileText, CalendarDays } from "lucide-react";
import Link from "next/link";

// Tipos para los módulos del dashboard
type Module = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hoverColor: string;
  href?: string; // Ruta opcional para módulos con enlace
};

// Configuración de los módulos del dashboard
const MODULES: Module[] = [
  {
    title: "Empleados",
    description: "Gestión de personal y recursos humanos",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    hoverColor: "hover:bg-blue-100",
    href: "/inicio/empleados",
  },
  {
    title: "Ausencias",
    description: "Gestión de ausencias laborales",
    icon: CalendarDays,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    hoverColor: "hover:bg-emerald-100",
    href: "/ausencias",
  },
  {
    title: "Contable",
    description: "Gestión financiera y contable",
    icon: Calculator,
    color: "text-green-600",
    bgColor: "bg-green-50",
    hoverColor: "hover:bg-green-100",
    href: "/inicio/contable",
  },
  {
    title: "SST",
    description: "Seguridad y salud en el trabajo",
    icon: Shield,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    hoverColor: "hover:bg-orange-100",
  },
  {
    title: "SGI",
    description: "Sistema de gestión integrado",
    icon: FileText,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    hoverColor: "hover:bg-purple-100",
    href: "/inicio/sgi",
  },
];

/**
 * Dashboard page - Main dashboard with module cards
 * Página del dashboard - Dashboard principal con tarjetas de módulos
 */
export default async function DashboardPage() {
  // Obtener token de autenticación de las cookies
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  // Redirigir al login si no se encuentra token
  if (!token) {
    redirect("/login");
  }

  // Obtener rol de usuario del token
  let userRole: string;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userRole = payload.role ?? "default"; // Valor por defecto si no hay rol
  } catch (error) {
    console.error("Error decoding token:", error);
    redirect("/login");
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Administrador</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((module) => (
            <ModuleCard key={module.title} module={module} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Componente para renderizar una tarjeta de módulo
 * @param {Module} module - Datos del módulo
 */
function ModuleCard({ module }: { module: Module }) {
  const cardContent = (
    <Card
      className={`transition-colors ${module.hoverColor} ${
        module.href ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <CardHeader className="text-center">
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-lg ${module.bgColor} mb-4`}
        >
          <module.icon className={`h-6 w-6 ${module.color}`} />
        </div>
        <CardTitle className="text-lg">{module.title}</CardTitle>
        <CardDescription className="text-sm">{module.description}</CardDescription>
      </CardHeader>
    </Card>
  );

  return module.href ? (
    <Link href={module.href} key={module.title}>
      {cardContent}
    </Link>
  ) : (
    <div key={module.title}>{cardContent}</div>
  );
}