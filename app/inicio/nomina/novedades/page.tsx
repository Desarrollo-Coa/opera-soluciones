import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NovedadesClient } from "@/components/nomina/novedades-client";
import { getNovedades, getConceptos, isPeriodoAprobadoAction } from "@/actions/nomina";
import { getEmployeesSimple } from "@/actions/employees-actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default async function NovedadesPage({ searchParams }: { searchParams: Promise<{ mes?: string, anio?: string, quincena?: string }> }) {
    const user = await getAuthUser();
    if (!user) redirect("/login");

    const now = new Date();
    const params = await searchParams;
    const mesActual = parseInt(params.mes || (now.getMonth() + 1).toString());
    const anioActual = parseInt(params.anio || now.getFullYear().toString());
    const quincenaActual = parseInt(params.quincena || "1");

    // Fetch initial data
    const [resNovedades, resEmpleados, resConceptos, isBloqueado] = await Promise.all([
        getNovedades(mesActual, anioActual, quincenaActual),
        getEmployeesSimple(),
        getConceptos(),
        isPeriodoAprobadoAction(mesActual, anioActual, quincenaActual)
    ]);

    const initialNovedades = resNovedades.success ? resNovedades.data : [];
    const empleados = resEmpleados.success ? resEmpleados.data : [];
    const conceptos = resConceptos.success ? resConceptos.data : [];

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
                        <h1 className="text-3xl font-bold tracking-tight text-indigo-900">
                            Registro de Novedades
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Ingresa bonos, comisiones o descuentos que afectarán el pago del periodo actual.
                        </p>
                    </div>
                </div>

                <NovedadesClient
                    initialNovedades={initialNovedades || []}
                    empleados={empleados || []}
                    conceptos={conceptos || []}
                    isBloqueado={isBloqueado}
                    initialMes={mesActual.toString()}
                    initialAnio={anioActual.toString()}
                    initialQuincena={quincenaActual.toString()}
                />
            </div>
        </DashboardLayout>
    );
}
