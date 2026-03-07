import { Suspense } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ClausulasMasterClient } from "@/components/nomina/clausulas-master-client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ClausulasPage() {
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
                            Definiciones de Cláusulas
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Defina los tipos de compensaciones y beneficios extralegales (ej: Rodamiento).
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <Suspense fallback={<div className="h-96 w-full animate-pulse bg-slate-100 rounded-lg">Cargando definiciones...</div>}>
                        <ClausulasMasterClient />
                    </Suspense>
                </div>
            </div>
        </DashboardLayout>
    );
}
