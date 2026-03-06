'use client'

import { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    SortingState,
    ColumnDef
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { UniversalSelect } from "@/components/ui/universal-select";
import { toast } from "sonner";
import { generarLiquidacionQuincenal, getLiquidaciones, aprobarNominaPeriodo, eliminarLiquidacion, eliminarNominaPeriodo } from "@/actions/nomina";
import { FileText, Play, Loader2, CheckCircle, Lock, Trash2, Users, Download } from "lucide-react";
import Link from 'next/link';
import * as XLSX from 'xlsx';

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const formatCurrency = (n: number | string) => {
    const parts = Number(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${parts.join(',')}`;
};

interface Liquidacion {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    account_number?: string;
    bank_name?: string;
    cargo_nombre: string;
    total_devengado: number;
    total_deducciones: number;
    neto_pagar: number;
    estado: string;
}

export function LiquidacionesClient({
    initialData,
    initialTotal = 0,
    initialMes = (new Date().getMonth() + 1).toString(),
    initialAnio = new Date().getFullYear().toString(),
    initialQuincena = '1'
}: {
    initialData: Liquidacion[],
    initialTotal?: number,
    initialMes?: string,
    initialAnio?: string,
    initialQuincena?: string
}) {
    const [mes, setMes] = useState(initialMes);
    const [anio, setAnio] = useState(initialAnio);
    const [quincena, setQuincena] = useState(initialQuincena || '1');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Liquidacion[]>(initialData);
    const [totalEmployees, setTotalEmployees] = useState(initialTotal);

    // Table state
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState("");

    const fetchData = async (m: string, a: string, q: string) => {
        setLoading(true);
        try {
            const res = await getLiquidaciones(parseInt(m), parseInt(a), parseInt(q));
            if (res.success && res.data) {
                setData(res.data.rows);
                setTotalEmployees(res.data.totalEmployees);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(mes, anio, quincena);
    }, [mes, anio, quincena]);

    const handleGenerar = async () => {
        setLoading(true);
        try {
            const res = await generarLiquidacionQuincenal(parseInt(mes), parseInt(anio), parseInt(quincena));
            if (res.success) {
                toast.success(res.message);
                await fetchData(mes, anio, quincena);
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message || "Error al procesar");
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async () => {
        const periodStr = `PERIODO ${MESES[parseInt(mes) - 1].toUpperCase()}, ${quincena === '1' ? 'PRIMERA' : 'SEGUNDA'} QUINCENA`;
        if (!confirm(`¿Está seguro de aprobar el ${periodStr}?`)) return;

        setLoading(true);
        try {
            const res = await aprobarNominaPeriodo(parseInt(mes), parseInt(anio), parseInt(quincena));
            if (res.success) {
                toast.success(res.message);
                await fetchData(mes, anio, quincena);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error("Error al aprobar");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteIndividual = async (id: number) => {
        if (!confirm("¿Desea eliminar esta liquidación individual?")) return;
        try {
            const res = await eliminarLiquidacion(id);
            if (res.success) {
                toast.success(res.message);
                await fetchData(mes, anio, quincena);
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("Error al eliminar");
        }
    };

    const handleDeleteAll = async () => {
        if (!confirm("¿Desea eliminar TODAS las liquidaciones (borradores) de este periodo?")) return;
        setLoading(true);
        try {
            const res = await eliminarNominaPeriodo(parseInt(mes), parseInt(anio), parseInt(quincena));
            if (res.success) {
                toast.success(res.message);
                await fetchData(mes, anio, quincena);
            } else {
                toast.error(res.message);
            }
        } catch (e) {
            toast.error("Error al eliminar periodo");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExcel = () => {
        if (!data || data.length === 0) {
            toast.error("No hay datos para exportar");
            return;
        }

        const exportData = data.map(d => ({
            "Empleado": `${d.last_name} ${d.first_name}`.trim(),
            "Documento": d.document_number,
            "Banco": d.bank_name || 'No registrado',
            "No. Cuenta": d.account_number || 'No registrado',
            "Neto a Pagar": formatCurrency(d.neto_pagar)
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Liquidaciones");

        ws['!cols'] = [
            { wch: 35 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 }
        ];

        XLSX.writeFile(wb, `Liquidaciones_${MESES[parseInt(mes) - 1]}_Q${quincena}_${anio}.xlsx`);
    };

    const isPeriodoAprobado = data.length > 0 && data.every(d => d.estado === 'Aprobado');

    const columns: ColumnDef<Liquidacion>[] = [
        {
            accessorKey: "first_name",
            header: "Empleado",
            cell: ({ row }) => (
                <div className="py-1">
                    <div className="font-medium text-slate-900 leading-tight">
                        {row.original.last_name} {row.original.first_name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono italic">
                        {row.original.document_number}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "cargo_nombre",
            header: "Cargo",
            cell: ({ row }) => <div className="text-xs font-semibold text-slate-600 uppercase tracking-tight">{row.getValue("cargo_nombre")}</div>,
        },
        {
            accessorKey: "total_devengado",
            header: "Devengos",
            cell: ({ row }) => (
                <div className="text-xs text-green-700 font-medium">
                    {formatCurrency(row.getValue("total_devengado"))}
                </div>
            ),
        },
        {
            accessorKey: "total_deducciones",
            header: "Deducciones",
            cell: ({ row }) => (
                <div className="text-xs text-red-600 font-medium tracking-tight">
                    -{formatCurrency(row.getValue("total_deducciones")).replace('$ ', '$')}
                </div>
            ),
        },
        {
            accessorKey: "neto_pagar",
            header: "Neto Pagar",
            cell: ({ row }) => (
                <div className="text-sm font-bold text-slate-900 italic font-mono">
                    {formatCurrency(row.getValue("neto_pagar"))}
                </div>
            ),
        },
        {
            accessorKey: "estado",
            header: "Estado",
            cell: ({ row }) => {
                const estado = row.getValue("estado") as string;
                return (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${estado === 'Aprobado'
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>
                        {estado}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600 hover:bg-indigo-50" asChild title="Ver Volante">
                        <Link href={`/inicio/nomina/liquidaciones/${row.original.id}`}>
                            <FileText className="h-4 w-4" />
                        </Link>
                    </Button>
                    {!isPeriodoAprobado && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                            onClick={() => handleDeleteIndividual(row.original.id)}
                            title="Eliminar liquidación"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Barra de controles en 2 filas y 2 columnas con diseño cuadrado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-sm border border-slate-200 shadow-sm">

                {/* Fila 1, Col 1: Selectores de Mes y Año */}
                <div className="flex items-center gap-2">
                    <UniversalSelect
                        className="w-[140px] h-10 text-xs font-medium"
                        value={mes}
                        onValueChange={setMes}
                        options={["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((m, i) => ({
                            name: m,
                            code: (i + 1).toString()
                        }))}
                        placeholder="Mes"
                    />
                    <UniversalSelect
                        className="w-[100px] h-10 text-xs font-medium"
                        value={anio}
                        onValueChange={setAnio}
                        options={[{ name: "2025", code: "2025" }, { name: "2026", code: "2026" }]}
                        placeholder="Año"
                    />
                </div>

                {/* Fila 1, Col 2: Quincena y Acciones */}
                <div className="flex items-center justify-start md:justify-end gap-2">
                    <UniversalSelect
                        className="w-[160px] h-10 text-xs font-medium"
                        value={quincena}
                        onValueChange={setQuincena}
                        options={[{ name: "1ra Quincena", code: "1" }, { name: "2da Quincena", code: "2" }]}
                        placeholder="Quincena"
                    />
                    <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />
                    <Button
                        onClick={handleGenerar}
                        disabled={loading || isPeriodoAprobado}
                        size="sm"
                        className={`h-10 px-5 text-xs font-bold gap-2 rounded-sm transition-all ${isPeriodoAprobado ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'}`}
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (isPeriodoAprobado ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4" />)}
                        {isPeriodoAprobado ? "Periodo Cerrado" : "Cerrar Quincena y Procesar"}
                    </Button>

                    {!isPeriodoAprobado && data.length > 0 && (
                        <Button
                            onClick={handleDeleteAll}
                            disabled={loading}
                            variant="ghost"
                            size="sm"
                            className="h-10 text-xs text-rose-500 hover:bg-rose-50 font-bold gap-2 px-4 rounded-sm"
                        >
                            <Trash2 className="h-4 w-4" />
                            Vaciar
                        </Button>
                    )}
                </div>

                {/* Fila 2, Col 1: Buscador */}
                <div className="relative">
                    <Input
                        placeholder="Buscar empleado o documento..."
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="h-11 text-sm pl-10 bg-slate-50 border-slate-100 focus:bg-white focus:border-indigo-300 transition-all rounded-sm shadow-none"
                    />
                    <Users className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                {/* Fila 2, Col 2: Estatus y Aprobación Final */}
                <div className="flex items-center justify-start md:justify-end gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-sky-50 rounded-sm border border-sky-100">
                        <div className="h-2 w-2 rounded-sm bg-sky-500 animate-pulse" />
                        <span className="text-[12px] font-bold text-sky-700">
                            {data.length} de {totalEmployees} Procesados
                        </span>
                    </div>

                    {data.length > 0 && (
                        <Button
                            variant="outline"
                            className="h-11 px-4 text-xs font-bold border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-sm gap-2 rounded-sm transition-all"
                            onClick={handleDownloadExcel}
                            disabled={loading}
                        >
                            <Download className="h-4 w-4" />
                            Excel
                        </Button>
                    )}

                    {data.length > 0 && !isPeriodoAprobado && (
                        <Button
                            className="h-11 px-6 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm gap-2 rounded-sm transition-all"
                            onClick={handleAprobar}
                            disabled={loading}
                        >
                            <CheckCircle className="h-4 w-4" />
                            Aprobar Nómina
                        </Button>
                    )}
                </div>
            </div>

            {isPeriodoAprobado && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-3 text-amber-800 animate-in fade-in slide-in-from-top-1">
                    <Lock className="h-4 w-4" />
                    <p className="text-[11px] font-medium italic">Este periodo ha sido **aprobado y bloqueado**. No se permiten modificaciones.</p>
                </div>
            )}

            <div className="bg-white rounded-sm shadow-sm overflow-hidden border-none">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                        {header.isPlaceholder
                                            ? null
                                            : (
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort() ? 'cursor-pointer select-none flex items-center gap-1' : '',
                                                        onClick: header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getIsSorted() && (
                                                        <span className="text-indigo-500">{header.column.getIsSorted() === 'asc' ? '↑' : '↓'}</span>
                                                    )}
                                                </div>
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500 text-xs">
                                    No se encontraron liquidaciones para mostrar.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="p-3 px-4">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
