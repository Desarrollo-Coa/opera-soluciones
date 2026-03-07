"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table"
import { toast } from "sonner"

// Shadcn UI primitives
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

// Shadcn-lite (sin dependencias pesadas)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/shadcn-lite"
import { ShadcnLiteBarChart } from "@/components/ui/shadcn-lite-charts"

// Icons
import {
  CalendarDays, Users, TrendingUp, Plus, BarChart3,
  Search, Download, Edit, Upload, X, FileText,
  ChevronLeft, ChevronRight, ArrowUpDown, LayoutDashboard,
  ClipboardList, Home, ArrowLeft, Settings2,
} from "lucide-react"
import Link from "next/link"
import { UniversalSelect } from "@/components/ui/universal-select"
import { exportStatsToExcel, exportAusenciasToExcel } from "@/lib/export-utils"
import { cn } from "@/lib/utils"
import { TipoAusenciaPanel } from "@/components/ausencias/tipo-ausencia-panel"

// ──────────────────────────────────────────────
// TIPOS
// ──────────────────────────────────────────────
interface DashboardStats {
  totalAusencias: number
  ausenciasEsteMes: number
  colaboradoresAfectados: number
  tiposAusencia: Array<{ nombre: string; cantidad: number; porcentaje: number }>
  tendenciaMensual: Array<{ mes: string; cantidad: number }>
}

interface Ausencia {
  AU_IDAUSENCIA_PK: number
  US_IDUSUARIO_FK: number
  TA_IDTIPO_AUSENCIA_FK: number
  AU_FECHA_INICIO: string
  AU_FECHA_FIN: string
  AU_DIAS_AUSENCIA: number
  AU_DESCRIPCION: string
  AU_SOPORTE_URL?: string
  AU_USUARIO_REGISTRO_FK: number
  AU_FECHA_REGISTRO: string
  AU_ACTIVO: boolean

  // Campos del JOIN
  nombre_colaborador: string
  apellido_colaborador: string
  nombre_departamento: string
  nombre_tipo_ausencia: string

  archivos: Array<{ id_archivo: number; url_archivo: string; nombre_archivo: string }>
}

interface Colaborador {
  id: number
  first_name: string
  last_name: string
  position?: string
  department?: string
}

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
const TIPO_COLORS: Record<string, string> = {
  "Enfermedad General": "#10b981",
  "Enfermedad Laboral": "#f59e0b",
  "Accidente de Trabajo": "#ef4444",
  "No Presentado": "#8b5cf6",
  "Licencia": "#06b6d4",
  "Vacaciones": "#3b82f6",
}

function formatFecha(f: string) {
  if (!f) return ""
  // Si es ISO (contiene T), extraemos la parte de la fecha
  const datePart = f.includes("T") ? f.split("T")[0] : f
  const [year, month, day] = datePart.split("-")
  if (!year || !month || !day) return f
  return `${day}-${month}-${year}`
}

function getTipoBadgeClass(tipo: string) {
  const map: Record<string, string> = {
    "enfermedad general": "bg-emerald-100 text-emerald-800",
    "accidente de trabajo": "bg-red-100 text-red-800",
    "enfermedad laboral": "bg-amber-100 text-amber-800",
    "no presentado": "bg-purple-100 text-purple-800",
    "licencia": "bg-cyan-100 text-cyan-800",
  }
  return map[tipo.toLowerCase()] ?? "bg-slate-100 text-slate-700"
}

// ──────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ──────────────────────────────────────────────
type Tab = "dashboard" | "gestion" | "config"

export default function AusenciasPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard")

  // ── Dashboard state ──
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // ── Historia / tabla state ──
  const [ausencias, setAusencias] = useState<Ausencia[]>([])
  const [historialLoading, setHistorialLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("all")
  const [tiposAusencias, setTiposAusencias] = useState<Array<{ id: number; nombre: string }>>([])

  // ── Registro state ──
  const [editingAusencia, setEditingAusencia] = useState<Ausencia | null>(null)
  const [colaboradorId, setColaboradorId] = useState<string>("")
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [formData, setFormData] = useState({ tipoAusencia: "", fechaInicio: "", fechaFin: "", descripcion: "" })
  const [archivos, setArchivos] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  // ── Cargar datos al montar ──
  useEffect(() => {
    fetchStats()
    fetchHistorial()
    fetchTipos()
    fetchColaboradores()
  }, [])

  const fetchColaboradores = async () => {
    try {
      const res = await fetch("/api/colaboradores")
      if (res.ok) {
        const data = await res.json()
        setColaboradores(data.filter((u: any) => u.activo || u.is_active))
      }
    } catch (e) {
      console.error("Error fetching colaboradores", e)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const res = await fetch("/api/ausencias/dashboard/stats")
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setStats(data)
    } catch (err) {
      console.error("Error stats:", err)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchHistorial = async () => {
    try {
      setHistorialLoading(true)
      const res = await fetch("/api/ausencias")
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) setAusencias(data)
    } catch (err) {
      console.error("Error historial:", err)
    } finally {
      setHistorialLoading(false)
    }
  }

  const fetchTipos = async () => {
    try {
      const res = await fetch("/api/ausencias/tipos")
      const data = await res.json()
      if (Array.isArray(data)) setTiposAusencias(data)
    } catch { }
  }

  // ── Registro: submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!colaboradorId) { toast.error("Seleccione un colaborador"); return }
    if (!formData.tipoAusencia || !formData.fechaInicio || !formData.fechaFin) {
      toast.error("Complete todos los campos obligatorios"); return
    }
    if (new Date(formData.fechaInicio) > new Date(formData.fechaFin)) {
      toast.error("La fecha de inicio debe ser anterior a la de fin"); return
    }

    setSubmitting(true)
    try {
      const meRes = await fetch("/api/auth/me")
      const meData = await meRes.json()
      if (!meRes.ok || !meData?.id) throw new Error("No se pudo obtener usuario autenticado")

      const isEditing = !!editingAusencia;
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/ausencias/${editingAusencia.AU_IDAUSENCIA_PK}` : "/api/ausencias";

      let res;
      if (isEditing) {
        // Para editar, usamos JSON para simplicidad (o FormData según soporte API)
        res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_tipo_ausencia: parseInt(formData.tipoAusencia),
            fecha_inicio: formData.fechaInicio,
            fecha_fin: formData.fechaFin,
            descripcion: formData.descripcion
          })
        });
      } else {
        const fd = new FormData()
        fd.append("id_colaborador", colaboradorId)
        fd.append("id_tipo_ausencia", formData.tipoAusencia)
        fd.append("fecha_inicio", formData.fechaInicio)
        fd.append("fecha_fin", formData.fechaFin)
        fd.append("descripcion", formData.descripcion)
        fd.append("id_usuario_registro", meData.id.toString())
        archivos.forEach(f => fd.append("archivos", f))
        res = await fetch(url, { method, body: fd });
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Error al procesar")
      }

      toast.success(isEditing ? "Ausencia actualizada" : "Ausencia registrada correctamente")
      handleResetForm();
      fetchHistorial()
      fetchStats()
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la ausencia")
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetForm = () => {
    setFormData({ tipoAusencia: "", fechaInicio: "", fechaFin: "", descripcion: "" })
    setColaboradorId("")
    setArchivos([])
    setEditingAusencia(null)
  }

  const calcularDias = () => {
    if (!formData.fechaInicio || !formData.fechaFin) return 0
    const inicio = new Date(formData.fechaInicio)
    const fin = new Date(formData.fechaFin)
    return Math.max(0, Math.ceil((fin.getTime() - inicio.getTime()) / 86400000) + 1)
  }

  // ── Drag & drop ──
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false)
    if (e.dataTransfer.files) setArchivos(p => [...p, ...Array.from(e.dataTransfer.files)])
  }

  // ── Editar/Eliminar ──
  const openEdit = (a: Ausencia) => {
    setEditingAusencia(a)
    setColaboradorId(a.US_IDUSUARIO_FK.toString())
    setFormData({
      tipoAusencia: a.TA_IDTIPO_AUSENCIA_FK.toString(),
      fechaInicio: a.AU_FECHA_INICIO.split('T')[0],
      fechaFin: a.AU_FECHA_FIN.split('T')[0],
      descripcion: a.AU_DESCRIPCION
    })
    // Hacer scroll arriba al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta ausencia?")) return;
    try {
      const res = await fetch(`/api/ausencias/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar");
      }
      toast.success("Ausencia eliminada");
      fetchHistorial();
      fetchStats();
    } catch (err: any) {
      toast.error(err.message);
    }
  }


  // ── TanStack Table: filtrado por tipo ──
  const filteredAusencias = useMemo(() => {
    let data = ausencias
    if (tipoFilter !== "all") data = data.filter(a => a.nombre_tipo_ausencia === tipoFilter)
    return data
  }, [ausencias, tipoFilter])

  // ── TanStack Table: columnas ──
  const columns = useMemo<ColumnDef<Ausencia>[]>(() => [
    {
      accessorKey: "nombre_colaborador",
      header: ({ column }) => (
        <button className="flex items-center gap-1 font-medium hover:text-slate-900" onClick={() => column.toggleSorting()}>
          Colaborador <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-800">{row.original.nombre_colaborador} {row.original.apellido_colaborador}</p>
          <p className="text-xs text-slate-500">{row.original.nombre_departamento || "—"}</p>
        </div>
      ),
    },
    {
      accessorKey: "nombre_tipo_ausencia",
      header: "Tipo",
      cell: ({ getValue }) => {
        const tipo = getValue<string>()
        return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTipoBadgeClass(tipo)}`}>{tipo}</span>
      },
    },
    {
      accessorKey: "AU_FECHA_INICIO",
      header: ({ column }) => (
        <button className="flex items-center gap-1 font-medium hover:text-slate-900" onClick={() => column.toggleSorting()}>
          Inicio <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ getValue }) => <span className="text-sm">{formatFecha(getValue<string>())}</span>,
    },
    {
      accessorKey: "AU_FECHA_FIN",
      header: "Fin",
      cell: ({ getValue }) => <span className="text-sm">{formatFecha(getValue<string>())}</span>,
    },
    {
      accessorKey: "AU_DIAS_AUSENCIA",
      header: "Días",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
          {getValue<number>()}
        </span>
      ),
    },
    {
      id: "acciones",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row.original)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.original.AU_IDAUSENCIA_PK)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: filteredAusencias,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  })

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HEADER ── */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/inicio">
              <Button variant="ghost" size="sm" className="rounded-full text-slate-600">
                <ArrowLeft className="w-4 h-4 mr-1" /><Home className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Gestión de Ausencias</h1>
              <p className="text-xs text-slate-500">Registro, historial y análisis</p>
            </div>
          </div>

          {/* Tab switcher tipo pills */}
          <div className="flex items-center bg-slate-100 rounded-full p-1 gap-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === "dashboard"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("gestion")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === "gestion"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <ClipboardList className="w-4 h-4" />
              Gestión
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeTab === "config"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              <Settings2 className="w-4 h-4" />
              Tipos de Ausencia
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          TAB: DASHBOARD
      ══════════════════════════════════════ */}
      {activeTab === "dashboard" && (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
          {/* Stats cards */}
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-28 animate-pulse bg-slate-200 rounded-3xl" />)}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50 rounded-3xl p-5 flex items-center gap-4 border border-emerald-100 hover:shadow-md transition-shadow">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CalendarDays className="w-6 h-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Total Ausencias</p>
                  <p className="text-3xl font-bold text-emerald-800">{stats.totalAusencias}</p>
                </div>
              </div>
              <div className="bg-blue-50 rounded-3xl p-5 flex items-center gap-4 border border-blue-100 hover:shadow-md transition-shadow">
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Este Mes</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.ausenciasEsteMes}</p>
                </div>
              </div>
              <div className="bg-amber-50 rounded-3xl p-5 flex items-center gap-4 border border-amber-100 hover:shadow-md transition-shadow">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Users className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Colaboradores</p>
                  <p className="text-3xl font-bold text-amber-800">{stats.colaboradoresAfectados}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Charts: 2 columnas */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Barras por tipo */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-full">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Ausencias por Tipo</h3>
                    <p className="text-xs text-slate-500">Cantidad registrada por categoría</p>
                  </div>
                </div>
                {stats.tiposAusencia.length > 0 ? (
                  <ShadcnLiteBarChart
                    height={260}
                    data={stats.tiposAusencia.map((t, i) => ({
                      label: t.nombre.length > 12 ? t.nombre.slice(0, 12) + "…" : t.nombre,
                      value: t.cantidad,
                      color: Object.values(TIPO_COLORS)[i % Object.values(TIPO_COLORS).length],
                    }))}
                  />
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">
                    Sin datos aún
                  </div>
                )}
              </div>

              {/* Tendencia mensual */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-50 rounded-full">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Tendencia Mensual</h3>
                    <p className="text-xs text-slate-500">Últimos 12 meses</p>
                  </div>
                </div>
                {stats.tendenciaMensual.length > 0 ? (
                  <ShadcnLiteBarChart
                    height={260}
                    data={stats.tendenciaMensual.slice().reverse().map(t => ({
                      label: t.mes.slice(5),
                      value: t.cantidad,
                      color: "#8b5cf6",
                    }))}
                  />
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">
                    Sin datos aún
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Leyenda de tipos */}
          {stats && stats.tiposAusencia.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">Distribución por tipo</h3>
              <div className="flex flex-wrap gap-3">
                {stats.tiposAusencia.map((t, i) => (
                  <div key={t.nombre} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: Object.values(TIPO_COLORS)[i % 8] }} />
                    <span className="text-xs text-slate-600">{t.nombre}</span>
                    <span className="text-xs font-bold text-slate-800">{t.cantidad}</span>
                    <span className="text-xs text-slate-400">({t.porcentaje}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: GESTIÓN (Registro + Historial)
      ══════════════════════════════════════ */}
      {activeTab === "gestion" && (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Split layout: izquierda Registro, derecha Tabla */}
          <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6 items-start">

            {/* ── PANEL IZQUIERDO: Registro ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-full">
                  <Plus className="w-4 h-4 text-[#0b57d0]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    {editingAusencia ? "Editar Ausencia" : "Registrar Ausencia"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingAusencia ? `Editando registro #${editingAusencia.AU_IDAUSENCIA_PK}` : "Complete el formulario"}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Colaborador */}
                <div className={cn("space-y-1.5", editingAusencia && "opacity-80 pointer-events-none")}>
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Colaborador *</Label>
                  <UniversalSelect
                    value={colaboradorId}
                    onValueChange={setColaboradorId}
                    options={colaboradores.map(c => ({
                      name: `${c.nombre || c.first_name} ${c.apellido || c.last_name}`,
                      code: c.cedula || c.id.toString(),
                      id: c.id
                    }))}
                    placeholder="Seleccionar colaborador..."
                  />
                  {editingAusencia && (
                    <p className="text-[10px] text-amber-600 font-medium font-inter">No se puede cambiar el colaborador al editar</p>
                  )}
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tipo de Ausencia *</Label>
                  <Select
                    value={formData.tipoAusencia}
                    onValueChange={v => setFormData(p => ({ ...p, tipoAusencia: v }))}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar tipo…" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposAusencias.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()}>{t.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Inicio *</Label>
                    <Input
                      type="date"
                      value={formData.fechaInicio}
                      onChange={e => setFormData(p => ({ ...p, fechaInicio: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Fin *</Label>
                    <Input
                      type="date"
                      value={formData.fechaFin}
                      onChange={e => setFormData(p => ({ ...p, fechaFin: e.target.value }))}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Duración chip */}
                {formData.fechaInicio && formData.fechaFin && calcularDias() > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                    <p className="text-sm text-blue-800">
                      <strong>{calcularDias()}</strong> día(s) de ausencia
                    </p>
                  </div>
                )}

                {/* Descripción */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Descripción</Label>
                  <Textarea
                    placeholder="Detalles de la ausencia…"
                    value={formData.descripcion}
                    onChange={e => setFormData(p => ({ ...p, descripcion: e.target.value }))}
                    rows={3}
                    className="rounded-xl resize-none"
                  />
                </div>

                {/* Drag & drop archivos */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Archivos de Soporte</Label>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors ${dragActive ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs text-slate-500 mb-2">Arrastra archivos o haz clic</p>
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={e => { if (e.target.files) setArchivos(p => [...p, ...Array.from(e.target.files!)]) }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("file-input")?.click()}
                      className="text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Seleccionar
                    </button>
                    <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (máx. 10 MB)</p>
                  </div>

                  {archivos.length > 0 && (
                    <div className="space-y-1">
                      {archivos.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-700 truncate max-w-[180px]">{f.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setArchivos(p => p.filter((_, j) => j !== i))}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones */}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full"
                    onClick={handleResetForm}
                  >
                    {editingAusencia ? "Cancelar" : "Limpiar"}
                  </Button>
                  <button
                    type="submit"
                    disabled={submitting || !colaboradorId}
                    className={`flex-1 ${editingAusencia ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#0b57d0] hover:bg-[#0842a0]'} disabled:opacity-50 text-white text-sm font-medium rounded-full px-4 py-2 transition-colors shadow-sm`}
                  >
                    {submitting ? "Procesando…" : (editingAusencia ? "Guardar" : "Registrar")}
                  </button>
                </div>
              </form>
            </div>

            {/* ── PANEL DERECHO: Historial con TanStack Table ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-full">
                      <ClipboardList className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Historial de Ausencias</h2>
                      <p className="text-xs text-slate-500">{filteredAusencias.length} registros encontrados</p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportAusenciasToExcel(filteredAusencias, `ausencias_${new Date().toISOString().split("T")[0]}`)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar
                  </button>
                </div>

                {/* Filtros en línea */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      placeholder="Buscar colaborador…"
                      value={globalFilter}
                      onChange={e => setGlobalFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-slate-50"
                    />
                  </div>
                  <Select value={tipoFilter} onValueChange={setTipoFilter}>
                    <SelectTrigger className="w-full sm:w-44 rounded-full text-sm">
                      <SelectValue placeholder="Tipo de ausencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      {tiposAusencias.map(t => (
                        <SelectItem key={t.id} value={t.nombre}>{t.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tabla */}
              <div className="overflow-x-auto">
                {historialLoading ? (
                  <div className="p-8 space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 animate-pulse bg-slate-100 rounded-xl" />)}
                  </div>
                ) : table.getRowModel().rows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <CalendarDays className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">No hay ausencias registradas</p>
                    <p className="text-xs mt-1">Usa el formulario para registrar la primera</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[600px] text-sm">
                    <thead>
                      {table.getHeaderGroups().map(hg => (
                        <tr key={hg.id} className="bg-slate-50 border-b border-slate-100">
                          {hg.headers.map(h => (
                            <th key={h.id} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Paginación */}
              {!historialLoading && table.getRowModel().rows.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="p-1.5 rounded-full border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="p-1.5 rounded-full border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: CONFIGURACIÓN (Tipos de Ausencia)
      ══════════════════════════════════════ */}
      {activeTab === "config" && (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          <TipoAusenciaPanel />
        </div>
      )}
    </div>
  )
}