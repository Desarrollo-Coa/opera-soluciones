import { redirect, notFound } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { VolantePago } from "@/components/nomina/volante-pago";
import { getLiquidacionById } from "@/actions/nomina";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function DetalleLiquidacionPage({ params }: { params: Promise<{ id: string }> }) {
    const user = await getAuthUser();
    if (!user) redirect("/login");

    const { id } = await params;
    const res = await getLiquidacionById(parseInt(id));

    if (!res.success) {
        notFound();
    }

    return (
        <DashboardLayout userRole={user.role}>
            <div className="space-y-6">
                <div className="flex items-center gap-4 print:hidden">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/inicio/nomina/liquidaciones">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Volante de Pago</h1>
                        <p className="text-sm text-muted-foreground">Vista previa del comprobante mensual</p>
                    </div>
                </div>

                <VolantePago data={res.data} />
            </div>
        </DashboardLayout>
    );
}
