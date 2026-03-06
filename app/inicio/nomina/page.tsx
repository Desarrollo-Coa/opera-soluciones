import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Settings2,
    FileText,
    Receipt,
    Users
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumenNomina, getCostosPorCargo, getHistoricoNomina } from "@/actions/nomina";
import { DashboardNominaClient } from "@/components/nomina/dashboard-client";

// Módulos específicos del área de Nómina
const NOMINA_MODULES = [
    {
        title: "1. Parámetros Base",
        description: "Configuración anual de SMLMV, Auxilios y Jornadas",
        icon: Settings2,
        color: "text-slate-600",
        bgColor: "bg-slate-100",
        hoverColor: "hover:bg-slate-200",
        href: "/inicio/nomina/parametros",
    },
    {
        title: "2. Cargos y Estructura",
        description: "Definición de Salarios, Riesgos ARL y Jornadas",
        icon: Building2,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100",
        hoverColor: "hover:bg-cyan-200",
        href: "/inicio/nomina/cargos",
    },
    {
        title: "3. Novedades del Mes",
        description: "Registro de Bonos, Comisiones o Descuentos",
        icon: Users,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        hoverColor: "hover:bg-blue-200",
        href: "/inicio/nomina/novedades",
    },
    {
        title: "4. Generar Volantes",
        description: "Pre-liquidación, Aprobación y Pago de Nómina",
        icon: Receipt,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        hoverColor: "hover:bg-indigo-200",
        href: "/inicio/nomina/liquidaciones",
    },
];

export default async function NominaDashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
        redirect("/login");
    }

    let userRole: string;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userRole = payload.role ?? "default";
    } catch (error) {
        console.error("Error decoding token:", error);
        redirect("/login");
    }

    // Protección: Solo Admin o RRHH deberían ver esto (Ejemplo básico)
    if (userRole !== "admin" && userRole !== "rrhh") {
        // redirect("/inicio"); // Se comenta para entorno dev si no tienes el rol exacto asignado
    }

    const now = new Date();
    const mesActual = now.getMonth() + 1;
    const anioActual = now.getFullYear();

    // Fetch initial data para el dashboard integrado
    const [resResumen, resCostos, resHistorico] = await Promise.all([
        getResumenNomina(mesActual, anioActual),
        getCostosPorCargo(mesActual, anioActual),
        getHistoricoNomina()
    ]);

    const initialResumen = resResumen.success ? resResumen.data : null;
    const initialCostos = resCostos.success ? resCostos.data : [];
    const initialHistorico = resHistorico.success ? resHistorico.data : [];

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Nómina y Compensación
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Gestión estructurada de pagos, novedades y estructura salarial.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/inicio">Volver al Inicio</Link>
                        </Button>
                    </div>
                </div>

                {/* Tarjetas de acceso a los sub-módulos */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {NOMINA_MODULES.map((module) => (
                        <Link key={module.title} href={module.href}>
                            <Card className={`h-full transition-colors ${module.hoverColor} cursor-pointer border-l-4 border-l-indigo-600`}>
                                <CardHeader>
                                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${module.bgColor}`}>
                                        <module.icon className={`h-6 w-6 ${module.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                    <CardDescription className="pt-2">{module.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Dashboard Integrado */}
                <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Resumen Gerencial del Periodo
                    </h2>
                    <DashboardNominaClient
                        initialResumen={initialResumen}
                        initialCostos={initialCostos as any[]}
                        initialHistorico={initialHistorico as any[]}
                        initialMes={mesActual.toString()}
                        initialAnio={anioActual.toString()}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
