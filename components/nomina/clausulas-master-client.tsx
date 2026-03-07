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
import { Plus, Edit, Trash2, Save, X, FileText, Info } from 'lucide-react'
import { toast } from 'sonner'
import { getClausulasMaster, upsertClausulaMaster, getConceptosAction } from '@/actions/nomina/clausulas-actions'
import { ClausulaRow } from '@/types/db'

export function ClausulasMasterClient() {
    const [clausulas, setClausulas] = useState<ClausulaRow[]>([])
    const [conceptos, setConceptos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [editingId, setEditingId] = useState<number | undefined>(undefined)

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        concepto_id: '',
        activo: true
    })

    const loadData = async () => {
        setLoading(true)
        const [resCl, resCo] = await Promise.all([
            getClausulasMaster(),
            getConceptosAction()
        ])
        if (resCl.success) setClausulas(resCl.data || [])
        if (resCo.success) setConceptos(resCo.data || [])
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleEdit = (c: ClausulaRow) => {
        setEditingId(c.id)
        setFormData({
            nombre: c.nombre,
            descripcion: c.descripcion || '',
            concepto_id: c.concepto_id,
            activo: !!c.activo
        })
        setIsEditing(true)
    }

    const handleCancel = () => {
        setIsEditing(false)
        setEditingId(undefined)
        setFormData({ nombre: '', descripcion: '', concepto_id: '', activo: true })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await upsertClausulaMaster(formData, editingId)
        if (res.success) {
            toast.success(res.message)
            handleCancel()
            loadData()
        } else {
            toast.error(res.message)
        }
    }

    if (loading) return <div className="h-96 flex items-center justify-center text-slate-500">Cargando definiciones...</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Listado */}
            <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-500" />
                        Definiciones de Cláusulas
                    </CardTitle>
                    <CardDescription>
                        Catálogo de beneficios y compensaciones extralegales registradas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Concepto Nómina</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clausulas.map((c) => (
                                <TableRow key={c.id}>
                                    <TableCell className="font-medium">{c.nombre}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-[10px]">
                                            {c.concepto_id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={c.activo ? 'default' : 'secondary'}>
                                            {c.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(c)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Formulario */}
            <Card className="border-none shadow-sm h-fit sticky top-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {isEditing ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {isEditing ? 'Editar Cláusula' : 'Nueva Cláusula'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre de la Cláusula *</Label>
                            <Input
                                placeholder="Ej: Auxilio de Rodamiento"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Concepto Contable *</Label>
                            <Select
                                value={formData.concepto_id}
                                onValueChange={val => setFormData({ ...formData, concepto_id: val })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar concepto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {conceptos.filter(c => c.tipo === 'Devengo').map(c => (
                                        <SelectItem key={c.id} value={c.id}>
                                            [{c.id}] {c.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Descripción / Notas Auditoría</Label>
                            <Textarea
                                placeholder="Indique para qué se usa esta cláusula..."
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                rows={3}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                            <Label className="text-sm font-medium">Cláusula Activa</Label>
                            <Switch
                                checked={formData.activo}
                                onCheckedChange={val => setFormData({ ...formData, activo: val })}
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            {isEditing && (
                                <Button type="button" variant="outline" className="flex-1" onClick={handleCancel}>
                                    <X className="h-4 w-4 mr-2" /> Cancelar
                                </Button>
                            )}
                            <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                                <Save className="h-4 w-4 mr-2" /> {isEditing ? 'Actualizar' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
