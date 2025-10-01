"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2, X, Undo2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { NumericFormat } from "react-number-format"
import { DiscardChangesDialog } from "@/components/ui/discard-changes-dialog"

// Tipos para las filas
interface BaseRow {
  id?: number
  year: number
  mes: string
  fecha: string
  isNew?: boolean
}

interface PayrollRow extends BaseRow {
  numero_factura: string
  proveedor: string
  nit: string
  pago: string
  objeto: string
  valor_neto: number
  iva: number
  obra: string
  total: number
}

interface ExpenseRow extends BaseRow {
  numero_facturacion: string
  cliente: string
  servicio: string
  nit: string
  valor: number
  iva: number
  total: number
}

interface TransferRow extends BaseRow {
  actividad: string
  sale: number
  entra: number
  concepto: string
}

interface SimpleDataGridProps {
  data: any[]
  onSave: (data: any[]) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCancel?: () => void
  onUnsavedChangesChange?: (hasChanges: boolean) => void
  year: number
  mes: string
  type: 'payroll' | 'expenses' | 'transfers'
}

export function SimpleDataGrid({ 
  data, 
  onSave, 
  onDelete, 
  onCancel,
  onUnsavedChangesChange,
  year, 
  mes, 
  type 
}: SimpleDataGridProps) {
  const [rows, setRows] = useState<any[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [editingCell, setEditingCell] = useState<{rowIndex: number, columnKey: string} | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [originalData, setOriginalData] = useState<any[]>([])

  // Función para formatear fecha
  const formatDateForInput = (date: string | Date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString().split('T')[0]
  }

  // Función para formatear moneda usando react-number-format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Procesar datos cuando cambien
  useEffect(() => {
    const processedData = data.map(row => ({
      ...row,
      fecha: formatDateForInput(row.fecha)
    }))
    setRows(processedData)
    setOriginalData(processedData)
    setHasChanges(false)
  }, [data])

  // Notificar cambios al componente padre
  useEffect(() => {
    onUnsavedChangesChange?.(hasChanges)
  }, [hasChanges, onUnsavedChangesChange])

  // Agregar nueva fila
  const addRow = useCallback(() => {
    const newRow = type === 'payroll' 
      ? {
          year,
          mes,
          fecha: new Date().toISOString().split('T')[0],
          numero_factura: '',
          proveedor: '',
          nit: '',
          pago: '',
          objeto: '',
          valor_neto: 0,
          iva: 0,
          obra: '',
          total: 0,
          isNew: true
        } as PayrollRow
      : type === 'expenses'
      ? {
          year,
          mes,
          fecha: new Date().toISOString().split('T')[0],
          numero_facturacion: '',
          cliente: '',
          servicio: '',
          nit: '',
          valor: 0,
          iva: 0,
          total: 0,
          isNew: true
        } as ExpenseRow
      : {
          year,
          mes,
          fecha: new Date().toISOString().split('T')[0],
          actividad: '',
          sale: 0,
          entra: 0,
          concepto: '',
          isNew: true
        } as TransferRow

    setRows(prev => [...prev, newRow])
    setHasChanges(true)
  }, [year, mes, type])

  // Actualizar celda
  const updateCell = useCallback((rowIndex: number, columnKey: string, value: any) => {
    setRows(prev => {
      const newRows = [...prev]
      newRows[rowIndex] = { ...newRows[rowIndex], [columnKey]: value }
      
      // Calcular total para gastos y facturación
      if ((type === 'expenses' || type === 'payroll') && (columnKey === 'valor' || columnKey === 'iva' || columnKey === 'valor_neto')) {
        if (type === 'expenses') {
          const valor = columnKey === 'valor' ? value : newRows[rowIndex].valor
          const iva = columnKey === 'iva' ? value : newRows[rowIndex].iva
          newRows[rowIndex].total = valor + iva
        } else if (type === 'payroll') {
          const valor_neto = columnKey === 'valor_neto' ? value : newRows[rowIndex].valor_neto
          const iva = columnKey === 'iva' ? value : newRows[rowIndex].iva
          newRows[rowIndex].total = valor_neto + iva
        }
      }
      
      return newRows
    })
    setHasChanges(true)
    // No cerrar la edición automáticamente, solo cuando el usuario presione Enter o Escape
  }, [type])

  // Eliminar fila
  const deleteRow = useCallback((rowIndex: number) => {
    const row = rows[rowIndex]
    if (row.id) {
      // Marcar como eliminado pero no eliminar hasta guardar
      setRows(prev => prev.map((r, i) => 
        i === rowIndex ? { ...r, isDeleted: true } : r
      ))
      setHasChanges(true)
    } else {
      // Si es una fila nueva, eliminarla directamente
      setRows(prev => prev.filter((_, i) => i !== rowIndex))
    }
  }, [rows])

  // Guardar cambios
  const saveChanges = useCallback(async () => {
    try {
      // Separar filas eliminadas de las demás
      const deletedRows = rows.filter(row => row.isDeleted && row.id)
      const activeRows = rows.filter(row => !row.isDeleted)
      
      // Eliminar registros marcados para eliminación
      for (const row of deletedRows) {
        try {
          await onDelete(row.id)
        } catch (error) {
          console.error("Error deleting row:", error)
          toast({
            title: "Error",
            description: `No se pudo eliminar el registro ${row.id}`,
            variant: "destructive"
          })
          throw error
        }
      }
      
      // Guardar filas activas
      await onSave(activeRows)
      
      // Actualizar estado local
      setRows(activeRows)
      setHasChanges(false)
      setOriginalData([...activeRows])
      
      toast({
        title: "Éxito",
        description: "Datos guardados correctamente"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos",
        variant: "destructive"
      })
    }
  }, [rows, onSave, onDelete])

  // Contar cambios sin guardar
  const getUnsavedChangesCount = useCallback(() => {
    if (!hasChanges) return 0
    
    // Contar filas nuevas
    const newRows = rows.filter(row => row.isNew)
    
    // Contar filas marcadas para eliminación
    const deletedRows = rows.filter(row => row.isDeleted && row.id)
    
    // Contar filas modificadas (que no son nuevas pero han cambiado)
    const modifiedRows = rows.filter(row => {
      if (row.isNew || row.isDeleted) return false
      const original = originalData.find(orig => orig.id === row.id)
      if (!original) return false
      
      // Comparar campos relevantes según el tipo
      if (type === 'payroll') {
        return row.numero_factura !== original.numero_factura ||
               row.proveedor !== original.proveedor ||
               row.nit !== original.nit ||
               row.pago !== original.pago ||
               row.objeto !== original.objeto ||
               row.valor_neto !== original.valor_neto ||
               row.iva !== original.iva ||
               row.obra !== original.obra ||
               row.total !== original.total ||
               row.fecha !== original.fecha
      } else if (type === 'expenses') {
        return row.numero_facturacion !== original.numero_facturacion ||
               row.cliente !== original.cliente ||
               row.servicio !== original.servicio ||
               row.nit !== original.nit ||
               row.valor !== original.valor ||
               row.iva !== original.iva ||
               row.total !== original.total ||
               row.fecha !== original.fecha
      } else {
        return row.actividad !== original.actividad ||
               row.sale !== original.sale ||
               row.entra !== original.entra ||
               row.concepto !== original.concepto ||
               row.fecha !== original.fecha
      }
    })
    
    return newRows.length + modifiedRows.length + deletedRows.length
  }, [rows, originalData, hasChanges, type])

  // Manejar cancelar
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      setShowCancelDialog(true)
    } else {
      onCancel?.()
    }
  }, [hasChanges, onCancel])

  // Confirmar cancelar
  const confirmCancel = useCallback(() => {
    // Restaurar datos originales (sin filas marcadas como eliminadas)
    const restoredData = originalData.map(row => ({ ...row, isDeleted: false }))
    setRows(restoredData)
    setHasChanges(false)
    setEditingCell(null)
    setShowCancelDialog(false)
    onCancel?.()
  }, [originalData, onCancel])

  // Cancelar cancelar (mantener cambios)
  const cancelCancel = useCallback(() => {
    setShowCancelDialog(false)
  }, [])

  // Renderizar celda
  const renderCell = (row: any, columnKey: string, rowIndex: number) => {
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.columnKey === columnKey
    const value = row[columnKey]

    if (isEditing) {
      if (columnKey === 'fecha') {
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => updateCell(rowIndex, columnKey, e.target.value)}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingCell(null)
              }
              if (e.key === 'Escape') {
                setEditingCell(null)
              }
            }}
            className="w-full h-8 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm px-1 overflow-hidden text-ellipsis"
            style={{ minWidth: '120px', maxWidth: '120px', textOverflow: 'ellipsis' }}
            autoFocus
          />
        )
      } else if (['debe', 'haber', 'saldo', 'valor', 'iva', 'valor_neto', 'total', 'sale', 'entra'].includes(columnKey)) {
        return (
          <NumericFormat
            thousandSeparator="."
            decimalSeparator=","
            prefix="$ "
            decimalScale={0}
            fixedDecimalScale={false}
            allowNegative={false}
            value={value}
            onValueChange={(values) => {
              updateCell(rowIndex, columnKey, parseFloat(values.value) || 0)
            }}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingCell(null)
              }
              if (e.key === 'Escape') {
                setEditingCell(null)
              }
            }}
            className="w-full h-8 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-right text-sm px-1 overflow-hidden text-ellipsis"
            style={{ minWidth: '130px', maxWidth: '130px', textOverflow: 'ellipsis' }}
            autoFocus
          />
        )
      } else {
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateCell(rowIndex, columnKey, e.target.value)}
            onBlur={() => setEditingCell(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingCell(null)
              }
              if (e.key === 'Escape') {
                setEditingCell(null)
              }
            }}
            className="w-full h-8 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm px-1 overflow-hidden text-ellipsis"
            style={{ textOverflow: 'ellipsis' }}
            autoFocus
          />
        )
      }
    } else {
      if (['debe', 'haber', 'saldo', 'valor', 'iva', 'total', 'valor_neto', 'sale', 'entra'].includes(columnKey)) {
        return (
          <div className="text-right h-8 flex items-center justify-end text-sm px-1">
            {formatCurrency(value)}
          </div>
        )
      }
      return (
        <div className="h-8 flex items-center text-sm px-1 overflow-hidden text-ellipsis whitespace-nowrap" title={value}>
          {value}
        </div>
      )
    }
  }

  // Configuración de columnas
  const columns = type === 'payroll' 
    ? [
        { key: 'fecha', name: 'Fecha', width: 120 },
        { key: 'numero_factura', name: 'N° Factura', width: 120 },
        { key: 'proveedor', name: 'Proveedor', width: 200 },
        { key: 'nit', name: 'NIT', width: 120 },
        { key: 'pago', name: 'Pago', width: 100 },
        { key: 'objeto', name: 'Objeto', width: 200 },
        { key: 'valor_neto', name: 'Valor Neto', width: 130 },
        { key: 'iva', name: 'IVA', width: 130 },
        { key: 'obra', name: 'Obra', width: 150 },
        { key: 'total', name: 'Total', width: 130 },
        { key: 'actions', name: 'Acciones', width: 100 }
      ]
    : type === 'expenses'
    ? [
        { key: 'fecha', name: 'Fecha', width: 120 },
        { key: 'numero_facturacion', name: 'N° Facturación', width: 120 },
        { key: 'cliente', name: 'Cliente', width: 200 },
        { key: 'servicio', name: 'Servicio', width: 200 },
        { key: 'nit', name: 'NIT', width: 120 },
        { key: 'valor', name: 'Valor', width: 130 },
        { key: 'iva', name: 'IVA', width: 130 },
        { key: 'total', name: 'Total', width: 130 },
        { key: 'actions', name: 'Acciones', width: 100 }
      ]
    : [
        { key: 'fecha', name: 'Fecha', width: 120 },
        { key: 'actividad', name: 'Actividad', width: 200 },
        { key: 'sale', name: 'Sale', width: 130 },
        { key: 'entra', name: 'Entra', width: 130 },
        { key: 'concepto', name: 'Concepto', width: 250 },
        { key: 'actions', name: 'Acciones', width: 100 }
      ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {type === 'payroll' ? 'Libro Gastos Mes a Mes' : 
           type === 'expenses' ? 'Facturación' : 
           'Transferencias y Pagos'}
        </h3>
        <div className="flex gap-2">
          <Button onClick={addRow} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Fila
          </Button>
          {hasChanges && (
            <Button onClick={saveChanges} size="sm" variant="default">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          )}
          {onCancel && (
            <Button onClick={handleCancel} size="sm" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </div>
      
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-800">
              <tr>
                {columns.map((column) => (
                  <th 
                    key={column.key} 
                    className="px-4 py-3 text-left text-sm font-medium text-white border border-gray-300"
                    style={{ width: column.width }}
                  >
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`hover:bg-gray-50 ${row.isDeleted ? 'bg-red-50 opacity-60' : ''}`}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-2 py-2 align-top border border-gray-300"
                      style={{ width: column.width, minWidth: column.width, maxWidth: column.width, height: '48px' }}
                      onClick={() => {
                        if (column.key !== 'actions') {
                          setEditingCell({ rowIndex, columnKey: column.key })
                        }
                      }}
                    >
                      {column.key === 'actions' ? (
                        <div className="flex gap-1 justify-center">
                          {row.isDeleted ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // Restaurar fila eliminada
                                setRows(prev => prev.map((r, i) => 
                                  i === rowIndex ? { ...r, isDeleted: false } : r
                                ))
                                setHasChanges(true)
                              }}
                              className="h-6 w-6 p-0 text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <Undo2 className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteRow(rowIndex)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        renderCell(row, column.key, rowIndex)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diálogo de confirmación para cancelar */}
      <DiscardChangesDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
        unsavedChangesCount={getUnsavedChangesCount()}
        year={year}
        mes={mes}
      />
    </div>
  )
}
