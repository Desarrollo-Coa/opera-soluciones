import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardNominaClient } from "@/components/nomina/dashboard-client";
import { getResumenNomina, getCostosPorCargo, getHistoricoNomina } from "@/actions/nomina";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PieChart } from "lucide-react";
import Link from "next/link";

export default async function DashboardNominaPage({ searchParams }: { searchParams: Promise<{ mes?: string, anio?: string }> }) {
    const user = await getAuthUser();
    if (!user) redirect("/login");

    const now = new Date();
    const params = await searchParams;
    const mesActual = parseInt(params.mes || (now.getMonth() + 1).toString());
    const anioActual = parseInt(params.anio || now.getFullYear().toString());

    // Fetch initial data
    const [resResumen, resCostos, resHistorico] = await Promise.all([
        getResumenNomina(mesActual, anioActual),
        getCostosPorCargo(mesActual, anioActual),
        getHistoricoNomina()
    ]);

    const initialResumen = resResumen.success ? resResumen.data : null;
    const initialCostos = resCostos.success ? resCostos.data : [];
    const initialHistorico = resHistorico.success ? resHistorico.data : [];

    return (
        <DashboardLayout userRole={user.role}>
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                <Link href="/inicio/nomina"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <span className="text-sm font-medium text-muted-foreground">Regresar a Nómina</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-indigo-900 flex items-center gap-3">
                            <PieChart className="h-8 w-8 text-indigo-600" />
                            Reportes Gerenciales
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Análisis financiero detallado y egresos por periodo de nómina.
                        </p>
                    </div>
                </div>

                <DashboardNominaClient
                    initialResumen={initialResumen}
                    initialCostos={initialCostos as any[]}
                    initialHistorico={initialHistorico as any[]}
                    initialMes={mesActual.toString()}
                    initialAnio={anioActual.toString()}
                />
            </div>
        </DashboardLayout>
    );
}
