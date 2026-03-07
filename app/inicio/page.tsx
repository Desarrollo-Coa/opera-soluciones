import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calculator,
  Shield,
  FileText,
  CalendarDays,
  Receipt,
  UserCircle,
  Settings,
  Activity,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { ROLE_CODES } from "@/lib/constants";
import { getRoleDisplayName } from "@/lib/role-utils";

// Tipos para los módulos del dashboard
type Module = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hoverColor: string;
  href?: string;
};

/**
 * Define los módulos disponibles según el rol del usuario
 * Mantiene todos los módulos solicitados para el Administrador
 */
function getRoleModules(role: string): Module[] {
  const adminModules: Module[] = [
    {
      title: "Gestión de Empleados",
      description: "Administrar personal, contratos y legajos del sistema",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50/50",
      hoverColor: "hover:bg-blue-50 hover:shadow-blue-100",
      href: "/inicio/empleados",
    },
    {
      title: "SGI / Normativa",
      description: "Sistema de gestión integrado y control documental",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50/50",
      hoverColor: "hover:bg-purple-50 hover:shadow-purple-100",
      href: "/inicio/sgi",
    },
    {
      title: "SST / Seguridad",
      description: "Seguridad y salud en el trabajo. Cumplimiento legal",
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-50/50",
      hoverColor: "hover:bg-orange-50 hover:shadow-orange-100",
      href: "/inicio/sst",
    },
    {
      title: "Ausencias y Permisos",
      description: "Control centralizado de ausencias del personal",
      icon: CalendarDays,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/50",
      hoverColor: "hover:bg-emerald-50 hover:shadow-emerald-100",
      href: "/ausencias",
    },
    {
      title: "Nómina y Pagos",
      description: "Gestión de liquidaciones y comprobantes",
      icon: Receipt,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50/50",
      hoverColor: "hover:bg-indigo-50 hover:shadow-indigo-100",
      href: "/inicio/nomina",
    },
    {
      title: "Contable y Financiero",
      description: "Balances, estados financieros y auditoría contable",
      icon: Calculator,
      color: "text-green-600",
      bgColor: "bg-green-50/50",
      hoverColor: "hover:bg-green-50 hover:shadow-green-100",
      href: "/inicio/contable",
    },
    {
      title: "Reportes Avanzados",
      description: "Analítica de datos y reportes gerenciales",
      icon: Activity,
      color: "text-rose-600",
      bgColor: "bg-rose-50/50",
      hoverColor: "hover:bg-rose-50 hover:shadow-rose-100",
      href: "/inicio/reports",
    },
    {
      title: "Configuración",
      description: "Parámetros globales y mantenimiento de plataforma",
      icon: Settings,
      color: "text-slate-600",
      bgColor: "bg-slate-50/50",
      hoverColor: "hover:bg-slate-50 hover:shadow-slate-100",
      href: "/inicio/settings",
    },
  ];

  const hrModules: Module[] = [
    {
      title: "Gestión de Empleados",
      description: "Administrar personal, contratos y legajos",
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50/50",
      hoverColor: "hover:bg-blue-50 hover:shadow-blue-100",
      href: "/inicio/empleados",
    },
    {
      title: "Nómina y Pagos",
      description: "Liquidaciones mensuales y volantes",
      icon: Receipt,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50/50",
      hoverColor: "hover:bg-indigo-50 hover:shadow-indigo-100",
      href: "/inicio/nomina",
    },
    {
      title: "Ausencias",
      description: "Control de asistencias y permisos",
      icon: CalendarDays,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/50",
      hoverColor: "hover:bg-emerald-50 hover:shadow-emerald-100",
      href: "/ausencias",
    },
    {
      title: "SST / Seguridad",
      description: "Seguridad y salud en el trabajo",
      icon: Shield,
      color: "text-orange-600",
      bgColor: "bg-orange-50/50",
      hoverColor: "hover:bg-orange-50 hover:shadow-orange-100",
      href: "/inicio/sst",
    },
    {
      title: "SGI / Documentos",
      description: "Sistema de gestión integrado",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50/50",
      hoverColor: "hover:bg-purple-50 hover:shadow-purple-100",
      href: "/inicio/sgi",
    },
  ];

  const employeeModules: Module[] = [
    {
      title: "Mi Perfil",
      description: "Información personal, contacto y legajo laboral",
      icon: UserCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50/50",
      hoverColor: "hover:bg-blue-50 hover:shadow-blue-100",
      href: "/inicio/perfil",
    },
    {
      title: "Mis Volantes",
      description: "Consulta y descarga tus colillas de pago",
      icon: Receipt,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50/50",
      hoverColor: "hover:bg-indigo-50 hover:shadow-indigo-100",
      href: "/inicio/nomina/mis-volantes",
    },
    {
      title: "Mis Ausencias",
      description: "Solicitud de permisos y registro de novedades",
      icon: CalendarDays,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50/50",
      hoverColor: "hover:bg-emerald-50 hover:shadow-emerald-100",
      href: "/ausencias",
    },
    {
      title: "SGI / Documentos",
      description: "Manuales, políticas y documentos normativos",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50/50",
      hoverColor: "hover:bg-purple-50 hover:shadow-purple-100",
      href: "/inicio/sgi",
    },
  ];

  if (role === ROLE_CODES.ADMIN) return adminModules;
  if (role === ROLE_CODES.HR) return hrModules;
  return employeeModules;
}

/**
 * Dashboard principal con tarjetas de módulos premium (Google Style)
 */
export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  let userRole: string;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    userRole = payload.role ?? ROLE_CODES.EMPLOYEE;
  } catch (error) {
    console.error("Error decoding token:", error);
    redirect("/login");
  }

  const roleDisplayName = getRoleDisplayName(userRole);
  const userModules = getRoleModules(userRole);

  return (
    <DashboardLayout userRole={userRole}>
      <div className="max-w-7xl mx-auto space-y-10 py-4">
        {/* Header - Welcome Section */}
        <div className="space-y-1">
          <h1 className="text-[32px] font-semibold tracking-tight text-[#1F1F1F]">
            {roleDisplayName}
          </h1>
          <p className="text-[#444746] text-lg font-medium">
            Gestiona tus herramientas y procesos de forma integrada
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userModules.map((module) => (
            <ModuleCard key={module.title} module={module} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

/**
 * Tarjeta de módulo con diseño Google/Premium
 */
function ModuleCard({ module }: { module: Module }) {
  const cardContent = (
    <Card
      className={`group h-full transition-all duration-300 border border-[#E0E0E0] rounded-3xl overflow-hidden bg-white shadow-none hover:border-transparent ${module.hoverColor} hover:shadow-xl`}
    >
      <CardHeader className="p-8 space-y-6">
        {/* Icon Container */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${module.bgColor}`}
        >
          <module.icon className={`w-8 h-8 ${module.color}`} strokeWidth={2.2} />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <CardTitle className="text-xl font-bold text-[#1F1F1F] tracking-tight group-hover:text-black">
            {module.title}
          </CardTitle>
          <CardDescription className="text-[15px] font-medium leading-relaxed text-[#5F6368] group-hover:text-[#444746]">
            {module.description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );

  return module.href ? (
    <Link href={module.href} className="no-underline">
      {cardContent}
    </Link>
  ) : (
    <div className="cursor-not-allowed grayscale-[0.5] opacity-80">
      {cardContent}
    </div>
  );
}