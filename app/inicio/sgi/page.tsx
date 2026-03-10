import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { FileExplorer } from "@/components/file-system/file-explorer";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

/**
 * Página del Sistema de Gestión Integrado (SGI) - Sistema de Archivos
 * Optimizada para navegación rápida mediante searchParams.
 */
export default async function SGIPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const currentFolderId = typeof searchParams.folderId === 'string' ? parseInt(searchParams.folderId) : null;

    // Obtener token de autenticación de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    // Redirigir al login si no se encuentra token
    if (!token) {
        redirect("/login");
    }

    // Obtener rol de usuario del token
    let userRole: string;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userRole = payload.role ?? "default";
    } catch (error) {
        console.error("Error decoding token:", error);
        redirect("/login");
    }

    return (
        <DashboardLayout userRole={userRole}>
            <div className="h-full flex flex-col space-y-4">
                <div className="flex-1 overflow-hidden">
                    <Suspense fallback={
                        <Card className="h-full animate-pulse bg-slate-50/50 dark:bg-slate-900/50">
                            <CardContent className="h-full flex items-center justify-center">
                                <div className="text-muted-foreground animate-bounce">Preparando archivos...</div>
                            </CardContent>
                        </Card>
                    }>
                        <FileExplorer initialFolderId={currentFolderId} />
                    </Suspense>
                </div>
            </div>
        </DashboardLayout>
    );
}
