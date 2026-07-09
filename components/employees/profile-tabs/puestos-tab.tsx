'use client';

import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';
import { Puesto, HistorialPuesto } from '@/types/puestos';
import { getHistorialPuestosAction, asignarPuestoEmpleadoAction } from '@/actions/puestos-actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { MapPin, History, RefreshCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PuestosTab({ employee, puestos }: { employee: Employee; puestos: Puesto[] }) {
    const [historial, setHistorial] = useState<HistorialPuesto[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [nuevoPuestoId, setNuevoPuestoId] = useState<string>(employee.puesto_id?.toString() || "");
    const [notasCambio, setNotasCambio] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchHistorial = async () => {
        setLoading(true);
        const res = await getHistorialPuestosAction(employee.id);
        if (res.success && res.data) {
            setHistorial(res.data);
        } else {
            toast.error(res.message || "Error al cargar el historial");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchHistorial();
    }, [employee.id]);

    const handleAsignarPuesto = async () => {
        if (!nuevoPuestoId) {
            toast.error("Seleccione un puesto de trabajo");
            return;
        }
        
        const idNum = parseInt(nuevoPuestoId);
        if (idNum === employee.puesto_id) {
            toast.info("El empleado ya está asignado a este puesto");
            return;
        }

        setIsSubmitting(true);
        const res = await asignarPuestoEmpleadoAction(employee.id, idNum, notasCambio);
        if (res.success) {
            toast.success(res.message);
            setNotasCambio('');
            fetchHistorial();
            // Optional: window.location.reload() to refresh everything or mutate parent state
        } else {
            toast.error(res.message || "Error al asignar puesto");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Asignación de Puesto Actual</h3>
                        <p className="text-sm text-slate-500">
                            Puesto actual: <strong className="text-indigo-600">{employee.puesto_name || "Sin Puesto Asignado"}</strong>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Seleccionar Nuevo Puesto</Label>
                        <Select value={nuevoPuestoId} onValueChange={setNuevoPuestoId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un puesto" />
                            </SelectTrigger>
                            <SelectContent>
                                {puestos.map(p => (
                                    <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Notas del cambio (Opcional)</Label>
                        <Input 
                            placeholder="Motivo del cambio, observaciones, etc." 
                            value={notasCambio}
                            onChange={(e) => setNotasCambio(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                    <Button 
                        onClick={handleAsignarPuesto} 
                        disabled={isSubmitting || nuevoPuestoId === employee.puesto_id?.toString()}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        {isSubmitting ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
                        Asignar Puesto
                    </Button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                            <History className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Historial de Cambios</h3>
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Puesto Asignado</TableHead>
                                    <TableHead>Registrado Por</TableHead>
                                    <TableHead>Notas</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historial.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                                            No hay registros en el historial
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    historial.map(h => (
                                        <TableRow key={h.id}>
                                            <TableCell className="font-medium">
                                                {new Date(h.fecha_asignacion).toLocaleDateString()} {new Date(h.fecha_asignacion).toLocaleTimeString()}
                                            </TableCell>
                                            <TableCell className="font-semibold text-indigo-600">
                                                {h.puesto_nombre}
                                            </TableCell>
                                            <TableCell>
                                                {h.creado_por_nombre}
                                            </TableCell>
                                            <TableCell className="text-slate-500 text-sm italic max-w-[200px] truncate">
                                                {h.notas || '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
}
