"use client"

import { useState } from "react"
import { type CargoRow, deleteCargoAction, upsertCargoAction } from "@/actions/nomina/cargos-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Lock } from "lucide-react"
import { CurrencyInput } from "@/components/ui/currency-input"
import { getGlobalLockedPeriodsAction } from "@/actions/nomina/liquidacion-actions"
import { cn } from "@/lib/utils"

export function CargosClient({ cargos }: { cargos: CargoRow[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [editingCargo, setEditingCargo] = useState<CargoRow | null>(null)
    const [isPending, setIsPending] = useState(false)
    const [lockedPeriods, setLockedPeriods] = useState<any[]>([])

    useState(() => {
        getGlobalLockedPeriodsAction().then(res => {
            if (res.success && res.data) setLockedPeriods(res.data)
        })
    })

    const isLocked = lockedPeriods.some(p => p.estado === 'Calculado')

    const handleOpenEdit = (cargo: CargoRow) => {
        setEditingCargo(cargo)
        setIsOpen(true)
    }

    const handleOpenNew = () => {
        setEditingCargo(null)
        setIsOpen(true)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        const formData = new FormData(e.currentTarget)

        // Convertir el select a input text manejable
        const selectRiesgo = formData.get('clase_riesgo_arl_select') as string
        if (selectRiesgo) {
            const pRiesgo = selectRiesgo.includes('-') ? selectRiesgo.split('-')[1].trim().replace('%', '') : "0"
            formData.set('clase_riesgo_arl', selectRiesgo)
            formData.set('porcentaje_riesgo_arl', pRiesgo)
        }

        const sueldo = formData.get('sueldo_mensual_base') as string
        if (sueldo) {
            formData.set('sueldo_mensual_base', sueldo.replace(/\$|\.|\s/g, '').replace(',', '.'))
        }

        try {
            const res = await upsertCargoAction({}, formData)

            if (res.success) {
                toast.success(res.message)
                setIsOpen(false)
            } else {
                toast.error(res.message || "Error al guardar")
            }
        } catch (error) {
            toast.error("Fallo de conexión")
        } finally {
            setIsPending(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar este cargo?")) return

        const res = await deleteCargoAction(id)
        if (res.success) {
            toast.success(res.message)
        } else {
            toast.error(res.message)
        }
    }

    return (
        <div className="space-y-4">
            {isLocked && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-900 shadow-sm mb-6 animate-in fade-in slide-in-from-top-1">
                    <div className="p-2 bg-amber-100 rounded-full">
                        <Lock className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                        <p className="font-bold text-sm uppercase tracking-tight">Gestión de Cargos Bloqueada</p>
                        <p className="text-xs opacity-90 leading-relaxed">Existen procesos de nómina activos (en revisión o aprobados). No se permiten cambios en la estructura de cargos o salarios base para mantener la integridad de los cálculos actuales.</p>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Cargos Activos en la Empresa ({cargos.length})</h2>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            onClick={handleOpenNew}
                            className={cn("bg-indigo-600 hover:bg-indigo-700", isLocked && "bg-slate-400 cursor-not-allowed opacity-70")}
                            disabled={isLocked}
                        >
                            {isLocked ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            {isLocked ? "Cargos Bloqueados" : "Nuevo Cargo"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingCargo ? "Editar Cargo" : "Crear Nuevo Cargo"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {editingCargo && <input type="hidden" name="id" value={editingCargo.id} />}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre Oficial del Cargo</Label>
                                    <Input id="nombre" name="nombre" defaultValue={editingCargo?.nombre} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="sueldo_mensual_base">Sueldo Mensual Base ($)</Label>
                                    <CurrencyInput id="sueldo_mensual_base" name="sueldo_mensual_base" defaultValue={editingCargo?.sueldo_mensual_base} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="jornada_diaria_estandar">Jornada Diaria Promedio (Horas)</Label>
                                    <Input id="jornada_diaria_estandar" name="jornada_diaria_estandar" type="number" defaultValue={editingCargo?.jornada_diaria_estandar || 8} required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clase_riesgo_arl_select">Riesgo ARL Principal</Label>
                                    <Select name="clase_riesgo_arl_select" defaultValue={editingCargo?.clase_riesgo_arl || "Riesgo I - 0.522%"}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione el riesgo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Riesgo I - 0.522%">Riesgo I - 0.522% (Riesgo Mínimo)</SelectItem>
                                            <SelectItem value="Riesgo II - 1.044%">Riesgo II - 1.044% (Riesgo Bajo)</SelectItem>
                                            <SelectItem value="Riesgo III - 2.436%">Riesgo III - 2.436% (Riesgo Medio)</SelectItem>
                                            <SelectItem value="Riesgo IV - 4.350%">Riesgo IV - 4.350% (Riesgo Alto)</SelectItem>
                                            <SelectItem value="Riesgo V - 6.960%">Riesgo V - 6.960% (Riesgo Máximo)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Breve descripción del rol (Opcional)</Label>
                                <Input id="description" name="description" defaultValue={editingCargo?.description || ""} />
                            </div>

                            <div className="flex flex-col gap-3 py-3 border-t mt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="aplica_auxilio_transporte" name="aplica_auxilio_transporte" defaultChecked={editingCargo ? Boolean(editingCargo.aplica_auxilio_transporte) : true} />
                                    <Label htmlFor="aplica_auxilio_transporte" className="text-sm font-normal">
                                        ¿Este cargo es elegible para <b>Auxilio de Transporte</b>? <span className="text-muted-foreground">(Solo aplica operativamente si gana hasta 2 SMLMV)</span>
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="is_active" name="is_active" defaultChecked={editingCargo ? Boolean(editingCargo.is_active) : true} />
                                    <Label htmlFor="is_active" className="text-sm font-normal">
                                        Mantener cargo como <b>Activo</b>
                                    </Label>
                                </div>
                            </div>

                            <DialogFooter className="mt-6">
                                <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={isPending}>{isPending ? "Guardando..." : "Guardar Cargo"}</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>N°</TableHead>
                            <TableHead>Nombre del Cargo</TableHead>
                            <TableHead>Sueldo Base Mensual</TableHead>
                            <TableHead>Jornada Diaria</TableHead>
                            <TableHead>Riesgo ARL</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cargos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-slate-500">
                                    No hay cargos configurados todavía.
                                </TableCell>
                            </TableRow>
                        ) : (
                            cargos.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell>{c.id}</TableCell>
                                    <TableCell className="font-medium text-indigo-700">
                                        {c.nombre}
                                        {Boolean(c.aplica_auxilio_transporte) && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Aux. Transp</span>}
                                        {!Boolean(c.is_active) && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Inactivo</span>}
                                    </TableCell>
                                    <TableCell>{formatCurrency(c.sueldo_mensual_base)}</TableCell>
                                    <TableCell>{c.jornada_diaria_estandar} hrs</TableCell>
                                    <TableCell>{c.porcentaje_riesgo_arl}%</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(c)}
                                            disabled={isLocked}
                                            className={isLocked ? "opacity-30 cursor-not-allowed" : ""}
                                        >
                                            {isLocked ? <Lock className="h-4 w-4" /> : <Pencil className="h-4 w-4 text-slate-500" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(c.id)}
                                            disabled={isLocked}
                                            className={isLocked ? "opacity-30 cursor-not-allowed" : ""}
                                        >
                                            <Trash2 className={cn("h-4 w-4", isLocked ? "text-slate-400" : "text-red-400")} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    )
}
