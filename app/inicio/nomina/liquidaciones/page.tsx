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
    const initialTotalNomina = result.success ? result.data?.totalNomina || 0 : 0;

    return (
        <DashboardLayout userRole={user.role}>
            <LiquidacionesClient
                initialData={initialData || []}
                initialTotal={initialTotal}
                initialTotalNomina={initialTotalNomina}
                initialMes={mesActual.toString()}
                initialAnio={anioActual.toString()}
                initialQuincena={quincenaActual.toString()}
            />
        </DashboardLayout>
    );
}
