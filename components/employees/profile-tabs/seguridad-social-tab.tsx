"use client"

import { Employee } from "@/types/employee"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShieldAlert, ShieldCheck } from "lucide-react"
import { EPS_LIST, ARL_LIST, PENSION_FUNDS_LIST, COMPENSATION_FUNDS_LIST } from "@/lib/constants"

export function SeguridadSocialTab({ employee, editMode }: { employee: Employee, editMode: boolean }) {
    if (!editMode) {
        return (
            <Card className="border-none shadow-none">
                <CardHeader className="px-0">
                    <CardTitle className="text-xl font-bold text-gray-800">Seguridad Social y Parafiscales</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex gap-4 p-4 rounded-xl bg-green-50/50 border border-green-100">
                            <ShieldCheck className="h-6 w-6 text-green-600 shrink-0 mt-1" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-green-800 uppercase tracking-wider">E.P.S. (Salud)</p>
                                <p className="text-gray-900 font-medium">{employee.eps_id || 'No registrada'}</p>
                                <p className="text-xs text-green-600">Aporte mensual: 4% empleado</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                            <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Fondo de Pensiones</p>
                                <p className="text-gray-900 font-medium">{employee.pension_fund_id || 'No registrado'}</p>
                                <p className="text-xs text-blue-600">Aporte mensual: 4% empleado</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                            <ShieldAlert className="h-6 w-6 text-orange-600 shrink-0 mt-1" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-orange-800 uppercase tracking-wider">A.R.L. (Riesgos)</p>
                                <p className="text-gray-900 font-medium">{employee.arl_id || 'No registrada'}</p>
                                <p className="text-xs text-orange-600">A cargo de la empresa 100%</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
                            <ShieldCheck className="h-6 w-6 text-purple-600 shrink-0 mt-1" />
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Caja de Compensación</p>
                                <p className="text-gray-900 font-medium">{employee.compensation_fund_id || 'No registrada'}</p>
                                <p className="text-xs text-purple-600">A cargo de la empresa 4%</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="text-xl font-bold text-gray-800">Editar Entidades de Seguridad Social</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="eps_id">Entidad Salud (E.P.S.)</Label>
                        <Select name="eps_id" defaultValue={employee.eps_id || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione E.P.S." />
                            </SelectTrigger>
                            <SelectContent>
                                {EPS_LIST.map(eps => <SelectItem key={eps} value={eps}>{eps}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="arl_id">Entidad Riesgos (A.R.L.)</Label>
                        <Select name="arl_id" defaultValue={employee.arl_id || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione A.R.L." />
                            </SelectTrigger>
                            <SelectContent>
                                {ARL_LIST.map(arl => <SelectItem key={arl} value={arl}>{arl}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="pension_fund_id">Fondo de Pensiones</Label>
                        <Select name="pension_fund_id" defaultValue={employee.pension_fund_id || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione Fondo" />
                            </SelectTrigger>
                            <SelectContent>
                                {PENSION_FUNDS_LIST.map(pen => <SelectItem key={pen} value={pen}>{pen}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="compensation_fund_id">Caja de Compensación</Label>
                        <Select name="compensation_fund_id" defaultValue={employee.compensation_fund_id || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione Caja" />
                            </SelectTrigger>
                            <SelectContent>
                                {COMPENSATION_FUNDS_LIST.map(caja => <SelectItem key={caja} value={caja}>{caja}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
