'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from "@/components/ui/shadcn-lite";
import { getResumenNomina, getCostosPorCargo, getHistoricoNomina } from "@/actions/nomina";
import { Users, DollarSign, PieChart, TrendingUp, AlertCircle, Info, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversalSelect } from "@/components/ui/universal-select";
import { Label } from "@/components/ui/label";

interface DashboardProps {
    initialResumen: any;
    initialCostos: any[];
    initialHistorico: any[];
    initialMes?: string;
    initialAnio?: string;
}

export function DashboardNominaClient({
    initialResumen,
    initialCostos,
    initialHistorico,
    initialMes = (new Date().getMonth() + 1).toString(),
    initialAnio = new Date().getFullYear().toString()
}: DashboardProps) {
    const [mes, setMes] = useState(initialMes);
    const [anio, setAnio] = useState(initialAnio);
    const [loading, setLoading] = useState(false);

    const [resumen, setResumen] = useState(initialResumen);
    const [costos, setCostos] = useState(initialCostos);
    const [historico, setHistorico] = useState(initialHistorico);

    const fetchData = async (m: string, a: string) => {
        setLoading(true);
        try {
            const [r, c, h] = await Promise.all([
                getResumenNomina(parseInt(m), parseInt(a)),
                getCostosPorCargo(parseInt(m), parseInt(a)),
                getHistoricoNomina()
            ]);

            if (r.success) setResumen(r.data);
            if (c.success) setCostos(c.data || []);
            if (h.success) setHistorico(h.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(mes, anio);
    }, [mes, anio]);

    const formatSMLV = (val: any) => `$${Number(val || 0).toLocaleString()}`;

    return (
        <div className="space-y-6">
            {/* Filtros de Resumen */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Periodo de Análisis</p>
                        <p className="text-sm font-bold text-slate-700">{["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"][parseInt(mes) - 1]} {anio}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="w-32">
                        <UniversalSelect
                            value={mes}
                            onValueChange={setMes}
                            options={["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => ({
                                name: m,
                                code: (i + 1).toString()
                            }))}
                        />
                    </div>
                    <div className="w-24">
                        <UniversalSelect
                            value={anio}
                            onValueChange={setAnio}
                            options={[{ name: "2025", code: "2025" }, { name: "2026", code: "2026" }]}
                        />
                    </div>
                </div>
            </div>

            {/* Metricas Principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                        <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trabajadores</CardTitle>
                        <Users className="h-3.5 w-3.5 text-indigo-500" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-xl font-bold text-slate-900">{loading ? <Skeleton className="h-6 w-12" /> : resumen?.total_empleados || 0}</div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                        <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Devengado</CardTitle>
                        <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-xl font-bold text-slate-900">
                            {loading ? <Skeleton className="h-6 w-20" /> : formatSMLV(resumen?.total_devengados)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
                        <CardTitle className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deducciones</CardTitle>
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-xl font-bold text-slate-900">
                            {loading ? <Skeleton className="h-6 w-20" /> : formatSMLV(resumen?.total_deducciones)}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-indigo-600 border-indigo-700 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4 text-white">
                        <CardTitle className="text-[10px] font-bold uppercase tracking-wider opacity-80">Costo Total</CardTitle>
                        <TrendingUp className="h-3.5 w-3.5 opacity-80" />
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <div className="text-xl font-black text-white">
                            {loading ? <Skeleton className="h-6 w-20 bg-white/20" /> : formatSMLV(resumen?.costo_total)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Costos por Cargo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-indigo-500" />
                            Distribución por Cargos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                            ) : costos.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">No hay datos para mostrar.</p>
                            ) : (
                                costos.map((c, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                        <div>
                                            <p className="font-semibold text-slate-800">{c.cargo}</p>
                                            <p className="text-xs text-muted-foreground">{c.cantidad_empleados} trabajadores</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-700">{formatSMLV(c.costo_empresa)}</p>
                                            <Badge variant="outline" className="text-[10px]">
                                                Avg: {formatSMLV(c.costo_empresa / c.cantidad_empleados)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Histórico 6 meses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Histórico de Egresos (Últ. 6 meses)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {historico.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">Se requiere más datos históricos.</p>
                            ) : (
                                <div className="space-y-2">
                                    {historico.map((h, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-20 text-xs font-bold text-slate-500">
                                                {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"][h.periodo_mes - 1]} / {h.periodo_anio}
                                            </div>
                                            <div className="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden relative">
                                                <div
                                                    className="h-full bg-emerald-500 animate-in slide-in-from-left duration-1000"
                                                    style={{ width: `${Math.min(100, (h.total_costo / historico.reduce((max, curr) => Math.max(max, curr.total_costo), 0)) * 100)}%` }}
                                                />
                                                <span className="absolute inset-0 flex items-center px-3 text-[10px] font-bold text-slate-900 drop-shadow-sm">
                                                    {formatSMLV(h.total_costo)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="p-4 bg-indigo-50 rounded-lg flex gap-3 text-indigo-700 text-xs mt-6 border border-indigo-100">
                                <Info className="h-4 w-4 shrink-0" />
                                <p>Este gráfico muestra el egreso de caja total por mes considerando sueldos y aportes prestacionales.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
