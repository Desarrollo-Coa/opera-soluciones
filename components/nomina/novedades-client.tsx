'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UniversalSelect } from "@/components/ui/universal-select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";
import { getNovedades, crearNovedad, eliminarNovedad, editarNovedad, getConceptos, isPeriodoAprobadoAction } from "@/actions/nomina";
import { getEmployeesSimple } from "@/actions/employees-actions";
import { Plus, Trash2, Loader2, Info, Lock, Pencil, Check, X } from "lucide-react";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const formatCurrency = (n: number | string) => {
    const parts = Number(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${parts.join(',')}`;
};

interface Novedad {
    id: number;
    first_name: string;
    last_name: string;
    concepto_nombre: string;
    concepto_codigo: string;
    valor_total: number;
    tipo: string;
    observaciones: string;
    document_number?: string;
    quincena: number | null;
    id_usuario: number;
}

interface NovedadesClientProps {
    initialNovedades: Novedad[];
    empleados: any[];
    conceptos: any[];
    isBloqueado: boolean;
    initialMes?: string;
    initialAnio?: string;
    initialQuincena?: string;
}

export function NovedadesClient({
    initialNovedades,
    empleados,
    conceptos,
    isBloqueado: initialIsBloqueado,
    initialMes = (new Date().getMonth() + 1).toString(),
    initialAnio = new Date().getFullYear().toString(),
    initialQuincena = '1'
}: NovedadesClientProps) {
    const [mes, setMes] = useState(initialMes);
    const [anio, setAnio] = useState(initialAnio);
    const [quincena, setQuincena] = useState(initialQuincena);
    const [loading, setLoading] = useState(false);
    const [isBloqueado, setIsBloqueado] = useState(initialIsBloqueado);
    const [novedades, setNovedades] = useState<Novedad[]>(initialNovedades);

    // Form State
    const [selectedEmp, setSelectedEmp] = useState('');
    const [selectedConcepto, setSelectedConcepto] = useState('');
    const [valor, setValor] = useState('');
    const [obs, setObs] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValor, setEditValor] = useState('');
    const [editObs, setEditObs] = useState('');

    const refreshNovedades = async () => {
        setLoading(true);
        try {
            const m = parseInt(mes);
            const a = parseInt(anio);
            const q = parseInt(quincena);
            const [resNovedades, resStatus] = await Promise.all([
                getNovedades(m, a, q),
                isPeriodoAprobadoAction(m, a, q)
            ]);

            if (resNovedades.success) setNovedades(resNovedades.data || []);
            setIsBloqueado(resStatus);
        } finally {
            setLoading(false);
        }
    };

    // Mejor obtener el estado de bloqueo directamente al cambiar periodo
    const checkStatus = async (m: string, a: string) => {
        // Importaríamos isPeriodoAprobadoAction pero es server side. 
        // En client component, necesitamos llamar a la acción.
    };

    useEffect(() => {
        refreshNovedades();
    }, [mes, anio, quincena]);

    const handleSave = async () => {
        if (!selectedEmp || !selectedConcepto || !valor) {
            toast.error("Complete los campos obligatorios");
            return;
        }

        setLoading(true);
        try {
            if (editingId) {
                // Modo Edición
                const res = await editarNovedad(editingId, parseFloat(valor), obs);
                if (res.success) {
                    toast.success("Novedad actualizada");
                    setEditingId(null);
                    setSelectedEmp('');
                    setSelectedConcepto('');
                    setValor('');
                    setObs('');
                    await refreshNovedades();
                } else {
                    toast.error(res.message);
                }
            } else {
                // Modo Creación
                const res = await crearNovedad({
                    empleado_id: parseInt(selectedEmp),
                    concepto_codigo: selectedConcepto,
                    periodo_mes: parseInt(mes),
                    periodo_anio: parseInt(anio),
                    quincena: parseInt(quincena),
                    valor_total: parseFloat(valor),
                    observaciones: obs
                });

                if (res.success) {
                    toast.success(res.message);
                    setSelectedEmp('');
                    setSelectedConcepto('');
                    setValor('');
                    setObs('');
                    await refreshNovedades();
                } else {
                    toast.error(res.message);
                }
            }
        } catch (error) {
            toast.error("Error al procesar la operación");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta novedad?")) return;

        try {
            const res = await eliminarNovedad(id);
            if (res.success) {
                toast.success(res.message);
                await refreshNovedades();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const handlePrepareEdit = (n: Novedad) => {
        setEditingId(n.id);
        const emp = empleados.find(e => e.id === n.id_usuario); // Asumiendo que tenemos id_usuario o buscamos por nombre
        // Nota: El UniversalSelect espera el 'code'. 
        // Como el UniversalSelect de empleados usa document_number o id como code
        setSelectedEmp(n.document_number || String(n.id_usuario || ''));
        setSelectedConcepto(n.concepto_codigo);
        setValor(String(n.valor_total));
        setObs(n.observaciones || '');

        // Scroll al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setSelectedEmp('');
        setSelectedConcepto('');
        setValor('');
        setObs('');
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
                {/* Selector de Periodo */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Periodo de Registro</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Mes de Aplicación</Label>
                            <UniversalSelect
                                value={mes}
                                onValueChange={setMes}
                                options={["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => ({
                                    name: m,
                                    code: (i + 1).toString()
                                }))}
                                placeholder="Seleccione mes"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Año</Label>
                            <UniversalSelect
                                value={anio}
                                onValueChange={setAnio}
                                options={[
                                    { name: "2025", code: "2025" },
                                    { name: "2026", code: "2026" }
                                ]}
                                placeholder="Seleccione año"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Quincena</Label>
                            <UniversalSelect
                                value={quincena}
                                onValueChange={setQuincena}
                                options={[
                                    { name: "1ra Quincena", code: "1" },
                                    { name: "2da Quincena", code: "2" }
                                ]}
                                placeholder="Seleccione quincena"
                            />
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg flex gap-3 text-blue-700 text-sm">
                            <Info className="h-5 w-5 shrink-0" />
                            <p>Las novedades registradas se incluirán automáticamente en la siguiente liquidación del periodo seleccionado.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Formulario de Adición */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg text-indigo-700">Registrar Nueva Novedad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Empleado</Label>
                                <UniversalSelect
                                    value={selectedEmp}
                                    onValueChange={setSelectedEmp}
                                    options={empleados.map(e => ({
                                        name: `${e.last_name} ${e.first_name}`,
                                        code: e.document_number || e.id.toString(),
                                        id: e.id
                                    }))}
                                    placeholder="Buscar trabajador..."
                                    searchPlaceholder="Escriba nombre, apellido o documento..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Concepto</Label>
                                <UniversalSelect
                                    value={selectedConcepto}
                                    onValueChange={setSelectedConcepto}
                                    options={conceptos.filter(c => c.es_novedad).map(c => ({
                                        name: c.nombre,
                                        code: c.codigo
                                    }))}
                                    placeholder="Seleccione concepto..."
                                    searchPlaceholder="Buscar concepto..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-1">
                                <Label>Valor ($)</Label>
                                <CurrencyInput
                                    id="valor"
                                    placeholder="0"
                                    value={valor}
                                    onChange={(val) => setValor(val)}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Observaciones (Opcional)</Label>
                                <Input
                                    placeholder="Ej: Bono por cumplimiento meta ventas"
                                    value={obs}
                                    onChange={(e) => setObs(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleSave}
                                disabled={loading || isBloqueado}
                                className={`flex-1 gap-2 ${isBloqueado ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (isBloqueado ? <Lock className="h-4 w-4" /> : (editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />))}
                                {isBloqueado ? "Periodo Cerrado" : (editingId ? "Actualizar Novedad" : "Agregar Novedad al Periodo")}
                            </Button>

                            {editingId && (
                                <Button variant="outline" onClick={handleCancelEdit} disabled={loading}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isBloqueado && (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center gap-3 text-amber-800">
                    <Lock className="h-5 w-5" />
                    <p className="text-sm font-medium">Este periodo ya ha sido **aprobado**. No se pueden agregar o eliminar novedades.</p>
                </div>
            )}

            {/* Listado de Novedades del Periodo */}
            <Card>
                <CardHeader>
                    <CardTitle className="uppercase">
                        Novedades {MESES[parseInt(mes) - 1]}, {quincena === '1' ? 'Primera' : 'Segunda'} Quincena
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Colaborador</TableHead>
                                <TableHead>Concepto</TableHead>
                                <TableHead>Periodo</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead>Observaciones</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {novedades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No hay novedades registradas para este periodo.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                novedades.map((n) => (
                                    <TableRow key={n.id}>
                                        <TableCell className="font-medium">{n.last_name} {n.first_name}</TableCell>
                                        <TableCell>{n.concepto_nombre}</TableCell>
                                        <TableCell className="text-[10px] font-semibold text-muted-foreground uppercase">Q{n.quincena || '—'}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${n.tipo === 'Devengo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {n.tipo}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-bold italic">
                                            {n.tipo === 'Devengo' ? '+' : '-'} {formatCurrency(n.valor_total).replace('$ ', '$')}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {n.observaciones}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className={`h-7 w-7 ${editingId === n.id ? 'text-indigo-600 bg-indigo-50' : 'text-blue-500 hover:bg-blue-50'} disabled:opacity-30`}
                                                    disabled={isBloqueado}
                                                    onClick={() => handlePrepareEdit(n)}
                                                    title="Editar novedad"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost" size="icon"
                                                    className="h-7 w-7 text-red-500 hover:bg-red-50 disabled:opacity-30"
                                                    onClick={() => handleDelete(n.id)}
                                                    disabled={isBloqueado || editingId === n.id}
                                                    title="Eliminar novedad"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
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
    );
}
