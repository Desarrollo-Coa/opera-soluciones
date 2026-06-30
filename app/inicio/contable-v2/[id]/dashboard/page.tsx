import { pool } from "@/lib/db";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getFinModuleSheetsAction, getFinSheetContentAction } from "@/actions/fin-modules";
import { notFound } from "next/navigation";
import { ChevronLeft, BarChart3, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnalyticsEngine } from "@/components/contable/V2/analytics/analytics-engine";

export default async function AnalyticsPage(props: {
    params: Promise<{ id: string }>
}) {
    const { id } = await props.params;
    const moduleId = parseInt(id, 10);

    if (isNaN(moduleId)) return notFound();

    // 1. Obtener metadata del módulo (Libro) 
    const [moduleRows] = await pool.execute<any[]>(`SELECT * FROM FIN_MODULES WHERE id = ?`, [moduleId]);
    const module = moduleRows[0];
    if (!module) return notFound();

    // 2. Obtener todas las HOJAS de este Módulo
    const { data: sheets } = await getFinModuleSheetsAction(moduleId);

    if (!sheets || sheets.length === 0) {
        return (
            <DashboardLayout>
                <div className="p-12 text-center">
                    <h2 className="text-xl font-semibold italic">Este módulo no tiene datos para analizar</h2>
                    <Button variant="link" asChild className="mt-4">
                        <Link href={`/inicio/contable-v2/${moduleId}`}>Ir al módulo para crear datos</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // 3. Traer los datos iniciales de la primera HOJA para empezar el editor
    const { data: initialSheetContent } = await getFinSheetContentAction(sheets[0].id);

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col pt-6 pb-2 px-6">
                {/* Cabecera */}
                <div className="flex justify-between items-end mb-6 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                <Link href={`/inicio/contable-v2/${moduleId}`}>
                                    <ChevronLeft className="w-4 h-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                Business Intelligence: {module.name}
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground ml-10 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> Analítica avanzada tipo Power BI
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`/inicio/contable-v2/${moduleId}`}>
                                Volver a la Grilla
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Engine de Analítica (Client Side) */}
                <div className="flex-1 overflow-hidden min-h-[600px] border rounded-xl bg-muted/5 p-4">
                    <AnalyticsEngine
                        moduleId={moduleId}
                        allSheets={sheets}
                        initialSheetContent={initialSheetContent}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
