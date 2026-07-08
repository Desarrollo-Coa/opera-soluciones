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
import MapaDistribucion from './components/MapaDistribucion';
import { EmpleadoAutorreporte } from '@/types/autorreporte';
import { CalendarView } from '@/components/autorreporte/CalendarView';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Coffee, CheckCircle, Clock, Image as ImageIcon, Users, Trash2, Download, LayoutGrid, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

export default function SeguimientoTrabajadorOSPage() {
    const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [empleados, setEmpleados] = useState<EmpleadoAutorreporte[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('calendar');
    const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
    const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);

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
        `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.document_number && emp.document_number.includes(searchTerm))
    );

    const pendientes = filteredEmpleados.filter(e => e.estado_reporte === 'PENDIENTE');
    const ausencias = filteredEmpleados.filter(e => e.estado_reporte === 'AUSENCIA');
    const reportados = filteredEmpleados.filter(e => e.estado_reporte === 'REPORTADO');

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-4 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-gray-200/60">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Seguimiento Trabajador OS</h1>
                    <p className="text-muted-foreground text-xs max-w-2xl">
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
                            className="w-36 border-0 bg-gray-50 focus-visible:ring-1 h-8 text-sm"
                        />
                    </div>
                    <Button onClick={fetchData} variant="default" size="sm" disabled={isLoading || isGeneratingPdf} className="shadow-sm h-8">
                        <RefreshCwIcon className={`w-3.5 h-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button onClick={handleDownloadPdf} variant="outline" size="sm" disabled={isLoading || isGeneratingPdf} className="shadow-sm h-8 text-blue-600 border-blue-200 hover:bg-blue-50">
                        <Download className={`w-3.5 h-3.5 mr-2 ${isGeneratingPdf ? 'animate-bounce' : ''}`} />
                        PDF
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-2">
                <div className="relative flex items-center max-w-md w-full">
                    <Search className="absolute left-3 w-5 h-5 text-gray-400" />
                    <Input 
                        placeholder="Buscar empleado..." 
                        className="pl-10 h-10 bg-white shadow-sm border-gray-200 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="bg-gray-100 p-1 rounded-lg flex items-center shadow-inner border border-gray-200">
                    <button 
                        onClick={() => setViewMode('cards')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Tarjetas
                    </button>
                    <button 
                        onClick={() => setViewMode('calendar')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md flex items-center transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Matriz Mensual
                    </button>
                </div>
            </div>

            {viewMode === 'calendar' ? (
                <div className="mt-6 flex flex-col gap-6 animate-in fade-in duration-300">
                    <CalendarView 
                        year={calendarYear} 
                        month={calendarMonth} 
                        setYear={setCalendarYear} 
                        setMonth={setCalendarMonth} 
                        renderEmpleadoCard={(emp, refresh, isModal) => <EmpleadoCard empleado={emp} onRefresh={refresh} isModal={isModal} />}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6 animate-in fade-in zoom-in-95 duration-300">
                    {/* Columna Izquierda: Navegación y Tarjetas */}
                <div className="xl:col-span-2">
                    <Tabs defaultValue="pendientes" className="w-full">
                        <TabsList className="flex w-full md:w-fit bg-transparent h-auto p-0 border-b border-gray-200">
                            <TabsTrigger 
                                value="pendientes" 
                                className="px-6 py-3 rounded-t-xl rounded-b-none border border-transparent data-[state=active]:border-gray-200 data-[state=active]:border-b-white data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-amber-700 transition-all z-10 -mb-[1px] bg-gray-50 mr-1 text-gray-500 hover:bg-gray-100"
                            >
                                <Clock className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Pendientes</span>
                                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-700">{pendientes.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="reportados" 
                                className="px-6 py-3 rounded-t-xl rounded-b-none border border-transparent data-[state=active]:border-gray-200 data-[state=active]:border-b-white data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-emerald-700 transition-all z-10 -mb-[1px] bg-gray-50 mr-1 text-gray-500 hover:bg-gray-100"
                            >
                                <CheckCircle className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Autorreportes</span>
                                <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-700">{reportados.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="novedad" 
                                className="px-6 py-3 rounded-t-xl rounded-b-none border border-transparent data-[state=active]:border-gray-200 data-[state=active]:border-b-white data-[state=active]:bg-white data-[state=active]:shadow-none data-[state=active]:text-rose-700 transition-all z-10 -mb-[1px] bg-gray-50 text-gray-500 hover:bg-gray-100"
                            >
                                <MapPin className="w-4 h-4 sm:mr-2" />
                                <span className="hidden sm:inline">Con Novedad</span>
                                <Badge variant="secondary" className="ml-2 bg-rose-100 text-rose-700">{ausencias.length}</Badge>
                            </TabsTrigger>
                        </TabsList>

                        <div className="h-[800px] overflow-y-auto pr-2 pb-12 custom-scrollbar border-t-0 border border-gray-200 bg-white p-6 rounded-b-xl rounded-tr-xl shadow-sm">
                        <TabsContent value="pendientes" className="mt-0 outline-none focus:ring-0">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            ) : pendientes.length === 0 ? (
                                <EmptyState icon={<CheckCircle className="w-12 h-12 text-emerald-300" />} title="Todo al día" description="No hay empleados pendientes de registro para esta fecha." />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                    {pendientes.map(emp => <EmpleadoCard key={emp.id} empleado={emp} onRefresh={fetchData} />)}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="reportados" className="mt-0 outline-none focus:ring-0">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            ) : reportados.length === 0 ? (
                                <EmptyState icon={<Users className="w-12 h-12 text-gray-300" />} title="Sin registros" description="Nadie se ha reportado aún en la fecha seleccionada." />
                            ) : (
                                <div className="space-y-6">
                                    {/* Trabajando Activos */}
                                    {reportados.filter(emp => !emp.reportes.descanso).length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Trabajando ({reportados.filter(emp => !emp.reportes.descanso).length})</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
                                                {reportados.filter(emp => !emp.reportes.descanso).map(emp => <EmpleadoCard key={emp.id} empleado={emp} onRefresh={fetchData} />)}
                                            </div>
                                        </div>
                                    )}

                                    {/* En Descanso */}
                                    {reportados.filter(emp => emp.reportes.descanso).length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center"><Coffee className="w-3.5 h-3.5 text-orange-500 mr-2" /> En Descanso ({reportados.filter(emp => emp.reportes.descanso).length})</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
                                                {reportados.filter(emp => emp.reportes.descanso).map(emp => <EmpleadoCard key={emp.id} empleado={emp} onRefresh={fetchData} />)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="novedad" className="mt-0 outline-none focus:ring-0">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            ) : ausencias.length === 0 ? (
                                <EmptyState icon={<MapPin className="w-12 h-12 text-gray-300" />} title="Sin Novedades" description="No se registran ausencias ni incapacidades para esta fecha." />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                                    {ausencias.map(emp => <EmpleadoCard key={emp.id} empleado={emp} onRefresh={fetchData} />)}
                                </div>
                            )}
                        </TabsContent>
                        </div>
                    </Tabs>
                </div>

                {/* Columna Derecha: Mapa (Ocupa 1/3 del espacio, se vuelve pegajoso) */}
                <div className="xl:col-span-1">
                    <div className="sticky top-6">
                        <MapaDistribucion empleados={filteredEmpleados} />
                    </div>
                </div>
            </div>
            )}
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

function EmpleadoCard({ empleado, onRefresh, isModal = false }: { empleado: EmpleadoAutorreporte, onRefresh: () => void, isModal?: boolean }) {
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
                <div className={`flex ${isModal ? 'h-[300px]' : 'h-14'} w-full bg-gray-100 overflow-hidden relative border-b border-gray-100`}>
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

            <div className="p-3 flex-grow flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                    <div>
                        <CardTitle className="text-[15px] font-bold text-gray-900 leading-tight mb-0.5">
                            {empleado.first_name} {empleado.last_name}
                            {!empleado.is_active && (
                                <span className="ml-1.5 inline-flex items-center rounded-sm bg-red-100 px-1 py-0 text-[10px] font-medium text-red-800 border border-red-200">
                                    Inactivo
                                </span>
                            )}
                        </CardTitle>
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                            <span className="text-[9px] uppercase font-bold text-gray-400 mr-1.5">{empleado.document_type}</span>
                            {empleado.document_number}
                        </div>
                    </div>
                </div>

                {empleado.estado_reporte === 'AUSENCIA' && empleado.ausencia && (
                    <div className="bg-rose-50 text-rose-800 p-2 rounded text-xs border border-rose-100 flex items-start gap-1.5 mt-auto">
                        {empleado.ausencia.nombre.toLowerCase().includes('incapacidad') ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="w-4 h-4 shrink-0 text-red-600">
                                <path d="M19 10h-4V6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z" />
                            </svg>
                        ) : (
                            <MapPin className="w-4 h-4 shrink-0 text-rose-600" />
                        )}
                        <div>
                            <span className="font-bold block mb-0.5">Novedad</span>
                            <span className="text-rose-700/90 leading-tight">{empleado.ausencia.nombre}</span>
                        </div>
                    </div>
                )}
                
                {empleado.estado_reporte === 'REPORTADO' && (
                    <div className="space-y-1 mt-auto">
                        {empleado.reportes.inicio && (
                            <ContextMenu>
                                <ContextMenuTrigger>
                                    <div className="flex justify-between items-center text-[11px] px-2 py-1.5 bg-emerald-50 rounded border border-emerald-100/60 cursor-context-menu">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                            <span className="font-semibold text-emerald-900">Inicio</span> 
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {empleado.reportes.inicio.lat && empleado.reportes.inicio.lng && (
                                                <a href={`https://www.google.com/maps?q=${empleado.reportes.inicio.lat},${empleado.reportes.inicio.lng}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <MapPin className="w-3 h-3" />
                                                </a>
                                            )}
                                            <span className="text-emerald-700 font-bold">{empleado.reportes.inicio.hora.substring(11, 16)}</span>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDelete(empleado.reportes.inicio!.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer text-xs">
                                        <Trash2 className="w-3 h-3 mr-1.5" /> Eliminar
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )}
                        
                        {empleado.reportes.descanso && (
                            <ContextMenu>
                                <ContextMenuTrigger>
                                    <div className="flex justify-between items-center text-[11px] px-2 py-1.5 bg-orange-50 rounded border border-orange-100/60 cursor-context-menu">
                                        <div className="flex items-center gap-1.5">
                                            <Coffee className="w-3 h-3 text-orange-500" />
                                            <span className="font-semibold text-orange-900">Descanso</span> 
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {empleado.reportes.descanso.lat && empleado.reportes.descanso.lng && (
                                                <a href={`https://www.google.com/maps?q=${empleado.reportes.descanso.lat},${empleado.reportes.descanso.lng}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <MapPin className="w-3 h-3" />
                                                </a>
                                            )}
                                            <span className="text-orange-700 font-bold">{empleado.reportes.descanso.hora.substring(11, 16)}</span>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDelete(empleado.reportes.descanso!.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer text-xs">
                                        <Trash2 className="w-3 h-3 mr-1.5" /> Eliminar
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )}
                        
                        {empleado.reportes.fin && (
                            <ContextMenu>
                                <ContextMenuTrigger>
                                    <div className="flex justify-between items-center text-[11px] px-2 py-1.5 bg-blue-50 rounded border border-blue-100/60 cursor-context-menu">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                            <span className="font-semibold text-blue-900">Fin</span> 
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {empleado.reportes.fin.lat && empleado.reportes.fin.lng && (
                                                <a href={`https://www.google.com/maps?q=${empleado.reportes.fin.lat},${empleado.reportes.fin.lng}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <MapPin className="w-3 h-3" />
                                                </a>
                                            )}
                                            <span className="text-blue-700 font-bold">{empleado.reportes.fin.hora.substring(11, 16)}</span>
                                        </div>
                                    </div>
                                </ContextMenuTrigger>
                                <ContextMenuContent>
                                    <ContextMenuItem onClick={() => handleDelete(empleado.reportes.fin!.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer text-xs">
                                        <Trash2 className="w-3 h-3 mr-1.5" /> Eliminar
                                    </ContextMenuItem>
                                </ContextMenuContent>
                            </ContextMenu>
                        )}
                    </div>
                )}
                
                {empleado.estado_reporte === 'PENDIENTE' && (
                    <div className="text-xs text-gray-500 flex items-center justify-center py-2 bg-gray-50 rounded mt-auto border border-dashed border-gray-200">
                        <Clock className="w-3 h-3 mr-1.5 opacity-50" />
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

function SkeletonCard() {
    return (
        <div className="bg-white rounded border border-slate-100 p-3 w-full flex flex-col gap-2 animate-pulse h-[140px]">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 w-full">
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-1.5 mt-auto">
                <div className="h-6 bg-slate-100 rounded w-full"></div>
            </div>
        </div>
    )
}
