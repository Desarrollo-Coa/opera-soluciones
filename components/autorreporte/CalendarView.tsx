'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSeguimientoMensualAction, getSeguimientoDiarioAction } from '@/actions/autorreporte-actions';
import { EmpleadoSeguimientoMensual, EmpleadoAutorreporte } from '@/types/autorreporte';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { format, getDaysInMonth, startOfMonth, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarViewProps {
    year: number;
    month: number;
    setYear: (y: number) => void;
    setMonth: (m: number) => void;
    renderEmpleadoCard: (empleado: EmpleadoAutorreporte, onRefresh: () => void, isModal?: boolean) => React.ReactNode;
}

export function CalendarView({ year, month, setYear, setMonth, renderEmpleadoCard }: CalendarViewProps) {
    const [data, setData] = useState<EmpleadoSeguimientoMensual[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEmployeeDay, setSelectedEmployeeDay] = useState<{ id: number; date: string } | null>(null);
    const [employeeDailyData, setEmployeeDailyData] = useState<EmpleadoAutorreporte | null>(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const fetchMonthlyData = async () => {
        setIsLoading(true);
        try {
            const result = await getSeguimientoMensualAction(year, month);
            if (result.success && result.data) {
                setData(result.data);
            } else {
                toast.error("Error", { description: result.message || "Error al cargar matriz" });
            }
        } catch (e) {
            toast.error("Error al cargar la vista mensual");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlyData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, month]);

    const daysInMonth = getDaysInMonth(new Date(year, month - 1));
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];
    const months = [
        { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
        { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
        { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
        { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' }
    ];

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case 'COMPLETO': return 'bg-green-500 ring-4 ring-green-500/20';
            case 'INICIO_SOLO': return 'bg-blue-500 ring-4 ring-blue-500/20';
            case 'DESCANSO': return 'bg-orange-500 ring-4 ring-orange-500/20';
            case 'AUSENCIA': return 'bg-red-500 ring-4 ring-red-500/20';
            default: return 'border-2 border-gray-200 bg-transparent';
        }
    };

    const handleCellClick = async (empleadoId: number, day: number, estado: string) => {
        if (estado === 'VACIO') return;

        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedEmployeeDay({ id: empleadoId, date: dateStr });
        setIsModalLoading(true);
        setEmployeeDailyData(null);

        try {
            const result = await getSeguimientoDiarioAction(dateStr);
            if (result.success && result.data) {
                const emp = result.data.find((e: EmpleadoAutorreporte) => e.id === empleadoId);
                if (emp) {
                    setEmployeeDailyData(emp);
                } else {
                    toast.error("No se encontró información detallada");
                    setSelectedEmployeeDay(null);
                }
            }
        } catch (e) {
            toast.error("Error al obtener detalle del día");
            setSelectedEmployeeDay(null);
        } finally {
            setIsModalLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-4 animate-in fade-in duration-500">
            {/* Controles del Mes */}
            <div className="flex items-center gap-3">
                <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
                    <SelectTrigger className="w-[120px] bg-white">
                        <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                    </SelectContent>
                </Select>

                <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
                    <SelectTrigger className="w-[180px] bg-white">
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                    </SelectContent>
                </Select>

                {isLoading && <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />}
            </div>

            {/* Matriz Calendario */}
            <Card className="bg-white border-gray-200">
                <div className="max-h-[600px] overflow-auto custom-scrollbar">
                    <div className="min-w-[1200px]">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-bold sticky top-0 z-20 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 min-w-[250px] sticky left-0 bg-gray-50 z-10 border-r border-gray-200 shadow-[1px_0_0_0_#e5e7eb]">
                                    Trabajador
                                </th>
                                {daysArray.map(day => {
                                    const date = new Date(year, month - 1, day);
                                    return (
                                        <th key={day} className="px-1 py-3 text-center min-w-[40px]">
                                            <div className="flex flex-col items-center">
                                                <span className="text-gray-900 text-xs">{day}</span>
                                                <span className="text-[9px] text-gray-400">{format(date, 'E', { locale: es }).substring(0, 3)}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                                <th className="px-4 py-3 min-w-[80px] sticky right-0 bg-gray-50 z-10 border-l border-gray-200 shadow-[-1px_0_0_0_#e5e7eb] text-center">
                                    Total Días
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={daysInMonth + 1} className="text-center py-8 text-gray-500">
                                        No hay trabajadores registrados en este periodo.
                                    </td>
                                </tr>
                            )}
                            {data.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-2 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-100 shadow-[1px_0_0_0_#f3f4f6]">
                                        <div className="font-semibold text-gray-900 text-xs truncate max-w-[230px]" title={`${emp.first_name} ${emp.last_name}`}>
                                            {emp.first_name} {emp.last_name}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                            {emp.document_number}
                                        </div>
                                    </td>
                                    {daysArray.map(day => {
                                        const diaData = emp.dias[day];
                                        const isClickable = diaData?.estado !== 'VACIO';
                                        
                                        return (
                                            <td key={day} className="px-1 py-2 text-center relative group">
                                                <button 
                                                    disabled={!isClickable}
                                                    onClick={() => handleCellClick(emp.id, day, diaData?.estado)}
                                                    className={`w-3.5 h-3.5 rounded-full mx-auto block transition-all ${getStatusColor(diaData?.estado)} ${isClickable ? 'cursor-pointer hover:scale-125 hover:brightness-110' : 'cursor-default opacity-30'}`}
                                                    title={diaData?.ausenciaInfo || diaData?.estado}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="px-4 py-2 sticky right-0 bg-white group-hover:bg-gray-50 z-10 border-l border-gray-100 shadow-[-1px_0_0_0_#f3f4f6] text-center font-bold text-blue-600">
                                        {Object.values(emp.dias).filter(d => ['COMPLETO', 'INICIO_SOLO', 'DESCANSO'].includes(d.estado)).length}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </div>
            </Card>

            {/* Leyenda */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200 w-fit shadow-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/20"></div> Jornada Completa</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/20"></div> Inicio de Labores</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-500/20"></div> Descanso</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/20"></div> Novedad / Ausencia</div>
            </div>

            {/* Dialog para la tarjeta individual */}
            <Dialog open={!!selectedEmployeeDay} onOpenChange={(open) => !open && setSelectedEmployeeDay(null)}>
                <DialogContent className="sm:max-w-[400px] bg-transparent border-none shadow-none p-0 flex justify-center">
                    <DialogTitle className="sr-only">Detalle del Día</DialogTitle>
                    {isModalLoading ? (
                        <div className="bg-white p-8 rounded-xl shadow-xl flex flex-col items-center justify-center space-y-4 w-full">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-sm text-gray-500 font-medium">Cargando detalle del día...</p>
                        </div>
                    ) : employeeDailyData ? (
                        <div className="w-full">
                            {renderEmpleadoCard(employeeDailyData, () => {
                                fetchMonthlyData();
                                handleCellClick(employeeDailyData.id, parseInt(selectedEmployeeDay!.date.split('-')[2]), 'COMPLETO');
                            }, true)}
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
