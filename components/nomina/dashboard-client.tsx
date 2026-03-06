'use client'

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from "@/components/ui/shadcn-lite";
import { getResumenNomina, getCostosPorCargo, getHistoricoNomina } from "@/actions/nomina";
import { Users, DollarSign, PieChart, TrendingUp, AlertCircle, Info } from "lucide-react";
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
            <Card>
                <CardContent className="flex items-end gap-4 pt-6">
                    <div className="grid grid-cols-2 gap-4 flex-1 max-w-sm">
                        <div className="space-y-2">
                            <Label>Mes Resumen</Label>
                            <UniversalSelect
                                value={mes}
                                onValueChange={setMes}
                                options={["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => ({
                                    name: m,
                                    code: (i + 1).toString()
                                }))}
                                placeholder="Mes"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Año</Label>
                            <UniversalSelect
                                value={anio}
                                onValueChange={setAnio}
                                options={[
                                    { name: "2025", code: "2025" },
                                    { name: "2026", code: "2026" }
                                ]}
                                placeholder="Año"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Metricas Principales */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-indigo-700">Trabajadores Activos</CardTitle>
                        <Users className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? <Skeleton className="h-8 w-16" /> : resumen?.total_empleados || 0}</div>
                        <p className="text-xs text-muted-foreground">Liquidados este periodo</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white border-green-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Total Devengado</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 text-ellipsis overflow-hidden">
                            {loading ? <Skeleton className="h-8 w-24" /> : formatSMLV(resumen?.total_devengados)}
                        </div>
                        <p className="text-xs text-muted-foreground">Sueldos + Auxilios + Otros</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Deducciones Totales</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {loading ? <Skeleton className="h-8 w-24" /> : formatSMLV(resumen?.total_deducciones)}
                        </div>
                        <p className="text-xs text-muted-foreground">Aportes salud/pension/novedades</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-600/10 border-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-800 uppercase tracking-tighter">Costo Total Empresa</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-700" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-blue-900">
                            {loading ? <Skeleton className="h-8 w-24" /> : formatSMLV(resumen?.costo_total)}
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Impacto financiero total</p>
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
