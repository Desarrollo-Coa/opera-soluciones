import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Settings, Mail } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
    const user = await getAuthUser();
    if (!user) {
        redirect("/login");
    }

    return (
        <DashboardLayout userRole={user.role}>
            <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                    <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
                        <Settings className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configuración del Sistema</h1>
                        <p className="text-sm text-gray-500">
                            Panel central de preferencias. Selecciona un módulo para configurarlo.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <Link href="/inicio/settings/notificaciones-autorreporte">
                        <Card className="flex flex-col items-center justify-center p-6 text-center hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group h-full">
                            <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Notificaciones de Autorreporte</h3>
                            <p className="text-xs text-gray-500">Alertas automáticas por correo</p>
                        </Card>
                    </Link>
                    
                    {/* Espacios para futuros módulos */}
                    <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 opacity-50">
                        <div className="p-4 bg-slate-200 text-slate-400 rounded-full mb-4">
                            <Settings className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-slate-500 mb-1">Próximamente</h3>
                        <p className="text-xs text-slate-400">Nuevas configuraciones</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
