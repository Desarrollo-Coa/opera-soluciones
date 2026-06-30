"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ShadcnLiteBarChart, ShadcnLiteDonutChart } from "@/components/ui/shadcn-lite-charts";
import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Badge,
    Input
} from "@/components/ui/shadcn-lite";
import {
    Plus,
    TrendingUp,
    LayoutGrid,
    Settings,
    BarChart3,
    PieChart,
    Trash2,
    ChevronDown,
    Filter,
    Table
} from "lucide-react";
import { getFinSheetContentAction } from "@/actions/fin-modules";
import { cn } from "@/lib/utils";

// Tipos para la analítica
export interface DashboardWidget {
    id: string;
    title: string;
    type: "bar" | "donut";
    sheet_id: number;
    dimension_field: string; // Eje X (Categoría)
    measure_field: string;   // Eje Y (Valor)
    aggregation: "sum" | "count" | "avg";
    color?: string;
}

interface AnalyticsEngineProps {
    moduleId: number;
    allSheets: any[];
    initialSheetContent: any;
}

export const AnalyticsEngine = ({ moduleId, allSheets, initialSheetContent }: AnalyticsEngineProps) => {
    // 1. ESTADO
    const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [currentSheetId, setCurrentSheetId] = useState(allSheets[0].id);
    const [sheetData, setSheetData] = useState<Record<number, any>>({
        [allSheets[0].id]: initialSheetContent
    });
    const [loadingSheet, setLoadingSheet] = useState<number | null>(null);

    // Nuevo Widget Temporal
    const [newWidget, setNewWidget] = useState<Partial<DashboardWidget>>({
        title: "Nuevo Análisis",
        type: "bar",
        aggregation: "sum",
        sheet_id: allSheets[0].id
    });

    // 2. FETCH DATA DE HOJAS ON-DEMAND
    const loadSheetData = async (sheetId: number) => {
        if (sheetData[sheetId]) return;
        setLoadingSheet(sheetId);
        const { data } = await getFinSheetContentAction(sheetId);
        if (data) {
            setSheetData(prev => ({ ...prev, [sheetId]: data }));
        }
        setLoadingSheet(null);
    };

    // 3. CAMBIO DE HOJA EN EL CREADOR
    useEffect(() => {
        if (newWidget.sheet_id) {
            loadSheetData(newWidget.sheet_id);
        }
    }, [newWidget.sheet_id]);

    // 4. LÓGICA DE PROCESAMIENTO (Aggregation)
    const processChartData = (widget: DashboardWidget) => {
        const content = sheetData[widget.sheet_id];
        if (!content || !content.data) return [];

        const rows = content.data as any[];
        const groupedMap = new Map<string, number>();
        const countMap = new Map<string, number>();

        rows.forEach(row => {
            const dimValue = row.row_data?.[widget.dimension_field] || "Sin Valor";
            const measureValue = parseFloat(row.row_data?.[widget.measure_field] || 0);

            if (!groupedMap.has(dimValue)) {
                groupedMap.set(dimValue, 0);
                countMap.set(dimValue, 0);
            }

            groupedMap.set(dimValue, groupedMap.get(dimValue)! + measureValue);
            countMap.set(dimValue, countMap.get(dimValue)! + 1);
        });

        // Convertir Map a Array para el Chart
        let result = Array.from(groupedMap.entries()).map(([label, total], idx) => {
            let finalValue = total;
            if (widget.aggregation === "count") finalValue = countMap.get(label)!;
            if (widget.aggregation === "avg") finalValue = total / countMap.get(label)!;

            return {
                label: String(label),
                value: Number(finalValue.toFixed(2)),
                color: `hsl(var(--chart-${(idx % 5) + 1}))`
            };
        });

        // Ordenar por valor (Top 10 para que se vea limpio)
        return result.sort((a, b) => b.value - a.value).slice(0, 10);
    };

    // 5. ACCIONES
    const addWidget = () => {
        if (!newWidget.dimension_field || !newWidget.measure_field) return;

        const widget: DashboardWidget = {
            id: Math.random().toString(36).substring(7),
            title: newWidget.title || "Análisis",
            type: newWidget.type || "bar",
            sheet_id: newWidget.sheet_id!,
            dimension_field: newWidget.dimension_field,
            measure_field: newWidget.measure_field,
            aggregation: newWidget.aggregation || "sum"
        };

        setWidgets([...widgets, widget]);
        setIsAdding(false);
    };

    const removeWidget = (id: string) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    // Campos disponibles de la hoja seleccionada para el Widget
    const availableColumns = useMemo(() => {
        const sid = newWidget.sheet_id || allSheets[0].id;
        return sheetData[sid]?.columns || [];
    }, [newWidget.sheet_id, sheetData, allSheets]);

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            {/* Sidebar de Configuración */}
            <div className={cn(
                "w-80 bg-background border rounded-xl p-4 flex flex-col gap-6 transition-all shadow-sm shrink-0",
                !isAdding && "hidden md:flex"
            )}>
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Settings className="w-5 h-5 text-primary" />
                    <h2 className="font-bold text-lg">Creador Dinámico</h2>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Paso 1: Seleccionar Datos</label>
                        <select
                            className="w-full h-10 rounded-md border px-3 text-sm focus:ring-2 focus:ring-primary"
                            value={newWidget.sheet_id}
                            onChange={(e) => setNewWidget({ ...newWidget, sheet_id: Number(e.target.value) })}
                        >
                            {allSheets.map(s => (
                                <option key={s.id} value={s.id}>Hoja: {s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Paso 2: Título del Widget</label>
                        <Input
                            value={newWidget.title}
                            placeholder="Ej: Gastos por Categoría"
                            onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Paso 3: Tipo de Gráfico</label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant={newWidget.type === "bar" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setNewWidget({ ...newWidget, type: "bar" })}
                            >
                                <BarChart3 className="w-4 h-4 mr-1" /> Barra
                            </Button>
                            <Button
                                variant={newWidget.type === "donut" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setNewWidget({ ...newWidget, type: "donut" })}
                            >
                                <PieChart className="w-4 h-4 mr-1" /> Donut
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Paso 4: Eje X (Categoría)</label>
                        <select
                            className="w-full h-10 rounded-md border px-3 text-sm"
                            value={newWidget.dimension_field}
                            onChange={(e) => setNewWidget({ ...newWidget, dimension_field: e.target.value })}
                        >
                            <option value="">-- Seleccionar Campo --</option>
                            {availableColumns.map((col: any) => (
                                <option key={col.id} value={col.field_key}>{col.header_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Paso 5: Eje Y (Valor)</label>
                        <select
                            className="w-full h-10 rounded-md border px-3 text-sm"
                            value={newWidget.measure_field}
                            onChange={(e) => setNewWidget({ ...newWidget, measure_field: e.target.value })}
                        >
                            <option value="">-- Seleccionar Campo --</option>
                            {availableColumns.filter((col: any) => col.field_type === 'number' || col.field_type === 'currency').map((col: any) => (
                                <option key={col.id} value={col.field_key}>{col.header_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">Operación (Agregración)</label>
                        <div className="flex gap-2">
                            {["sum", "avg", "count"].map((agg) => (
                                <button
                                    key={agg}
                                    onClick={() => setNewWidget({ ...newWidget, aggregation: agg as any })}
                                    className={cn(
                                        "px-3 py-1 text-xs rounded-full border transition-all",
                                        newWidget.aggregation === agg ? "bg-primary text-white border-primary" : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {agg.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={addWidget}
                            disabled={!newWidget.dimension_field || !newWidget.measure_field}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Insertar en Dashboard
                        </Button>
                    </div>
                </div>

                <div className="mt-auto bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 mb-1">Tip de Experto</p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                        Usa campos numéricos para el Eje Y y campos de tipo texto o fecha para el Eje X para obtener mejores visualizaciones.
                    </p>
                </div>
            </div>

            {/* Dashboard Principal */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {widgets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary/30">
                            <LayoutGrid className="w-12 h-12" />
                        </div>
                        <div className="max-w-md">
                            <h3 className="text-lg font-bold">Tu Dashboard está vacío</h3>
                            <p className="text-muted-foreground">
                                Usa el panel de la izquierda para configurar tu primer análisis dinámico. Puedes comparar cualquier campo del módulo con funciones de agregación.
                            </p>
                        </div>
                        <Button onClick={() => setIsAdding(true)} className="md:hidden">
                            Abrir Configuración
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {widgets.map(widget => (
                            <Card key={widget.id} className="overflow-hidden border-muted-foreground/10 hover:shadow-lg transition-all group">
                                <CardHeader className="flex flex-row items-center justify-between py-3 px-5 bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-background rounded border group-hover:bg-primary/10 transition-colors">
                                            {widget.type === "bar" ? <BarChart3 className="w-4 h-4 text-primary" /> : <PieChart className="w-4 h-4 text-primary" />}
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-bold uppercase tracking-tight">{widget.title}</CardTitle>
                                            <p className="text-[10px] text-muted-foreground">
                                                Hoja: {allSheets.find(s => s.id === widget.sheet_id)?.name} | {widget.aggregation.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeWidget(widget.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-4 flex flex-col items-center min-h-[300px] justify-center">
                                    {widget.type === "bar" ? (
                                        <ShadcnLiteBarChart
                                            data={processChartData(widget)}
                                            className="w-full"
                                            height={250}
                                            margin={{ top: 10, right: 10, bottom: 30, left: 40 }}
                                        />
                                    ) : (
                                        <ShadcnLiteDonutChart
                                            data={processChartData(widget)}
                                            size={220}
                                        />
                                    )}

                                    <div className="mt-4 flex gap-4 text-xs">
                                        <div className="flex flex-col items-center">
                                            <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Eje Categoría (X)</span>
                                            <Badge variant="outline" className="font-normal text-[10px]">{widget.dimension_field}</Badge>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Eje Valor (Y)</span>
                                            <Badge variant="outline" className="font-normal text-[10px]">{widget.measure_field}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
