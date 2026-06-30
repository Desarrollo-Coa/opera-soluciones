'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSeguimientoDiarioAction, eliminarAutorreporteAction, registrarAutorreporteAction } from '@/actions/autorreporte-actions';
import { getReporteCompletoPDFAction } from '@/actions/reportes-pdf-actions';
import { generarReportePDF } from '@/lib/pdf/generador-reporte';
import { EmpleadoAutorreporte } from '@/types/autorreporte';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Coffee, CheckCircle, Clock, Image as ImageIcon, Users, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function SeguimientoTrabajadorOSPage() {
    const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [empleados, setEmpleados] = useState<EmpleadoAutorreporte[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await getSeguimientoDiarioAction(fecha);
            if (result.success && result.data) {
                setEmpleados(result.data);
            } else {
                toast.error("Error", { description: result.message || "No se pudo cargar la información" });
            }
        } catch (error) {
            toast.error("Error", { description: "Ocurrió un error inesperado" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha]);

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        toast.info("Preparando documento...", { description: "Recopilando fotos y ubicaciones." });
        
        try {
            const res = await getReporteCompletoPDFAction(fecha);
            if (res.success && res.data) {
                await generarReportePDF(fecha, res.data, res.logo);
                toast.success("¡PDF Generado!");
            } else {
                toast.error("Error al obtener datos para el PDF", { description: res.message });
            }
        } catch (e) {
            toast.error("Error al generar PDF");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const filteredEmpleados = empleados.filter(emp => 
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.document_number.includes(searchTerm)
    );

    const pendientes = filteredEmpleados.filter(e => e.estado_reporte === 'PENDIENTE');
    const ausencias = filteredEmpleados.filter(e => e.estado_reporte === 'AUSENCIA');
    const reportados = filteredEmpleados.filter(e => e.estado_reporte === 'REPORTADO');

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-4 border-b border-gray-200/60">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Seguimiento Trabajador OS</h1>
                    <p className="text-muted-foreground text-sm max-w-2xl">
                        Monitor de actividad diaria, registros de entrada, salida y novedades del personal en tiempo real.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200/60 items-center">
                    <div className="flex items-center gap-2 px-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Fecha de consulta:</span>
                        <Input 
                            type="date" 
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            className="w-40 border-0 bg-gray-50 focus-visible:ring-1 h-9"
                        />
                    </div>
                    <Button onClick={fetchData} variant="default" size="sm" disabled={isLoading || isGeneratingPdf} className="shadow-sm">
                        <RefreshCwIcon className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button onClick={handleDownloadPdf} variant="outline" size="sm" disabled={isLoading || isGeneratingPdf} className="shadow-sm border-blue-200 text-blue-700 hover:bg-blue-50">
                        {isGeneratingPdf ? <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                        {isGeneratingPdf ? "Generando PDF..." : "Exportar PDF"}
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">Pendientes</p>
                            <div className="text-2xl font-bold text-amber-900">{pendientes.length}</div>
                        </div>
                        <Clock className="w-8 h-8 text-amber-600/50" />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Autorreportes</p>
                            <div className="text-2xl font-bold text-emerald-900">{reportados.length}</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-emerald-600/50" />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-rose-50 to-rose-100/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">Con Novedad</p>
                            <div className="text-2xl font-bold text-rose-900">{ausencias.length}</div>
                        </div>
                        <MapPin className="w-8 h-8 text-rose-600/50" />
                    </CardContent>
                </Card>
            </div>

            <div className="relative flex items-center max-w-md w-full">
                <Search className="absolute left-3 w-5 h-5 text-gray-400" />
                <Input 
                    placeholder="Buscar empleado por nombre o número de documento..." 
                    className="pl-10 h-11 bg-white shadow-sm border-gray-200 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Navigation Tabs */}
            <Tabs defaultValue="pendientes" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-14 bg-gray-100/80 p-1 rounded-xl">
                    <TabsTrigger value="pendientes" className="rounded-lg text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-amber-700 transition-all">
                        <Clock className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Pendientes</span>
                        <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700 hover:bg-amber-100">{pendientes.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="reportados" className="rounded-lg text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 transition-all">
                        <CheckCircle className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Autorreportes</span>
                        <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{reportados.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="novedad" className="rounded-lg text-sm sm:text-base data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-rose-700 transition-all">
                        <MapPin className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Con Novedad</span>
                        <Badge variant="secondary" className="ml-2 bg-rose-100 text-rose-700 hover:bg-rose-100">{ausencias.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* Pendientes Content */}
                <TabsContent value="pendientes" className="mt-6 outline-none focus:ring-0">
                    {pendientes.length === 0 ? (
                        <EmptyState icon={<CheckCircle className="w-12 h-12 text-emerald-300" />} title="Todo al día" description="No hay empleados pendientes de registro para esta fecha." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pendientes.map(emp => <EmpleadoCard key={emp.id} empleado={emp} onRefresh={fetchData} />)}
                        </div>
                    )}
                </TabsContent>

                {/* Reportados Content */}
                <TabsContent value="reportados" className="mt-6 outline-none focus:ring-0">
                    {reportados.length === 0 ? (
                        <EmptyState icon={<Users className="w-12 h-12 text-gray-300" />} title="Sin registros" description="Nadie se ha reportado aún en la fecha seleccionada." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {reportados.map(emp => <EmpleadoCard key={emp.id} empleado={emp} onRefresh={fetchData} />)}
                        </div>
                    )}
                </TabsContent>

                {/* Novedades Content */}
                <TabsContent value="novedad" className="mt-6 outline-none focus:ring-0">
                    {ausencias.length === 0 ? (
                        <EmptyState icon={<MapPin className="w-12 h-12 text-gray-300" />} title="Sin Novedades" description="No se registran ausencias ni incapacidades para esta fecha." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {ausencias.map(emp => <EmpleadoCard key={emp.id} empleado={emp} onRefresh={fetchData} />)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RefreshCwIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
        </svg>
    )
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
            <div className="mb-4 bg-white p-4 rounded-full shadow-sm">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-500 max-w-sm">{description}</p>
        </div>
    )
}

function EmpleadoCard({ empleado, onRefresh }: { empleado: EmpleadoAutorreporte, onRefresh: () => void }) {
    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Está seguro de eliminar este reporte de forma permanente?")) return;
        try {
            const res = await eliminarAutorreporteAction(id);
            if (res.success) {
                toast.success("Reporte eliminado");
                onRefresh();
            } else {
                toast.error("Error", { description: res.message });
            }
        } catch (error) {
            toast.error("Error", { description: "Hubo un problema al eliminar." });
        }
    };

    const renderFoto = (fotoUrl: string, title: string) => {
        return (
            <DialogContent className="max-w-3xl p-1 bg-black/95 border-none flex items-center justify-center text-white [&>button]:text-white [&>button]:bg-black/50 [&>button]:hover:bg-black [&>button]:p-2 [&>button]:rounded-full [&>button]:ring-0 [&>button]:focus:ring-0">
                <DialogTitle className="sr-only">{title}</DialogTitle>
                <img src={fotoUrl} alt={title} className="max-w-full max-h-[85vh] object-contain rounded-md" />
            </DialogContent>
        );
    };

    const tieneFoto = empleado.reportes?.inicio?.foto || empleado.reportes?.fin?.foto;

    const handleForzarDescanso = async () => {
        try {
            toast.info("Registrando descanso manual...");
            const res = await registrarAutorreporteAction(empleado.id, 'DESCANSO');
            if (res.success) {
                toast.success("Descanso registrado exitosamente");
                onDelete();
            } else {
                toast.error("Error", { description: res.message });
            }
        } catch (e) {
            toast.error("Error al registrar descanso");
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Card className="overflow-hidden border border-gray-200 shadow-sm flex flex-col bg-white h-full">
                    {/* Cabecera Tipo Producto (Imagen Principal) */}
                    {tieneFoto && (
                <div className="flex h-56 w-full bg-gray-100 overflow-hidden relative border-b border-gray-100">
                    {empleado.reportes.inicio?.foto && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className={`relative h-full ${empleado.reportes.fin?.foto ? 'w-1/2 border-r border-white/20' : 'w-full'} cursor-pointer overflow-hidden bg-black`}>
                                    <img src={empleado.reportes.inicio.foto} alt="Inicio de labores" className="w-full h-full object-cover" />
                                </div>
                            </DialogTrigger>
                            {renderFoto(empleado.reportes.inicio.foto, 'Foto Inicio')}
                        </Dialog>
                    )}
                    {empleado.reportes.fin?.foto && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className={`relative h-full ${empleado.reportes.inicio?.foto ? 'w-1/2' : 'w-full'} cursor-pointer overflow-hidden bg-black`}>
                                    <img src={empleado.reportes.fin.foto} alt="Fin de labores" className="w-full h-full object-cover" />
                                </div>
                            </DialogTrigger>
                            {renderFoto(empleado.reportes.fin.foto, 'Foto Fin')}
                        </Dialog>
                    )}
                </div>
            )}

            <div className="p-5 flex-grow flex flex-col">
                <div className="mb-4">
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight mb-1">
                        {empleado.first_name} {empleado.last_name}
                        {!empleado.is_active && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 border border-red-200">
                                Inactivo
                            </span>
                        )}
                    </CardTitle>
                    <div className="flex items-center text-sm text-gray-500 font-medium">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold px-1.5 py-0 border-gray-200 bg-gray-50 text-gray-600 mr-2">
                            {empleado.document_type}
                        </Badge>
                        {empleado.document_number}
                    </div>
                </div>

                {empleado.estado_reporte === 'AUSENCIA' && empleado.ausencia && (
                    <div className="bg-rose-50 text-rose-800 p-3 rounded-lg text-sm border border-rose-100 flex items-start gap-2 mt-auto">
                        {empleado.ausencia.nombre.toLowerCase().includes('incapacidad') ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-5 h-5 mt-0.5 shrink-0 text-red-600">
                                <path d="M19 10h-4V6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z" />
                            </svg>
                        ) : (
                            <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-rose-600" />
                        )}
                        <div>
                            <span className="font-bold block mb-0.5">Novedad Registrada</span>
                            <span className="text-rose-700/90 leading-snug">{empleado.ausencia.nombre}</span>
                        </div>
                    </div>
                )}
                
                {empleado.estado_reporte === 'REPORTADO' && (
                    <div className="space-y-2 mt-4">
                        {empleado.reportes.inicio && (
                            <ContextMenu>
                                <ContextMenuTrigger>
                                    <div className="flex justify-between items-center text-sm px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100/60 cursor-context-menu group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="font-semibold text-emerald-900">Inicio de labores</span> 
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {empleado.reportes.inicio.lat && empleado.reportes.inicio.lng && (
                                                <a href={`https://www.google.com/maps?q=${empleado.reportes.inicio.lat},${empleado.reportes.inicio.lng}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Ver ubicación en el mapa">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            <span className="text-emerald-700 font-medium">{format(new Date(empleado.reportes.inicio.hora), 'HH:mm', { locale: es })}</span>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDelete(empleado.reportes.inicio!.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Registro
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )}
                        
                        {empleado.reportes.descanso && (
                            <ContextMenu>
                                <ContextMenuTrigger>
                                    <div className="flex justify-between items-center text-sm px-3 py-2 bg-orange-50 rounded-lg border border-orange-100/60 cursor-context-menu group">
                                        <div className="flex items-center gap-2">
                                            <Coffee className="w-4 h-4 text-orange-500" />
                                            <span className="font-semibold text-orange-900">Descanso</span> 
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {empleado.reportes.descanso.lat && empleado.reportes.descanso.lng && (
                                                <a href={`https://www.google.com/maps?q=${empleado.reportes.descanso.lat},${empleado.reportes.descanso.lng}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Ver ubicación en el mapa">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            <span className="text-orange-700 font-medium">{format(new Date(empleado.reportes.descanso.hora), 'HH:mm', { locale: es })}</span>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDelete(empleado.reportes.descanso!.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Registro
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )}
                        
                        {empleado.reportes.fin && (
                            <ContextMenu>
                                <ContextMenuTrigger>
                                    <div className="flex justify-between items-center text-sm px-3 py-2 bg-blue-50 rounded-lg border border-blue-100/60 cursor-context-menu group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            <span className="font-semibold text-blue-900">Fin de labores</span> 
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {empleado.reportes.fin.lat && empleado.reportes.fin.lng && (
                                                <a href={`https://www.google.com/maps?q=${empleado.reportes.fin.lat},${empleado.reportes.fin.lng}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors" title="Ver ubicación en el mapa">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                </a>
                                            )}
                                            <span className="text-blue-700 font-medium">{format(new Date(empleado.reportes.fin.hora), 'HH:mm', { locale: es })}</span>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDelete(empleado.reportes.fin!.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar Registro
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )}
                    </div>
                )}
                
                {empleado.estado_reporte === 'PENDIENTE' && (
                    <div className="text-sm text-gray-500 flex items-center justify-center py-4 bg-gray-50 rounded-lg mt-auto border border-dashed border-gray-200">
                        <Clock className="w-4 h-4 mr-2 opacity-50" />
                        Esperando reporte...
                    </div>
                )}
            </div>
        </Card>
    </ContextMenuTrigger>
    <ContextMenuContent>
        {!empleado.reportes.descanso ? (
            <ContextMenuItem onClick={handleForzarDescanso} className="cursor-pointer text-orange-600 focus:text-orange-700 focus:bg-orange-50">
                <Coffee className="w-4 h-4 mr-2" />
                Registrar Descanso Manual
            </ContextMenuItem>
        ) : (
            <ContextMenuItem disabled>
                Ya tiene descanso registrado
            </ContextMenuItem>
        )}
    </ContextMenuContent>
</ContextMenu>
    );
}
