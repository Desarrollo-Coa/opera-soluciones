import { Suspense } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getUltimosParametrosAction, getAllParametrosAction } from "@/actions/nomina/parametros-actions";
import { ParametrosForm } from "@/components/nomina/parametros-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// RSC -> Server Component
export default async function ParametrosPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) redirect("/login");

    let userRole = "default";
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userRole = payload.role ?? "default";
    } catch (e) {
        redirect("/login");
    }

    // Obtenemos del servidor la data inicial
    const res = await getUltimosParametrosAction();
    const initialData = res.success && res.data ? res.data : undefined;

    const allRes = await getAllParametrosAction();
    const allParametros = allRes.success && allRes.data ? allRes.data : [];

    return (
        <DashboardLayout userRole={userRole}>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="mb-1">
                        <Link href="/inicio/nomina">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Parámetros de Nómina
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Configuración de valores base de Ley (Vigencia {initialData?.ano_vigencia ?? new Date().getFullYear()})
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-100 rounded-lg">Cargando formulario...</div>}>
                        <ParametrosForm initialData={initialData} allParametros={allParametros} />
                    </Suspense>
                </div>
            </div>
        </DashboardLayout>
    );
}
