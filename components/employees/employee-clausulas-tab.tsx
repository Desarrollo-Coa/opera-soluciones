'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CurrencyInput } from '@/components/ui/currency-input'
import { toast } from 'sonner'
import { getClausulasMaster, getClausulasUsuario, upsertUsuarioClausula, deleteUsuarioClausula, getValoresComunesAction } from '@/actions/nomina/clausulas-actions'
import { getGlobalLockedPeriodsAction } from '@/actions/nomina/liquidacion-actions'
import { Plus, Edit, Trash2, Save, X, Banknote, Calendar, Info, ArrowRight, Lock } from 'lucide-react'
import { ClausulaRow, UsuarioClausulaRow } from '@/types/db'
import { formatCurrency } from '@/lib/currency-utils'
import { cn } from '@/lib/utils'

interface EmployeeClausulasTabProps {
    employeeId: number
}

export function EmployeeClausulasTab({ employeeId }: EmployeeClausulasTabProps) {
    const [clausulasUsuario, setClausulasUsuario] = useState<UsuarioClausulaRow[]>([])
    const [clausulasMaster, setClausulasMaster] = useState<ClausulaRow[]>([])
    const [sugerencias, setSugerencias] = useState<number[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingAssignmentId, setEditingAssignmentId] = useState<number | undefined>(undefined)
    const [lockedPeriods, setLockedPeriods] = useState<Array<{ mes: number; anio: number; quincena: number }>>([])

    // Form state for assignment
    const [formData, setFormData] = useState({
        clausula_id: '',
        monto_mensual: 0,
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: '',
        activo: true,
        notas_auditoria: ''
    })

    const loadData = async () => {
        setLoading(true)
        const [resUser, resMaster, resLocked] = await Promise.all([
            getClausulasUsuario(employeeId),
            getClausulasMaster(),
            getGlobalLockedPeriodsAction()
        ])
        if (resUser.success) setClausulasUsuario(resUser.data || [])
        if (resMaster.success) setClausulasMaster(resMaster.data || [])
        if (resLocked.success && resLocked.data) setLockedPeriods(resLocked.data)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [employeeId])

    // Cargar sugerencias cuando cambia la cláusula seleccionada
    useEffect(() => {
        if (formData.clausula_id) {
            getValoresComunesAction(parseInt(formData.clausula_id)).then(res => {
                if (res.success) setSugerencias(res.data || [])
            })
        } else {
            setSugerencias([])
        }
    }, [formData.clausula_id])

    const isAssignmentLocked = (start: string | Date, end: string | Date | null) => {
        if (!start) return false;
        const dateStart = new Date(start);
        const dateEnd = end ? new Date(end) : new Date(2100, 0, 1); // Infinity-ish

        return lockedPeriods.some(p => {
            const qStart = new Date(p.anio, p.mes - 1, p.quincena === 1 ? 1 : 16);
            const qEnd = p.quincena === 1
                ? new Date(p.anio, p.mes - 1, 15)
                : new Date(p.anio, p.mes, 0);

            return (dateStart <= qEnd) && (dateEnd >= qStart);
        });
    };

    const handleEdit = (assign: UsuarioClausulaRow) => {
        if (isAssignmentLocked(assign.fecha_inicio, assign.fecha_fin)) {
            toast.error("Esta cláusula está bloqueada por una nómina ya generada.");
            return;
        }
        setEditingAssignmentId(assign.id)
        setFormData({
            clausula_id: assign.clausula_id.toString(),
            monto_mensual: Number(assign.monto_mensual),
            fecha_inicio: new Date(assign.fecha_inicio).toISOString().split('T')[0],
            fecha_fin: assign.fecha_fin ? new Date(assign.fecha_fin).toISOString().split('T')[0] : '',
            activo: !!assign.activo,
            notas_auditoria: assign.notas_auditoria || ''
        })
        setIsAdding(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Desea eliminar esta asignación?')) return
        const res = await deleteUsuarioClausula(id)
        if (res.success) {
            toast.success(res.message)
            loadData()
        } else {
            toast.error(res.message)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            ...formData,
            usuario_id: employeeId,
            clausula_id: parseInt(formData.clausula_id),
            fecha_fin: formData.fecha_fin || null
        }
        const res = await upsertUsuarioClausula(payload as any, editingAssignmentId)
        if (res.success) {
            toast.success(res.message)
            resetForm()
            loadData()
        } else {
            toast.error(res.message)
        }
    }

    const resetForm = () => {
        setIsAdding(false)
        setEditingAssignmentId(undefined)
        setFormData({
            clausula_id: '',
            monto_mensual: 0,
            fecha_inicio: new Date().toISOString().split('T')[0],
            fecha_fin: '',
            activo: true,
            notas_auditoria: ''
        })
        setSugerencias([])
    }

    if (loading) return <div className="h-48 flex items-center justify-center animate-pulse">Cargando beneficios...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Beneficios y Cláusulas del Empleado</h3>
                    <p className="text-sm text-slate-500">Gestione los auxilios extralegales (ej. rodamiento, bonos recurrentes).</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" /> Asignar Cláusula
                    </Button>
                )}
            </div>

            {isAdding && (
                <Card className="border-indigo-100 bg-indigo-50/20 shadow-none">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">{editingAssignmentId ? 'Editar Asignación' : 'Nueva Asignación de Cláusula'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isAssignmentLocked(formData.fecha_inicio, formData.fecha_fin) && (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2 text-amber-900 shadow-sm mb-4 animate-in fade-in slide-in-from-top-1">
                                <Lock className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                                <div className="text-[11px]">
                                    <p className="font-semibold uppercase tracking-tight">Periodo Cerrado en Nómina</p>
                                    <p className="opacity-90 leading-tight">No se puede {editingAssignmentId ? 'modificar' : 'asignar'} para este periodo porque ya existe una nómina generada o aprobada.</p>
                                </div>
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Definición de Cláusula *</Label>
                                <Select
                                    value={formData.clausula_id}
                                    onValueChange={val => setFormData({ ...formData, clausula_id: val })}
                                    required
                                >
                                    <SelectTrigger className="bg-white"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                    <SelectContent>
                                        {clausulasMaster.map(cl => (
                                            <SelectItem key={cl.id} value={cl.id.toString()}>{cl.nombre}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Monto Mensual (Total) *</Label>
                                <CurrencyInput
                                    className="bg-white"
                                    value={formData.monto_mensual}
                                    onChange={val => setFormData({ ...formData, monto_mensual: parseFloat(val) || 0 })}
                                    required
                                />
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {sugerencias.length > 0 && (
                                        <p className="text-[10px] text-slate-400 w-full mb-0.5">Sugeridos (usados por otros):</p>
                                    )}
                                    {sugerencias.map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, monto_mensual: m })}
                                            className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-md hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                        >
                                            {formatCurrency(m)}
                                        </button>
                                    ))}
                                    {sugerencias.length === 0 && (
                                        <p className="text-[10px] text-slate-400">Se dividirá por 2 en nómina quincenal.</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Inicio *</Label>
                                <Input
                                    type="date"
                                    className="bg-white"
                                    value={formData.fecha_inicio}
                                    onChange={e => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Fin (Vencimiento)</Label>
                                <Input
                                    type="date"
                                    className="bg-white"
                                    value={formData.fecha_fin}
                                    onChange={e => setFormData({ ...formData, fecha_fin: e.target.value })}
                                    placeholder="Permanente si está vacío"
                                />
                                <p className="text-[10px] text-slate-400 italic">Vacie para indefinida.</p>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <Label>Notas Auditoría / Justificación</Label>
                                <Textarea
                                    className="bg-white"
                                    placeholder="Indique por qué se otorga este beneficio..."
                                    value={formData.notas_auditoria}
                                    onChange={e => setFormData({ ...formData, notas_auditoria: e.target.value })}
                                    rows={1}
                                />
                            </div>
                            <div className="flex items-center gap-4 pt-4 md:col-span-1">
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs">Estado Activo</Label>
                                    <Switch
                                        checked={formData.activo}
                                        onCheckedChange={val => setFormData({ ...formData, activo: val })}
                                    />
                                </div>
                                <div className="flex gap-2 ml-auto">
                                    <Button type="button" variant="outline" size="sm" onClick={resetForm}><X className="h-3 w-3 mr-1" /> Cerrar</Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        className={cn(
                                            "bg-indigo-600 hover:bg-indigo-700",
                                            isAssignmentLocked(formData.fecha_inicio, formData.fecha_fin) && "bg-slate-400 hover:bg-slate-400 cursor-not-allowed"
                                        )}
                                        disabled={isAssignmentLocked(formData.fecha_inicio, formData.fecha_fin)}
                                    >
                                        {isAssignmentLocked(formData.fecha_inicio, formData.fecha_fin) ? <Lock className="h-3 w-3 mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                                        {isAssignmentLocked(formData.fecha_inicio, formData.fecha_fin) ? 'Bloqueado' : (editingAssignmentId ? 'Actualizar' : 'Asignar')}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="border-none shadow-none bg-slate-50/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cláusula (Definición)</TableHead>
                                <TableHead>Valor Mensual</TableHead>
                                <TableHead>Validez</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clausulasUsuario.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                        No hay cláusulas asignadas a este empleado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clausulasUsuario.map((cl) => (
                                    <TableRow key={cl.id}>
                                        <TableCell>
                                            <div className="font-medium text-slate-900">{cl.nombre_clausula}</div>
                                            {cl.notas_auditoria && <div className="text-[10px] text-slate-500 italic max-w-xs truncate">{cl.notas_auditoria}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-indigo-600">{formatCurrency(cl.monto_mensual)}</div>
                                            <div className="text-[9px] text-slate-400 uppercase tracking-tighter">({formatCurrency(cl.monto_mensual / 2)} por quincena)</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(cl.fecha_inicio).toLocaleDateString()}</span>
                                                <ArrowRight className="h-2 w-2" />
                                                <span>{cl.fecha_fin ? new Date(cl.fecha_fin).toLocaleDateString() : '∞ Permanente'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={cl.activo ? 'default' : 'secondary'} className="text-[10px]">
                                                {cl.activo ? 'Activo' : 'Pausado'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {isAssignmentLocked(cl.fecha_inicio, cl.fecha_fin) ? (
                                                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md text-slate-400">
                                                        <Lock className="h-3 w-3" />
                                                        <span className="text-[10px] font-medium">Bloqueado</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cl)}>
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(cl.id)}>
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
