"use client"

import { Employee } from "@/types/employee"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Landmark } from "lucide-react"

export function BancariaTab({ employee, editMode }: { employee: Employee, editMode: boolean }) {
    if (!editMode) {
        return (
            <Card className="border-none shadow-none">
                <CardHeader className="px-0">
                    <CardTitle className="text-xl font-bold text-gray-800">Información para Pago (Bancaria)</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-5">
                                <Landmark className="h-12 w-12" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase">Banco Registrado</p>
                                <p className="text-xl font-bold text-slate-800">{employee.bank_name || 'Bancolombia (Por Defecto)'}</p>
                                <div className="flex items-center gap-2 text-indigo-600 font-semibold">
                                    <CreditCard className="h-4 w-4" />
                                    <span>{employee.account_type || 'Ahorros'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-center p-5 rounded-2xl bg-indigo-600 text-white shadow-md relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 p-2 opacity-15">
                                <Landmark className="h-16 w-16" />
                            </div>
                            <p className="text-xs font-bold uppercase opacity-80">Número de Cuenta</p>
                            <p className="text-2xl font-mono tracking-widest mt-1">
                                {employee.account_number ? employee.account_number.replace(/\d(?=\d{4})/g, "*") : '**** **** 0000'}
                            </p>
                            <p className="text-[10px] mt-4 opacity-70">Transferencia Electrónica ACH</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <CardTitle className="text-xl font-bold text-gray-800">Actualizar Datos de Pago</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="bank_name">Nombre de la Entidad Bancaria</Label>
                        <Input id="bank_name" name="bank_name" defaultValue={employee.bank_name || ''} placeholder="Ej: Bancolombia, Davivienda..." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="account_type">Tipo de Cuenta</Label>
                        <Select name="account_type" defaultValue={employee.account_type || 'Ahorros'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tipo de Cuenta" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ahorros">Cuenta de Ahorros</SelectItem>
                                <SelectItem value="Corriente">Cuenta Corriente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                        <Label htmlFor="account_number">Número de Cuenta (Sin espacios ni guiones)</Label>
                        <Input id="account_number" name="account_number" defaultValue={employee.account_number || ''} className="font-mono text-lg" />
                        <p className="text-xs text-muted-foreground mt-1 text-amber-600 italic">Verifique minuciosamente el número de cuenta antes de guardar para evitar errores en la dispersión de fondos.</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
