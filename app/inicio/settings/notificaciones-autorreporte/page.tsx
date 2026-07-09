import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MailerConfig } from "@/components/settings/mailer-config";
import { ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";

export default async function NotificacionesAutorreportePage() {
    const user = await getAuthUser();
    if (!user) {
        redirect("/login");
    }

    return (
        <DashboardLayout userRole={user.role}>
            <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-3 border-b pb-4">
                    <Link href="/inicio/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Link>
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Settings className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notificaciones de Autorreporte</h1>
                        <p className="text-sm text-gray-500">
                            Configura el envío automático de reportes a través de correo electrónico.
                        </p>
                    </div>
                </div>

                <div className="flex justify-center md:justify-start">
                    <MailerConfig />
                </div>
            </div>
        </DashboardLayout>
    );
}
