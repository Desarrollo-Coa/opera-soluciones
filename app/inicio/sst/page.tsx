import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Shield, Hammer } from "lucide-react";

export default async function SSTPage() {
    const user = await getAuthUser();
    if (!user) {
        redirect("/login");
    }

    return (
        <DashboardLayout userRole={user.role}>
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 text-center">
                <div className="p-6 bg-orange-100 rounded-full">
                    <Shield className="h-20 w-20 text-orange-600 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Seguridad y Salud en el Trabajo (SST)</h1>
                    <p className="text-xl text-gray-600 max-w-lg">
                        Este módulo se encuentra actualmente en fase de implementación para garantizar el cumplimiento normativo.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-500 font-medium italic">
                    <Hammer className="h-4 w-4" />
                    Módulo en desarrollo - Próximamente disponible
                </div>
            </div>
        </DashboardLayout>
    );
}
