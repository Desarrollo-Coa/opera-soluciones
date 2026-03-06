"use client"

import { useEffect, useState, useActionState } from "react"
import { useFormStatus } from "react-dom"
import { upsertParametrosAction, type ParametrosRow } from "@/actions/nomina/parametros-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Save, History } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/ui/currency-input"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={pending}>
            {pending ? "Guardando..." : "Guardar Parámetros"}
            {!pending && <Save className="ml-2 h-4 w-4" />}
        </Button>
    )
}

export function ParametrosForm({ initialData, allParametros = [] }: { initialData?: ParametrosRow, allParametros?: ParametrosRow[] }) {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState<number>(initialData?.ano_vigencia ?? currentYear);

    // hook de React 19 para Actions: useActionState
    const [state, formAction] = useActionState(upsertParametrosAction, {
        success: false,
        message: "",
    })

    // Mostrar toast al detectar un cambio de estado en el submit
    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state])

    // Encontrar si tenemos datos históricos para el año seleccionado
    const historyData = allParametros.find(p => p.ano_vigencia === selectedYear);
    const hasHistory = !!historyData;

    // Lista de años disponibles (los guardados + próximos futuros para parametrizar + anteriores)
    const yearsSet = new Set<number>();
    allParametros.forEach(p => yearsSet.add(p.ano_vigencia));
    Array.from({ length: 15 }, (_, i) => currentYear - 5 + i).forEach(y => yearsSet.add(y));
    const years = Array.from(yearsSet).sort((a, b) => b - a);

    return (
        <Card className="max-w-4xl border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row justify-between items-start border-b mb-6 pb-6">
                <div>
                    <CardTitle className="text-2xl font-semibold text-gray-800">Parámetros Vigentes {selectedYear}</CardTitle>
                    <CardDescription className="text-[15px] mt-1">
                        Gestión de valores legales y sueldo mínimo para el cálculo de nómina.
                    </CardDescription>
                </div>
                {hasHistory && (
                    <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/20 gap-1.5 shadow-sm">
                            <History className="h-3.5 w-3.5" />
                            Registro Histórico
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Modificado previamente</p>
                    </div>
                )}
            </CardHeader>

            <form action={formAction} key={selectedYear}>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        <div className="space-y-3">
                            <Label htmlFor="ano_vigencia_select" className="text-sm font-semibold text-gray-700">Año de Vigencia</Label>

                            <input type="hidden" name="ano_vigencia" value={selectedYear} />
                            <Select
                                value={selectedYear.toString()}
                                onValueChange={(val) => setSelectedYear(parseInt(val))}
                            >
                                <SelectTrigger id="ano_vigencia_select" className={`h-11 rounded-xl transition-all ${hasHistory ? "border-blue-200 bg-blue-50/30 ring-blue-100" : "bg-gray-50/50 border-gray-200"}`}>
                                    <SelectValue placeholder="Seleccione un año" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {years.map(year => {
                                        const exists = allParametros.some(p => p.ano_vigencia === year);
                                        return (
                                            <SelectItem key={year} value={year.toString()} className="h-10">
                                                <span className="flex items-center gap-2">
                                                    {year}
                                                    {exists ? <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">Guardado</span> : <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">Nuevo</span>}
                                                </span>
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>

                            {state.errors?.ano_vigencia && (
                                <p className="text-sm text-red-500 font-medium">{state.errors.ano_vigencia[0]}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground leading-relaxed pl-1">
                                Los cambios afectarán exclusivamente los cálculos de este periodo fiscal.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="smmlv" className="text-sm font-semibold text-gray-700">Sueldo Mínimo Legal Mensual (SMMLV)</Label>
                            <CurrencyInput
                                id="smmlv"
                                name="smmlv"
                                className="h-11 rounded-xl bg-gray-50/50 border-gray-200"
                                defaultValue={historyData?.smmlv ?? ""}
                                placeholder="Ingrese el SMMLV del año"
                            />
                            {state.errors?.smmlv && (
                                <p className="text-sm text-red-500 font-medium">{state.errors.smmlv[0]}</p>
                            )}
                            <p className="text-[11px] text-blue-600/80 font-medium flex items-center gap-1.5 pl-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Base para seguridad social y parafiscales.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="auxilio_transporte" className="text-sm font-semibold text-gray-700">Auxilio de Transporte</Label>
                            <CurrencyInput
                                id="auxilio_transporte"
                                name="auxilio_transporte"
                                className="h-11 rounded-xl bg-gray-50/50 border-gray-200"
                                defaultValue={historyData?.auxilio_transporte ?? ""}
                                placeholder="Ingrese auxilio de transporte"
                            />
                            {state.errors?.auxilio_transporte && (
                                <p className="text-sm text-red-500 font-medium">{state.errors.auxilio_transporte[0]}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="horas_semanales_maximas" className="text-sm font-semibold text-gray-700">Jornada Semanal Legal (Horas)</Label>
                            <Input
                                id="horas_semanales_maximas"
                                name="horas_semanales_maximas"
                                type="number"
                                step="0.5"
                                className="h-11 rounded-xl bg-gray-50/50 border-gray-200"
                                defaultValue={historyData?.horas_semanales_maximas ?? ""}
                                placeholder="Ej: 44"
                            />
                            {state.errors?.horas_semanales_maximas && (
                                <p className="text-sm text-red-500 font-medium">{state.errors.horas_semanales_maximas[0]}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground pl-1">
                                Según Ley de reducción de jornada (vigente 2024-2026).
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Label htmlFor="horas_mensuales_promedio" className="text-sm font-semibold text-gray-700">Factor Horas Mensuales (Promedio)</Label>
                            <Input
                                id="horas_mensuales_promedio"
                                name="horas_mensuales_promedio"
                                type="number"
                                className="h-11 rounded-xl bg-gray-50/50 border-gray-200"
                                defaultValue={historyData?.horas_mensuales_promedio ?? ""}
                                placeholder="Ej: 220 o 240"
                            />
                            {state.errors?.horas_mensuales_promedio && (
                                <p className="text-sm text-red-500 font-medium">{state.errors.horas_mensuales_promedio[0]}</p>
                            )}
                            <p className="text-[11px] text-muted-foreground pl-1">
                                Utilizado para el cálculo de horas extra y recargos.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center bg-gray-50/80 py-6 px-8 border-t rounded-b-xl mt-4">
                    <Button
                        variant="ghost"
                        type="button"
                        className="text-gray-500 hover:text-gray-700 hover:bg-white"
                        onClick={() => setSelectedYear(initialData?.ano_vigencia ?? currentYear)}
                    >
                        Restaurar vista inicial
                    </Button>
                    <div className="flex gap-3">
                        <SubmitButton />
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}

