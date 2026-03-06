"use client"

import { Employee } from "@/types/employee"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CargoRow } from "@/actions/nomina/cargos-actions"
import { NumericFormat } from "react-number-format"
import { CurrencyInput } from "@/components/ui/currency-input"
import { WORK_SCHEDULES, EMPLOYMENT_TYPES } from "@/lib/constants"

const formatDateForInput = (date: any) => {
    if (!date) return "";
    if (typeof date === "string") return date.split("T")[0];
    try {
        const d = new Date(date);
        return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
    } catch (e) {
        return "";
    }
};

export function LaboralTab({
    employee,
    editMode,
    cargos = []
}: {
    employee: Employee,
    editMode: boolean,
    cargos: CargoRow[]
}) {
    if (!editMode) {
        return (
            <Card className="border-none shadow-none">
                <CardHeader className="px-0">
                    <CardTitle className="text-xl font-bold text-gray-800">Información Laboral</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Cargo</p>
                            <p className="text-gray-900 font-semibold text-indigo-700">{employee.cargo_name || employee.position || 'No asignado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Fecha de Ingreso</p>
                            <p className="text-gray-900">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'No registrada'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Vencimiento de Contrato</p>
                            <p className="text-gray-900 text-amber-700">{employee.termination_date ? new Date(employee.termination_date).toLocaleDateString() : 'Término Indefinido'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Modalidad / Jornada</p>
                            <p className="text-gray-900">{employee.work_schedule || 'No definida'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Tipo de Empleo</p>
                            <p className="text-gray-900">{employee.employment_type || 'No especificado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Departamento</p>
                            <p className="text-gray-900">{employee.department || 'No registrado'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Estado del Contrato</p>
                            <p className="text-gray-900 font-medium">{employee.contract_status_name || 'Activo'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="text-xl font-bold text-gray-800">Editar Datos Laborales</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="cargo_id">Cargo Oficial (Estructura de Nómina)</Label>
                        <Select name="cargo_id" defaultValue={employee.cargo_id?.toString()}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione un cargo" />
                            </SelectTrigger>
                            <SelectContent>
                                {cargos.map(cargo => (
                                    <SelectItem key={cargo.id} value={cargo.id.toString()}>
                                        {cargo.nombre} - ({new Intl.NumberFormat('es-CO').format(cargo.sueldo_mensual_base)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hire_date">Fecha de Ingreso</Label>
                        <Input id="hire_date" name="hire_date" type="date" defaultValue={formatDateForInput(employee.hire_date)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="termination_date">Fecha de Vencimiento de Contrato</Label>
                        <Input id="termination_date" name="termination_date" type="date" defaultValue={formatDateForInput(employee.termination_date)} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="work_schedule">Modalidad / Jornada de Trabajo</Label>
                        <Select name="work_schedule" defaultValue={employee.work_schedule || "8:00 a.m - 5:00 p.m. (L-V)"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione Modalidad" />
                            </SelectTrigger>
                            <SelectContent>
                                {WORK_SCHEDULES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="employment_type">Tipo de Empleo</Label>
                        <Select name="employment_type" defaultValue={employee.employment_type || "Tiempo Completo"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Estado Civil" />
                            </SelectTrigger>
                            <SelectContent>
                                {EMPLOYMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Departamento / Área</Label>
                        <Input id="department" name="department" defaultValue={employee.department || ''} />
                    </div>

                    <div className="space-y-2">
                        <Label>Notas Adicionales de Contratación</Label>
                        <Input name="notes" defaultValue={employee.notes || ''} placeholder="Ej: Bono extra de movilidad" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
