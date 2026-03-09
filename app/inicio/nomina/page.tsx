import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Settings2,
    FileText,
    Receipt,
    Users,
    Wallet2
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getResumenNomina, getCostosPorCargo, getHistoricoNomina } from "@/actions/nomina";
import { DashboardNominaClient } from "@/components/nomina/dashboard-client";
import { ROLE_CODES } from "@/lib/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, BarChart3 } from "lucide-react";

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
        title: "4. Clausulas Extralegales",
        description: "Gestión de Auxilios, Rodamientos y Beneficios",
        icon: FileText,
        color: "text-amber-600",
        bgColor: "bg-amber-100",
        hoverColor: "hover:bg-amber-200",
        href: "/inicio/nomina/clausulas",
    },
    {
        title: "5. Generar Volantes",
        description: "Pre-liquidación, Aprobación y Pago de Nómina",
        icon: Receipt,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
        hoverColor: "hover:bg-indigo-200",
        href: "/inicio/nomina/liquidaciones",
    },
    {
        title: "6. Préstamos de Nómina",
        description: "Gestión de créditos, cuotas e intereses automáticos",
        icon: Wallet2,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        hoverColor: "hover:bg-emerald-200",
        href: "/inicio/nomina/prestamos",
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

    // Protección: Solo Admin o RRHH deberían ver esto
    if (userRole !== ROLE_CODES.ADMIN && userRole !== ROLE_CODES.HR) {
        redirect("/inicio");
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

                <Tabs defaultValue="gestion" className="w-full">
                    <TabsList className="bg-slate-100 p-1 rounded-2xl mb-8 inline-flex">
                        <TabsTrigger value="gestion" className="rounded-xl px-8 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <LayoutGrid className="h-4 w-4" /> Gestión Operativa
                        </TabsTrigger>
                        <TabsTrigger value="reportes" className="rounded-xl px-8 flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <BarChart3 className="h-4 w-4" /> Reportes & Dashboard
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="gestion" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {NOMINA_MODULES.map((module) => (
                                <Link key={module.title} href={module.href} className="group no-underline">
                                    <Card className={`h-full transition-all duration-300 border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:border-indigo-200 hover:shadow-md`}>
                                        <CardHeader className="p-5 space-y-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${module.bgColor}`}>
                                                <module.icon className={`h-5 w-5 ${module.color}`} strokeWidth={2.5} />
                                            </div>
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                    {module.title.replace(/^\d+\.\s*/, '')}
                                                </CardTitle>
                                                <CardDescription className="text-[11px] leading-tight text-slate-500 line-clamp-2">
                                                    {module.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="reportes" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <DashboardNominaClient
                            initialResumen={initialResumen}
                            initialCostos={initialCostos as any[]}
                            initialHistorico={initialHistorico as any[]}
                            initialMes={mesActual.toString()}
                            initialAnio={anioActual.toString()}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
