import { Suspense } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getFinSheetContentAction, getFinModuleSheetsAction } from "@/actions/fin-modules";
import { FinGridClient } from '@/components/contable/V2/fin-grid';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddColumnDialog } from '@/components/contable/V2/add-column-dialog';
import { ManageColumnsDialog } from '@/components/contable/V2/manage-columns-dialog';
import { CreateModuleDialog } from '@/components/contable/V2/create-module-dialog';
import { CreateSheetDialog } from '@/components/contable/V2/create-sheet-dialog';
import { SheetTab } from '@/components/contable/V2/sheet-tab';
import { pool } from '@/lib/db';
import { Plus } from 'lucide-react';

export default async function FinModulePage(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ sheet?: string }>
}) {
    const { id } = await props.params;
    const { sheet: sheetParam } = await props.searchParams;
    const moduleId = parseInt(id, 10);

    if (isNaN(moduleId)) return notFound();

    // 1. Obtener todas las HOJAS de este Módulo
    const { data: sheets } = await getFinModuleSheetsAction(moduleId);

    if (!sheets || sheets.length === 0) {
        return (
            <DashboardLayout>
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="bg-muted p-6 rounded-full">
                        <Plus className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold italic">Este módulo no tiene hojas (pestañas)</h2>
                        <p className="text-muted-foreground max-w-sm">
                            Parece que este libro de trabajo está vacío. Crea tu primera hoja para empezar a organizar la información.
                        </p>
                    </div>
                    <CreateSheetDialog moduleId={moduleId} />
                    <Button variant="link" asChild>
                        <Link href="/inicio/contable-v2">Volver al listado</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    // 2. Determinar qué HOJA estamos visualizando (por defecto la primera)
    const activeSheetId = sheetParam ? parseInt(sheetParam, 10) : sheets[0].id;
    const activeSheet = sheets.find(s => s.id === activeSheetId) || sheets[0];

    // 3. Traer los datos de la HOJA activa (Columnas + Filas)
    const { data: sheetContent, success, message } = await getFinSheetContentAction(activeSheet.id);

    // 4. Obtener metadata del módulo (Libro) 
    // Podríamos obtenerlo de una action aparte o incluirlo en getFinSheetContent
    const [moduleRows] = await pool.execute<any[]>(`SELECT * FROM FIN_MODULES WHERE id = ?`, [moduleId]);
    const module = moduleRows[0];

    if (!success || !sheetContent) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/inicio/contable-v2">
                            <ChevronLeft className="mr-2 w-4 h-4" /> Volver a módulos
                        </Link>
                    </Button>
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                        Error al cargar la hoja: {message}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { columns, data: rows } = sheetContent;

    return (
        <DashboardLayout>
            <div className="h-full flex flex-col pt-6 pb-2 px-6">
                {/* Cabecera del Módulo (Libro) */}
                <div className="flex justify-between items-end mb-4 shrink-0">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Button variant="outline" size="icon" asChild className="h-8 w-8">
                                <Link href="/inicio/contable-v2">
                                    <ChevronLeft className="w-4 h-4" />
                                </Link>
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight">{module.name}</h1>
                            <span className="text-muted-foreground ml-2">/ {activeSheet.name}</span>
                        </div>
                        {module.description && (
                            <p className="text-sm text-muted-foreground ml-10">{module.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <AddColumnDialog moduleId={moduleId} sheetId={activeSheet.id} />
                        <ManageColumnsDialog columns={columns} moduleId={moduleId} sheetId={activeSheet.id} />
                    </div>
                </div>

                {/* El Componente AG Grid - Representa la Hoja actual */}
                <div className="flex-1 w-full relative -mx-2 rounded-t-xl overflow-hidden border shadow-sm bg-card border-b-0">
                    <FinGridClient
                        moduleId={moduleId}
                        sheetId={activeSheet.id}
                        initialColumns={columns}
                        initialData={rows}
                        moduleName={`${module.name} - ${activeSheet.name}`}
                    />
                </div>

                {/* BARRA DE HOJAS (Tabs) Estilo Excel */}
                <div className="flex items-center w-full -mx-2 bg-muted/20 border rounded-b-xl overflow-x-auto shrink-0 mb-4 h-10 px-2 space-x-1">
                    {sheets.map((s: any) => (
                        <SheetTab
                            key={s.id}
                            sheet={s}
                            moduleId={moduleId}
                            isActive={s.id === activeSheetId}
                        />
                    ))}
                    <div className="pl-2 flex items-center shrink-0">
                        {/* Diálogo para crear una NUEVA HOJA dentro de este libro */}
                        <CreateSheetDialog moduleId={moduleId} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
