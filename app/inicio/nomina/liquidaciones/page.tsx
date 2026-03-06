import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LiquidacionesClient } from "@/components/nomina/liquidaciones-client";
import { getLiquidaciones } from "@/actions/nomina";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function LiquidacionesPage({ searchParams }: { searchParams: Promise<{ mes?: string, anio?: string, quincena?: string }> }) {
    const user = await getAuthUser();
    if (!user) redirect("/login");

    const now = new Date();
    const params = await searchParams;
    const mesActual = parseInt(params.mes || (now.getMonth() + 1).toString());
    const anioActual = parseInt(params.anio || now.getFullYear().toString());
    const quincenaActual = parseInt(params.quincena || "1");

    const result = await getLiquidaciones(mesActual, anioActual, quincenaActual);
    const initialData = result.success ? result.data?.rows : [];
    const initialTotal = result.success ? result.data?.totalEmployees || 0 : 0;

    return (
        <DashboardLayout userRole={user.role}>
            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                                <Link href="/inicio/nomina"><ArrowLeft className="h-4 w-4" /></Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight text-indigo-900 leading-tight">
                                Pre-Liquidación y Volantes
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground ml-9">
                            Gestión y generación de pagos por periodo.
                        </p>
                    </div>
                </div>

                <LiquidacionesClient
                    initialData={initialData || []}
                    initialTotal={initialTotal}
                    initialMes={mesActual.toString()}
                    initialAnio={anioActual.toString()}
                    initialQuincena={quincenaActual.toString()}
                />
            </div>
        </DashboardLayout>
    );
}
