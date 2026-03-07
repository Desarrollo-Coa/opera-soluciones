import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Users, Hammer } from "lucide-react";

export default async function UsuariosPage() {
    const user = await getAuthUser();
    if (!user) {
        redirect("/login");
    }

    // Solo ADMIN puede ver usuarios? No, HR gestiona empleados, but Admin might want to manage ALL users (even other admins).
    // I'll keep it simple for now as a placeholder.

    return (
        <DashboardLayout userRole={user.role}>
            <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 text-center">
                <div className="p-6 bg-blue-100 rounded-full text-blue-600">
                    <Users className="h-20 w-20 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-xl text-gray-600 max-w-lg">
                        Estamos implementando un control de acceso granular por roles para mejorar la seguridad del sistema.
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
