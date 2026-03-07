import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getMisVolantesAction } from "@/actions/nomina";
import { MisVolantesClient } from "./mis-volantes-client";

export default async function MisVolantesPage() {
    const user = await getAuthUser();
    if (!user) {
        redirect("/login");
    }

    // Obtener volantes del usuario
    const response = await getMisVolantesAction();
    const volantes = response.success ? response.data : [];

    return (
        <DashboardLayout userRole={user.role}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Volantes de Pago</h1>
                    <p className="text-gray-600 mt-2">Consulta y descarga tus comprobantes de nómina históricos.</p>
                </div>

                <MisVolantesClient initialVolantes={volantes || []} />
            </div>
        </DashboardLayout>
    );
}
