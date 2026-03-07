'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Receipt, Eye, FileDown, Search } from "lucide-react"
import { formatCurrency } from "@/lib/currency-utils"
import { VolantePago } from "@/components/nomina/volante-pago"
import { getLiquidacionById } from "@/actions/nomina"
import { toast } from "sonner"

const MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

interface VolanteItem {
    id: number
    periodo_mes: number
    periodo_anio: number
    quincena: number
    total_devengado: number
    total_deducciones: number
    neto_pagar: number
    estado: string
    fecha_liquidacion: string | Date
}

interface MisVolantesClientProps {
    initialVolantes: VolanteItem[]
}

export function MisVolantesClient({ initialVolantes }: MisVolantesClientProps) {
    const [selectedVolante, setSelectedVolante] = useState<any | null>(null)
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    const handleViewVolante = async (id: number) => {
        setLoading(true)
        try {
            const response = await getLiquidacionById(id)
            if (response.success) {
                setSelectedVolante(response.data)
                setIsOpen(true)
            } else {
                toast.error(response.message || "Error al cargar el volante")
            }
        } catch (error) {
            toast.error("Error de conexión al servidor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-indigo-600" />
                        Historial de Pagos
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow>
                            <TableHead className="px-6">Periodo</TableHead>
                            <TableHead>Quincena</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead className="text-right">Total Devengado</TableHead>
                            <TableHead className="text-right">Deducciones</TableHead>
                            <TableHead className="text-right font-bold">Neto a Pagar</TableHead>
                            <TableHead className="text-center">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialVolantes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-gray-500 italic">
                                    No se encontraron volantes de pago aprobados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            initialVolantes.map((volante) => (
                                <TableRow key={volante.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="px-6 font-medium">
                                        {MESES[volante.periodo_mes - 1]} {volante.periodo_anio}
                                    </TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase">
                                            Q{volante.quincena}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {new Date(volante.fecha_liquidacion).toLocaleDateString('es-CO')}
                                    </TableCell>
                                    <TableCell className="text-right text-gray-600">
                                        {formatCurrency(volante.total_devengado)}
                                    </TableCell>
                                    <TableCell className="text-right text-red-500">
                                        -{formatCurrency(volante.total_deducciones)}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-gray-900">
                                        {formatCurrency(volante.neto_pagar)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 gap-2"
                                            onClick={() => handleViewVolante(volante.id)}
                                            disabled={loading}
                                        >
                                            <Eye className="h-4 w-4" />
                                            Ver
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-gray-100">
                    <DialogHeader className="p-6 bg-white border-b sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-bold text-gray-900">
                                Resumen de Comprobante
                            </DialogTitle>
                        </div>
                    </DialogHeader>
                    <div className="p-6">
                        {selectedVolante && (
                            <VolantePago data={selectedVolante} />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
