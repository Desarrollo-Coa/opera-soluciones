import { Suspense } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getCargosAction } from "@/actions/nomina/cargos-actions";
import { CargosClient } from "@/components/nomina/cargos-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default async function CargosPage() {
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

    // Obtenemos del servidor la lista de cargos (RSC fetching pattern)
    const res = await getCargosAction();
    const cargos = res.success && res.data ? res.data : [];

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
                            Estructura Salarial Oficial
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Catálogo de Cargos, Riesgos ARL y Salarios Base
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <Card className="border-slate-200">
                        <CardContent className="pt-6">
                            <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse text-slate-500">Cargando catálogo de cargos...</div>}>
                                <CargosClient cargos={cargos} />
                            </Suspense>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
