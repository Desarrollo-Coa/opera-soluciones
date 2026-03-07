"use client"

import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import {
    Plus, Edit, X, Save,
    Settings2, Percent,
    BusFront, Check, AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn-lite"

interface TipoAusencia {
    id: number
    nombre: string
    descripcion?: string
    porcentaje_pago: number
    afecta_auxilio: boolean
    is_active: boolean
}

export function TipoAusenciaPanel() {
    const [tipos, setTipos] = useState<TipoAusencia[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState<number | null>(null)
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [formData, setFormData] = useState<Partial<TipoAusencia>>({
        nombre: "",
        descripcion: "",
        porcentaje_pago: 100,
        afecta_auxilio: true
    })

    useEffect(() => {
        fetchTipos()
    }, [])

    const fetchTipos = async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/ausencias/tipos?all=true")
            if (res.ok) {
                const data = await res.json()
                setTipos(data)
            }
        } catch (error) {
            toast.error("Error al cargar tipos de ausencia")
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (tipo: TipoAusencia) => {
        setIsEditing(tipo.id)
        setFormData(tipo)
        setIsCreating(false)
    }

    const handleCancel = () => {
        setIsEditing(null)
        setIsCreating(false)
        setFormData({
            nombre: "",
            descripcion: "",
            porcentaje_pago: 100,
            afecta_auxilio: true
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const method = isEditing ? "PUT" : "POST"
        const url = isEditing ? `/api/ausencias/tipos/${isEditing}` : "/api/ausencias/tipos"

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success(isEditing ? "Tipo actualizado" : "Tipo creado")
                handleCancel()
                fetchTipos()
            } else {
                const err = await res.json()
                toast.error(err.error || "Error al guardar")
            }
        } catch (error) {
            toast.error("Error de conexión")
        }
    }

    const toggleStatus = async (tipo: TipoAusencia) => {
        try {
            const res = await fetch(`/api/ausencias/tipos/${tipo.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !tipo.is_active })
            })

            if (res.ok) {
                toast.success(tipo.is_active ? "Desactivado" : "Activado")
                fetchTipos()
            }
        } catch (error) {
            toast.error("Error al cambiar estado")
        }
    }

    if (loading && tipos.length === 0) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* Lista de Tipos */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-slate-900">Configuración de Tipos</h2>
                    <Button
                        onClick={() => setIsCreating(true)}
                        disabled={isCreating || !!isEditing}
                        className="rounded-full gap-2 bg-[#0b57d0] hover:bg-[#0842a0]"
                    >
                        <Plus className="w-4 h-4" /> Nuevo Tipo
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tipos.map((tipo) => (
                        <Card key={tipo.id} className={`overflow-hidden border-slate-100 shadow-sm transition-all hover:shadow-md ${!tipo.is_active ? 'opacity-60' : ''}`}>
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-base font-bold text-slate-800">{tipo.nombre}</CardTitle>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(tipo)}
                                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(tipo)}
                                        className={`p-1.5 rounded-full hover:bg-slate-100 transition-colors ${tipo.is_active ? 'text-slate-400 hover:text-red-500' : 'text-emerald-500 hover:text-emerald-600'}`}
                                        title={tipo.is_active ? "Desactivar" : "Activar"}
                                    >
                                        {tipo.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 space-y-3">
                                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                                    {tipo.descripcion || "Sin descripción"}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                        <Percent className="w-3 h-3" />
                                        Pago: {tipo.porcentaje_pago}%
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tipo.afecta_auxilio ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                                        <BusFront className="w-3 h-3" />
                                        {tipo.afecta_auxilio ? "Afecta Auxilio" : "No Afecta Auxilio"}
                                    </div>
                                    {!tipo.is_active && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-100">
                                            Inactivo
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {tipos.length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                            <Settings2 className="w-12 h-12 mb-3 opacity-20" />
                            <p>No hay tipos de ausencia configurados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor / Crear */}
            <div className="space-y-4">
                <Card className={`sticky top-6 border-slate-200 shadow-lg ${!isEditing && !isCreating ? 'bg-slate-50/50' : 'bg-white'}`}>
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <div className="p-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                                <Settings2 className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            {isEditing ? "Editar Parámetros" : isCreating ? "Nuevo Tipo de Ausencia" : "Seleccione un tipo para editar o cree uno nuevo"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {(isEditing || isCreating) ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Nombre *</Label>
                                    <Input
                                        value={formData.nombre}
                                        onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))}
                                        placeholder="Ej: Incapacidad Médica"
                                        className="rounded-xl border-slate-200 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-slate-500 uppercase">Descripción</Label>
                                    <Input
                                        value={formData.descripcion}
                                        onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))}
                                        placeholder="Detalles adicionales..."
                                        className="rounded-xl border-slate-200"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 pt-2">
                                    <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-semibold text-slate-700">Porcentaje de Pago</Label>
                                                <p className="text-[10px] text-slate-500">Valor que se reconoce al colaborador</p>
                                            </div>
                                            <div className="relative w-24">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={formData.porcentaje_pago}
                                                    onChange={e => setFormData(p => ({ ...p, porcentaje_pago: parseInt(e.target.value) || 0 }))}
                                                    className="rounded-lg pl-3 pr-7 text-right font-mono font-bold"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold text-slate-700">Afecta Auxilio Transporte</Label>
                                            <p className="text-[10px] text-slate-500">Determina si descuenta el auxilio</p>
                                        </div>
                                        <Switch
                                            checked={formData.afecta_auxilio}
                                            onCheckedChange={v => setFormData(p => ({ ...p, afecta_auxilio: v }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button type="button" variant="ghost" onClick={handleCancel} className="flex-1 rounded-full">
                                        Cancelar
                                    </Button>
                                    <Button type="submit" className="flex-1 rounded-full bg-[#0b57d0] hover:bg-[#0842a0]">
                                        <Save className="w-4 h-4 mr-2" /> Guardar
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <AlertCircle className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-sm">Panel de configuración activo</p>
                                <p className="text-xs px-6 py-2">Aquí puedes definir cómo se liquidan económicamente los diferentes tipos de novedades.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
