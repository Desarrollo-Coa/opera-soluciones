'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UniversalSelect } from "@/components/ui/universal-select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { toast } from "sonner";
import { Banknote, Calendar, Plus, Info, Loader2, ListOrdered, User, Eye, ArrowRight, Wallet2, Lock } from "lucide-react";
import { crearPrestamoAction, getPrestamosActivosAction, getCuotasPrestamoAction } from "@/actions/nomina/prestamos-actions";
import { getGlobalLockedPeriodsAction } from "@/actions/nomina/liquidacion-actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn, isDateInPeriod } from "@/lib/utils";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const formatCurrency = (n: number | string) => {
    const parts = Number(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${parts.join(',')}`;
};

interface Prestamo {
    PR_IDPRESTAMO_PK: number;
    US_IDUSUARIO_FK: number;
    first_name: string;
    last_name: string;
    PR_MONTO_SOLICITADO: number;
    PR_TASA_INTERES_MENSUAL: number;
    PR_NUMERO_CUOTAS: number;
    PR_TOTAL_A_PAGAR: number;
    PR_SALDO_PENDIENTE: number;
    PR_FECHA_DESEMBOLSO: string;
    PR_MOTIVO: string;
    cuotas_pagadas: number;
}

interface Cuota {
    PC_IDCUOTA_PK: number;
    PC_NUMERO_CUOTA: number;
    PC_VALOR_CUOTA: number;
    PC_PERIODO_MES: number;
    PC_PERIODO_ANIO: number;
    PC_QUINCENA: number;
    PC_ESTADO: string;
    PC_FECHA_ESTIMADA: string;
}

interface PrestamosClientProps {
    initialPrestamos: Prestamo[];
    employees: any[];
}

export function PrestamosClient({ initialPrestamos, employees }: PrestamosClientProps) {
    const [prestamos, setPrestamos] = useState<Prestamo[]>(initialPrestamos);
    const [loading, setLoading] = useState(false);

    // Form state
    const [selectedEmp, setSelectedEmp] = useState('');
    const [monto, setMonto] = useState('');
    const [tasa, setTasa] = useState('0');
    const [cuotas, setCuotas] = useState('1');
    const [mesInicio, setMesInicio] = useState((new Date().getMonth() + 1).toString());
    const [anioInicio, setAnioInicio] = useState(new Date().getFullYear().toString());
    const [quincenaInicio, setQuincenaInicio] = useState(new Date().getDate() <= 15 ? '1' : '2');
    const [motivo, setMotivo] = useState('');
    const [fechaDesembolso, setFechaDesembolso] = useState(new Date().toLocaleDateString('en-CA'));

    // Detail modal state
    const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null);
    const [cuotasDetalle, setCuotasDetalle] = useState<Cuota[]>([]);
    const [loadingCuotas, setLoadingCuotas] = useState(false);
    const [lockedPeriods, setLockedPeriods] = useState<any[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [preview, setPreview] = useState<{
        totalIntereses: number;
        totalAPagar: number;
        valorCuota: number;
        cuotas: any[];
    } | null>(null);

    useEffect(() => {
        if (!monto || !cuotas) {
            setPreview(null);
            return;
        }

        const montoPrincipal = parseFloat(monto) || 0;
        const tasaMensual = parseFloat(tasa) / 100 || 0;
        const numCuotas = parseInt(cuotas) || 0;

        if (montoPrincipal <= 0 || numCuotas <= 0) {
            setPreview(null);
            return;
        }

        const totalIntereses = montoPrincipal * tasaMensual * (numCuotas / 2);
        const totalAPagar = montoPrincipal + totalIntereses;
        const valorCuota = totalAPagar / numCuotas;

        const cuotasList = [];
        let curMes = parseInt(mesInicio);
        let curAnio = parseInt(anioInicio);
        let curQuincena = parseInt(quincenaInicio);

        for (let i = 1; i <= numCuotas; i++) {
            cuotasList.push({
                numero: i,
                valor: valorCuota,
                mes: curMes,
                anio: curAnio,
                quincena: curQuincena
            });

            if (curQuincena === 1) {
                curQuincena = 2;
            } else {
                curQuincena = 1;
                curMes++;
                if (curMes > 12) {
                    curMes = 1;
                    curAnio++;
                }
            }
        }

        setPreview({
            totalIntereses,
            totalAPagar,
            valorCuota,
            cuotas: cuotasList
        });
    }, [monto, tasa, cuotas, mesInicio, anioInicio, quincenaInicio]);

    useEffect(() => {
        getGlobalLockedPeriodsAction().then(res => {
            if (res.success && res.data) setLockedPeriods(res.data)
        })
    }, []);

    const isCurrentPeriodLocked = lockedPeriods.some(p =>
        p.anio === parseInt(anioInicio) &&
        p.mes === parseInt(mesInicio) &&
        p.quincena === parseInt(quincenaInicio)
    );

    const refreshPrestamos = async () => {
        const res = await getPrestamosActivosAction();
        if (res.success) setPrestamos(res.data || []);
    };


    const handleCreate = async () => {
        if (!selectedEmp || !monto || !cuotas || !fechaDesembolso) {
            toast.error("Complete los campos obligatorios");
            return;
        }

        // Validación de Fecha vs Periodo
        if (!isDateInPeriod(fechaDesembolso, anioInicio, mesInicio, quincenaInicio)) {
            const periodLabel = quincenaInicio === "1" ? "1ra Quincena (Día 1-15)" : `2da Quincena (Día 16-${new Date(parseInt(anioInicio), parseInt(mesInicio), 0).getDate()})`;
            toast.error(`La fecha del préstamo (${fechaDesembolso}) no corresponde al periodo de inicio: ${MESES[parseInt(mesInicio) - 1]} ${periodLabel}`);
            return;
        }

        setLoading(true);
        try {
            const res = await crearPrestamoAction({
                empleado_id: parseInt(selectedEmp),
                monto_solicitado: parseFloat(monto),
                tasa_interes: parseFloat(tasa),
                num_cuotas: parseInt(cuotas),
                periodo_inicio_mes: parseInt(mesInicio),
                periodo_inicio_anio: parseInt(anioInicio),
                quincena_inicio: parseInt(quincenaInicio),
                motivo,
                fecha_desembolso: fechaDesembolso
            });

            if (res.success) {
                toast.success(res.message);
                resetForm();
                setIsCreateModalOpen(false);
                await refreshPrestamos();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Error al crear el préstamo");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedEmp('');
        setMonto('');
        setTasa('0');
        setCuotas('1');
        setMotivo('');
    };

    const showDetails = async (p: Prestamo) => {
        setSelectedPrestamo(p);
        setLoadingCuotas(true);
        try {
            const res = await getCuotasPrestamoAction(p.PR_IDPRESTAMO_PK);
            if (res.success) setCuotasDetalle(res.data || []);
        } finally {
            setLoadingCuotas(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                        <Wallet2 className="h-8 w-8 text-indigo-600" />
                        Gestión de Préstamos
                    </h1>
                    <p className="text-muted-foreground">Administra créditos internos, tablas de amortización y cobros automáticos por nómina.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-[1.02] active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Préstamo
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* Listado de Préstamos Activos */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Préstamos en Curso</CardTitle>
                        <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                            {prestamos.length} ACTIVOS
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-semibold text-gray-700">Empleado</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Monto</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Progreso</TableHead>
                                        <TableHead className="font-semibold text-gray-700">Saldo Pendiente</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {prestamos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                                                No hay préstamos activos registrados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        prestamos.map((p) => (
                                            <TableRow key={p.PR_IDPRESTAMO_PK} className="hover:bg-slate-50/50">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 tracking-tight">{p.last_name} {p.first_name}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(p.PR_FECHA_DESEMBOLSO).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-gray-600 font-medium">
                                                    {formatCurrency(p.PR_MONTO_SOLICITADO)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 w-24">
                                                        <div className="flex justify-between text-[10px] font-bold text-indigo-700 uppercase">
                                                            <span>Cuotas</span>
                                                            <span>{p.cuotas_pagadas}/{p.PR_NUMERO_CUOTAS}</span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-600 transition-all duration-500"
                                                                style={{ width: `${(p.cuotas_pagadas / p.PR_NUMERO_CUOTAS) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-bold text-indigo-700 italic">
                                                    {formatCurrency(p.PR_SALDO_PENDIENTE)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2"
                                                        onClick={() => showDetails(p)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Ver Plan
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Detalle de Cuotas */}
            <Dialog open={!!selectedPrestamo} onOpenChange={(open) => !open && setSelectedPrestamo(null)}>
                <DialogContent className="max-w-3xl rounded-3xl overflow-hidden p-0 gap-0 border-none shadow-2xl">
                    <DialogTitle className="sr-only">Detalle del Préstamo</DialogTitle>
                    <DialogDescription className="sr-only">Plan de amortización detallado por quincenas.</DialogDescription>

                    <DialogHeader className="p-8 bg-indigo-900 text-white">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <ListOrdered className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Plan de Amortización</h2>
                                <p className="text-indigo-200">
                                    Detalle quincenal de cuotas para {selectedPrestamo?.first_name} {selectedPrestamo?.last_name}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="p-8 bg-white max-h-[60vh] overflow-y-auto">
                        {loadingCuotas ? (
                            <div className="flex flex-col items-center py-12 gap-3">
                                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                                <p className="text-muted-foreground font-medium">Cargando calendario de pagos...</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-gray-100">
                                        <TableHead className="font-bold">#</TableHead>
                                        <TableHead className="font-bold">Periodo</TableHead>
                                        <TableHead className="font-bold">Valor Cuota</TableHead>
                                        <TableHead className="font-bold text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cuotasDetalle.map((c) => (
                                        <TableRow key={c.PC_IDCUOTA_PK} className="group border-gray-50">
                                            <TableCell className="font-bold text-gray-400">
                                                {c.PC_NUMERO_CUOTA.toString().padStart(2, '0')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-mono text-[10px]">
                                                            Q{c.PC_QUINCENA}
                                                        </Badge>
                                                        <span className="text-sm font-semibold text-gray-700 capitalize">
                                                            {MESES[c.PC_PERIODO_MES - 1]} / {c.PC_PERIODO_ANIO}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5 ml-1">
                                                        Cobro estimado: {c.PC_FECHA_ESTIMADA ? new Date(c.PC_FECHA_ESTIMADA).toLocaleDateString() : '—'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-bold text-gray-900 font-mono">
                                                {formatCurrency(c.PC_VALOR_CUOTA)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    {lockedPeriods.some(lp => lp.anio === c.PC_PERIODO_ANIO && lp.mes === c.PC_PERIODO_MES && lp.quincena === c.PC_QUINCENA) && (
                                                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                                                    )}
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.PC_ESTADO === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                                                        c.PC_ESTADO === 'Procesado' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {c.PC_ESTADO}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    <div className="p-6 bg-slate-50 border-t flex justify-end">
                        <Button
                            variant="default"
                            className="bg-indigo-900 hover:bg-black rounded-xl px-8"
                            onClick={() => setSelectedPrestamo(null)}
                        >
                            Entendido
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Creación de Préstamo */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-6xl rounded-3xl overflow-hidden p-0 gap-0 border-none shadow-2xl flex flex-col md:flex-row h-[90vh] max-h-[850px]">
                    <DialogTitle className="sr-only">Nuevo Registro de Préstamo</DialogTitle>
                    <DialogDescription className="sr-only">Complete los datos para generar la tabla de amortización.</DialogDescription>

                    {/* Panel Izquierdo: Formulario */}
                    <div className="md:w-[60%] p-6 bg-white border-r border-slate-100 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center gap-3 mb-6 shrink-0">
                            <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nuevo Registro de Préstamo</h2>
                                <p className="text-[xs] text-slate-500">Complete los datos para generar la tabla de amortización.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto pr-3 custom-scrollbar flex-1 py-1">
                            <div className="space-y-4 md:col-span-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Información del Beneficiario</Label>
                                <UniversalSelect
                                    value={selectedEmp}
                                    onValueChange={setSelectedEmp}
                                    options={employees.map(e => ({
                                        name: `${e.last_name} ${e.first_name}`,
                                        code: e.id.toString()
                                    }))}
                                    placeholder="Seleccionar empleado..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Fecha Desembolso</Label>
                                <Input
                                    type="date"
                                    value={fechaDesembolso}
                                    onChange={(e) => setFechaDesembolso(e.target.value)}
                                    className={cn("h-11 rounded-xl", !isDateInPeriod(fechaDesembolso, anioInicio, mesInicio, quincenaInicio) ? "border-red-500 bg-red-50" : "")}
                                />
                                {!isDateInPeriod(fechaDesembolso, anioInicio, mesInicio, quincenaInicio) && fechaDesembolso && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase animate-pulse">Fecha fuera del periodo seleccionado</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Inicio de Cobro</Label>
                                    <Badge variant="outline" className="text-[9px] font-bold bg-indigo-50 border-indigo-100 text-indigo-600">Q{quincenaInicio} {MESES[parseInt(mesInicio) - 1]}</Badge>
                                </div>
                                <UniversalSelect
                                    value={quincenaInicio}
                                    onValueChange={setQuincenaInicio}
                                    options={[
                                        { name: "1ra Quincena", code: "1" },
                                        { name: "2da Quincena", code: "2" }
                                    ]}
                                    placeholder="Quincena..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Monto Principal ($)</Label>
                                <CurrencyInput
                                    value={monto}
                                    onChange={setMonto}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Tasa Mensual (%)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={tasa}
                                    onChange={(e) => setTasa(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Mes Inicio Cobro</Label>
                                <UniversalSelect
                                    value={mesInicio}
                                    onValueChange={setMesInicio}
                                    options={MESES.map((m, i) => ({ name: m, code: (i + 1).toString() }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Año Inicio Cobro</Label>
                                <Input
                                    value={anioInicio}
                                    onChange={(e) => setAnioInicio(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Núm. de Cuotas</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={cuotas}
                                    onChange={(e) => setCuotas(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-bold uppercase text-[10px] tracking-widest pl-1">Motivo / Descripción</Label>
                                <Input
                                    placeholder="Ej: Calamidad doméstica"
                                    value={motivo}
                                    onChange={(e) => setMotivo(e.target.value)}
                                    className="h-11 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="mt-4 pt-4 flex flex-col gap-3 bg-white border-t border-slate-50 shrink-0">
                            {isCurrentPeriodLocked && (
                                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900">
                                    <Lock className="h-4 w-4 text-amber-600" />
                                    <p className="text-[10px] font-bold uppercase">Periodo Bloqueado: {MESES[parseInt(mesInicio) - 1]} Q{quincenaInicio}</p>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="h-11 px-5 rounded-xl border-slate-200 text-slate-500 font-bold text-sm"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    className={cn("flex-1 h-11 shadow-lg rounded-xl font-bold transition-all text-sm", isCurrentPeriodLocked ? "bg-slate-300" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 hover:shadow-indigo-200")}
                                    disabled={loading || isCurrentPeriodLocked}
                                    onClick={handleCreate}
                                >
                                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Banknote className="h-4 w-4 mr-2" />}
                                    {isCurrentPeriodLocked ? "Bloqueado" : "Crear Préstamo"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecho: Plan de Pagos / Preview */}
                    <div className="md:w-[40%] bg-slate-50 p-6 flex flex-col h-full overflow-hidden">
                        <div className="flex items-center justify-between mb-6 shrink-0">
                            <h3 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest flex items-center gap-2">
                                <ListOrdered className="h-3.5 w-3.5 text-indigo-500" />
                                Proyección de Pagos
                            </h3>
                            {preview && (
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 border-none font-black px-2 py-0 h-5 text-[9px]">
                                    {preview.cuotas.length} CUOTAS
                                </Badge>
                            )}
                        </div>

                        {!preview ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl">
                                <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                                    <Calendar className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-400 font-bold text-sm uppercase tracking-tighter">Ingrese monto y cuotas</p>
                                <p className="text-slate-300 text-xs mt-1">Para visualizar el plan de amortización automático</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                                <div className="grid grid-cols-2 gap-3 shrink-0">
                                    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Intereses</p>
                                        <p className="font-black text-indigo-600 text-lg">{formatCurrency(preview.totalIntereses)}</p>
                                    </div>
                                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                                        <p className="text-[10px] text-indigo-100 font-bold uppercase mb-1 opacity-80">Valor Cuota (Q)</p>
                                        <p className="font-black text-xl">{formatCurrency(preview.valorCuota).replace('$ ', '$')}</p>
                                    </div>
                                    <div className="col-span-2 p-4 bg-white rounded-2xl shadow-sm border border-indigo-50 flex items-center justify-between">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">Monto Total a Recaudar</p>
                                        <span className="font-black text-slate-900 text-lg">{formatCurrency(preview.totalAPagar)}</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {preview.cuotas.map((c) => (
                                        <div key={c.numero} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    {c.numero.toString().padStart(2, '0')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-700 capitalize">{MESES[c.mes - 1]} / {c.anio}</span>
                                                    <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">Quincena {c.quincena}</span>
                                                </div>
                                            </div>
                                            <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(c.valor)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-4 bg-indigo-50 rounded-2xl flex gap-3 text-indigo-800 text-[10px] leading-tight shrink-0 border border-indigo-100">
                                    <Info className="h-4 w-4 shrink-0 text-indigo-500" />
                                    <p>Este plan es preliminar. Las fechas exactas de cobro se fijarán al momento de la liquidación de cada periodo.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
