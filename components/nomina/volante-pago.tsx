'use client'

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Download } from "lucide-react";
import React, { Suspense, lazy } from "react";
import { VolantePDF } from "./volante-pdf";

// Lazy loading PDF components instead of next/dynamic to avoid Turbopack issues
const PDFDownloadLink = lazy(() =>
    import("@react-pdf/renderer").then((mod) => ({ default: mod.PDFDownloadLink }))
);

interface VolanteDetalle {
    id: number;
    descripcion: string;
    cantidad: number;
    valor_unitario: number;
    valor_total: number;
    tipo: 'Devengo' | 'Deducción';
}

interface VolanteData {
    id: number;
    first_name: string;
    last_name: string;
    document_number: string;
    document_type: string; // CC, CE, etc.
    periodo_mes: number;
    periodo_anio: number;
    quincena: number;
    cargo_nombre: string;
    sueldo_mensual_base: number;
    dias_trabajados: number;
    dias_incapacidad: number;
    horas_mes?: number;
    work_schedule?: string;
    neto_pagar: number;
    total_devengado: number;
    total_deducciones: number;
    ibc_salud?: number;
    bank_name?: string;
    account_number?: string;
    account_type?: string;
    eps_id?: string;
    arl_id?: string;
    pension_fund_id?: string;
    fecha_liquidacion: string | Date;
    estado: string;
    detalles: VolanteDetalle[];
}

const fmt = (n: number | string) => {
    const parts = Number(n).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$ ${parts.join(',')}`;
};

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export function VolantePago({ data }: { data: VolanteData }) {
    const handlePrint = () => { window.print(); };

    const devengos = data.detalles.filter(d => d.tipo === 'Devengo');
    const deducciones = data.detalles.filter(d => d.tipo === 'Deducción');

    // Cálculo de valor hora
    const horasMes = data.horas_mes ?? 240;
    const valorHora = Math.round(Number(data.sueldo_mensual_base) / horasMes);
    const diasPagados = 30; // Colombia: mes comercial (cálculo)
    const diasRealesMes = new Date(data.periodo_anio, data.periodo_mes, 0).getDate(); // días reales del mes

    const tieneBanco = data.bank_name && data.bank_name.trim() !== '';

    const [isClient, setIsClient] = React.useState(false);
    React.useEffect(() => { setIsClient(true); }, []);

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            {/* Botones de acción — ocultos al imprimir */}
            <div className="flex justify-end gap-2 print:hidden">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    <Printer className="h-4 w-4" /> Imprimir
                </Button>

                {isClient && (
                    <Suspense fallback={<Button disabled size="sm" className="gap-2 bg-indigo-400"><Download className="h-4 w-4" /> Cargando...</Button>}>
                        <PDFDownloadLink
                            document={<VolantePDF data={data} />}
                            fileName={`Volante - ${data.first_name} ${data.last_name} - ${MESES[data.periodo_mes - 1].toUpperCase()} - ${data.quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA.pdf`}
                        >
                            {({ loading }) => (
                                <Button variant="default" size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                                    <Download className="h-4 w-4" /> {loading ? 'Generando...' : 'Descargar PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </Suspense>
                )}
            </div>

            {/* ===== VOLANTE ===== */}
            <div className="border border-gray-400 rounded-sm bg-white text-gray-900 text-sm font-sans print:border-black print:mx-auto">

                {/* ---- CABECERA EMPRESA ---- */}
                <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-gray-300 text-center">
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <img
                            src="/recursos/logopera.png"
                            alt="Opera Soluciones"
                            className="h-10 object-contain"
                        />
                        <h1 className="text-xl font-black uppercase tracking-wide leading-tight">OPERA SOLUCIONES S.A.S.</h1>
                    </div>
                    <p className="text-[10px] font-bold mt-1 text-gray-700 underline underline-offset-2">NIT: 901.714.147 &nbsp;|&nbsp; Barranquilla, Atlántico</p>
                    <div className="mt-3 space-y-0.5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-600">
                            COMPROBANTE DE NÓMINA — {MESES[data.periodo_mes - 1].toUpperCase()}, {data.quincena === 1 ? 'PRIMERA' : 'SEGUNDA'} QUINCENA
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium tracking-tighter">No. VP-{data.id.toString().padStart(5, '0')}</p>
                    </div>
                </div>

                {/* ---- DATOS EMPLEADO Y BANCARIOS (2 COLUMNAS) ---- */}
                <div className="grid grid-cols-5 border-b border-gray-300">
                    {/* Columna Izquierda: Datos Personales */}
                    <div className="col-span-3 px-4 py-3 border-r border-gray-300">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <Row label="NOMBRES Y APELLIDOS" value={`${data.first_name} ${data.last_name}`} bold />
                            <Row label="CARGO" value={data.cargo_nombre || '—'} bold />
                            <Row label={data.document_type || 'IDENTIFICACIÓN'} value={data.document_number} />
                            <Row label="PERÍODO LIQUIDADO" value={`${MESES[data.periodo_mes - 1]?.toUpperCase()} ${data.periodo_anio}`} bold />
                            <Row label="DIAS TRABAJADOS" value={data.dias_trabajados.toString()} bold />
                            <Row label="SUELDO MENSUAL" value={fmt(data.sueldo_mensual_base)} bold />
                        </div>
                    </div>

                    {/* Columna Derecha: Banco y Afiliaciones */}
                    <div className="col-span-2 bg-gray-50/30 px-4 py-3 space-y-3">
                        {tieneBanco && (
                            <div>
                                <p className="font-semibold text-gray-500 uppercase text-[9px] mb-1 leading-none">Forma de Pago</p>
                                <div className="space-y-1">
                                    <Row label="Banco" value={data.bank_name!} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <Row label="Tipo" value={data.account_type || '—'} />
                                        <Row label="No. Cuenta" value={data.account_number || '—'} mono />
                                    </div>
                                </div>
                            </div>
                        )}
                        {(data.eps_id || data.arl_id || data.pension_fund_id) && (
                            <div className="pt-2 border-t border-gray-200">
                                <p className="font-semibold text-gray-500 uppercase text-[9px] mb-1 leading-none">Afiliaciones</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {data.eps_id && <Row label="EPS" value={data.eps_id} />}
                                    {data.arl_id && <Row label="ARL" value={data.arl_id} />}
                                    {data.pension_fund_id && <Row label="Pensión" value={data.pension_fund_id} />}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ---- DEVENGOS ---- */}
                <div className="px-4 pt-3 pb-2">
                    <SectionTitle>DEVENGADO</SectionTitle>
                    <table className="w-full text-xs mt-1">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-200">
                                <th className="text-left pb-1 font-semibold">Concepto</th>
                                <th className="text-center pb-1 font-semibold w-16">Días/Cant</th>
                                <th className="text-right pb-1 font-semibold w-32">V. Unitario</th>
                                <th className="text-right pb-1 font-semibold w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devengos.length === 0 ? (
                                <tr><td colSpan={3} className="text-center text-gray-400 py-2 italic">Sin conceptos de devengo</td></tr>
                            ) : devengos.map(d => (
                                <tr key={d.id} className="border-b border-dashed border-gray-100">
                                    <td className="py-0.5">{d.descripcion}</td>
                                    <td className="text-center py-0.5">{Number(d.cantidad)}</td>
                                    <td className="text-right py-0.5 tabular-nums">{fmt(d.valor_unitario)}</td>
                                    <td className="text-right py-0.5 tabular-nums">{fmt(d.valor_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold border-t-2 border-gray-400">
                                <td colSpan={3} className="pt-1 uppercase text-[10px] text-gray-500">Subtotal Devengado</td>
                                <td className="text-right pt-1 tabular-nums">{fmt(data.total_devengado)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <Separator className="mx-4" />

                {/* ---- DEDUCCIONES ---- */}
                <div className="px-4 pt-2 pb-2">
                    <SectionTitle>DEDUCIDO</SectionTitle>
                    <table className="w-full text-xs mt-1">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-200">
                                <th className="text-left pb-1 font-semibold">Concepto</th>
                                <th className="text-right pb-1 font-semibold w-32">Base / Cant</th>
                                <th className="text-right pb-1 font-semibold w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="italic">
                            {deducciones.length === 0 ? (
                                <tr><td colSpan={2} className="text-center text-gray-400 py-2">Sin deducciones</td></tr>
                            ) : deducciones.map(d => (
                                <tr key={d.id} className="border-b border-dashed border-gray-100">
                                    <td className="py-0.5 not-italic">{d.descripcion}</td>
                                    <td className="text-right py-0.5 tabular-nums text-gray-400">{d.cantidad > 1 ? d.cantidad : fmt(d.valor_unitario)}</td>
                                    <td className="text-right py-0.5 tabular-nums">{fmt(d.valor_total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold not-italic border-t-2 border-gray-400">
                                <td colSpan={2} className="pt-1 uppercase text-[10px] text-gray-500">Subtotal Deducciones</td>
                                <td className="text-right pt-1 tabular-nums text-red-600">-{fmt(data.total_deducciones)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <Separator className="mx-4" />

                {/* ---- NETO A PAGAR ---- */}
                <div className="px-4 py-3 flex justify-between items-center font-black text-base border-y border-gray-300 bg-gray-50">
                    <span className="uppercase tracking-wide">NETO A PAGAR</span>
                    <span className="tabular-nums">{fmt(data.neto_pagar)}</span>
                </div>

                {/* ---- PIE / FIRMAS ---- */}
                <div className="px-4 pt-10 pb-8 grid grid-cols-2 gap-20">
                    <div className="space-y-1">
                        <div className="border-t border-gray-400 pt-2 text-center mx-auto w-3/4">
                            <p className="text-[10px] font-bold uppercase text-gray-800">FIRMA EMPLEADOR</p>
                            <p className="text-[9px] text-gray-500 font-medium">Opera Soluciones S.A.S.</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="border-t border-gray-400 pt-2 text-center mx-auto w-3/4">
                            <p className="text-[10px] font-bold uppercase text-gray-800">FIRMA EMPLEADO / HUELLA</p>
                            <p className="text-[9px] text-gray-500 font-medium">
                                {data.document_type || 'C.C.'} No. {data.document_number}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[9px] text-gray-400 pb-3">
                    Generado el {new Date(data.fecha_liquidacion).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}.
                </p>
            </div>
        </div>
    );
}

// ---- Sub-components ----
function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">{children}</p>
    );
}

function Row({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) {
    return (
        <div className="flex flex-col">
            <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wide">{label}</span>
            <span className={`${bold ? 'font-bold' : ''} ${mono ? 'font-mono' : ''} text-gray-900`}>{value}</span>
        </div>
    );
}
