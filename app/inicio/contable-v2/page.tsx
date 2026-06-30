import { Suspense } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getFinModulesAction } from "@/actions/fin-modules";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, BarChart3, Settings } from "lucide-react";
import Link from 'next/link';
import { CreateModuleDialog } from '@/components/contable/V2/create-module-dialog';
import { EditModuleDialog } from '@/components/contable/V2/edit-module-dialog';
import { DeleteModuleDialog } from '@/components/contable/V2/delete-module-dialog';

// Server Component (RSC) inicial para listar los Módulos
export default async function ContableV2Page() {
    const { data: modules, success, message } = await getFinModulesAction();

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Contable y financiero v2</h1>
                        <p className="text-muted-foreground mt-1">
                            Administración financiera dinámica y analítica avanzada
                        </p>
                    </div>
                    <div>
                        <CreateModuleDialog />
                    </div>
                </div>

                {!success ? (
                    <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                        Error al cargar módulos: {message}
                    </div>
                ) : modules && modules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {modules.map((mod) => (
                            <Card key={mod.id} className="hover:shadow-lg transition-shadow border-muted/60">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <TableIcon className="h-6 w-6 text-primary" />
                                        </div>
                                        {/* Botón de configuración futura del módulo */}
                                        <div className="flex gap-1">
                                            <EditModuleDialog module={mod} />
                                            <DeleteModuleDialog moduleId={mod.id} moduleName={mod.name} />
                                        </div>
                                    </div>
                                    <CardTitle className="mt-4 text-xl">{mod.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 min-h-10">
                                        {mod.description || 'Sin descripción'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-4 border-t">
                                        <span>Creado: {new Date(mod.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-4">
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/inicio/contable-v2/${mod.id}/dashboard`}>
                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                Analítica
                                            </Link>
                                        </Button>
                                        <Button className="w-full" asChild>
                                            <Link href={`/inicio/contable-v2/${mod.id}`}>
                                                <TableIcon className="mr-2 h-4 w-4" />
                                                Abrir Módulo
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 mt-8 border-2 border-dashed rounded-xl bg-muted/20">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <TableIcon className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">No hay módulos creados</h3>
                        <p className="text-muted-foreground text-center max-w-sm mb-6">
                            Empieza creando tu primer módulo contable y financiero (ej: "Listado de Gastos 2026").
                        </p>
                        <CreateModuleDialog />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
