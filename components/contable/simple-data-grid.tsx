"use client"

import { useState, useCallback, useEffect, useImperativeHandle, forwardRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Save, Trash2, X, Undo2, Filter, Search } from "lucide-react"
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
  fecha: string
  proveedor: string
  pago: number
  objeto: string
  valor_neto: number
  iva: number
  retencion: number
  total: number
  nit: string
  numero_factura: string
  obra: string
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
  saldo: number
  concepto: string
}

interface SimpleDataGridProps {
  data: any[]
  onSave: (data: any[]) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onCancel?: () => void
  onUnsavedChangesChange?: (hasChanges: boolean) => void
  onDataChange?: (data: any[]) => void
  onFiltersActiveChange?: (hasActiveFilters: boolean) => void
  year: number
  mes: string
  type: 'payroll' | 'expenses' | 'transfers'
  // Props para botones externos
  showFilters?: boolean
  setShowFilters?: (show: boolean) => void
  isSaving?: boolean
  setIsSaving?: (saving: boolean) => void
  hasChanges?: boolean
  setHasChanges?: (hasChanges: boolean) => void
  addRow?: () => void
  saveChanges?: () => void
  handleCancel?: () => void
}

export const SimpleDataGrid = forwardRef<any, SimpleDataGridProps>(({ 
  data, 
  onSave, 
  onDelete, 
  onCancel,
  onUnsavedChangesChange,
  onDataChange,
  onFiltersActiveChange,
  year, 
  mes, 
  type,
  // Props para botones externos
  showFilters: externalShowFilters,
  setShowFilters: externalSetShowFilters,
  isSaving: externalIsSaving,
  setIsSaving: externalSetIsSaving,
  hasChanges: externalHasChanges,
  setHasChanges: externalSetHasChanges,
  addRow: externalAddRow,
  saveChanges: externalSaveChanges,
  handleCancel: externalHandleCancel
}, ref) => {
  const [rows, setRows] = useState<any[]>([])
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [editingCell, setEditingCell] = useState<{rowIndex: number, columnKey: string} | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [originalData, setOriginalData] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCell, setExpandedCell] = useState<{rowIndex: number, columnKey: string, value: string} | null>(null)

  // Función para formatear fecha
  const formatDateForInput = (date: string | Date) => {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toISOString().split('T')[0]
  }

  // Función para formatear moneda usando react-number-format
  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(validAmount)
  }

  // Función para aplicar filtros
  const applyFilters = useCallback((dataToFilter: any[]) => {
    if (Object.keys(filters).length === 0) {
      return dataToFilter
    }

    return dataToFilter.filter(row => {
      return Object.entries(filters).every(([columnKey, filterValue]) => {
        if (!filterValue.trim()) return true
        
        const cellValue = row[columnKey]
        if (cellValue === null || cellValue === undefined) return false
        
        // Para campos numéricos, buscar coincidencia exacta o parcial
        if (['valor', 'iva', 'total', 'valor_neto', 'sale', 'entra', 'saldo', 'retencion', 'pago'].includes(columnKey)) {
          const numericValue = parseFloat(cellValue) || 0
          const filterNumeric = parseFloat(filterValue.replace(/[^\d.-]/g, '')) || 0
          return !isNaN(numericValue) && !isNaN(filterNumeric) && 
                 numericValue.toString().includes(filterNumeric.toString())
        }
        
        // Para otros campos, búsqueda de texto (case insensitive)
        return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase())
      })
    })
  }, [filters])

  // Procesar datos cuando cambien
  useEffect(() => {
    const processedData = data.map(row => ({
      ...row,
      fecha: formatDateForInput(row.fecha),
      // Asegurar que los campos numéricos tengan valores válidos
      saldo: row.saldo || 0,
      sale: row.sale || 0,
      entra: row.entra || 0,
      valor: row.valor || 0,
      iva: row.iva || 0,
      valor_neto: row.valor_neto || 0,
      retencion: row.retencion || 0,
      pago: row.pago || 0,
      total: row.total || 0
    }))
    setRows(processedData)
    setOriginalData(processedData)
    setHasChanges(false)
  }, [data])

  // Aplicar filtros cuando cambien los datos o filtros
  useEffect(() => {
    const filtered = applyFilters(rows)
    setFilteredRows(filtered)
  }, [rows, applyFilters])

  // Notificar cambios al componente padre
  useEffect(() => {
    onUnsavedChangesChange?.(hasChanges)
    // Notificar cambios de estado a los botones externos
    if (externalSetIsSaving) {
      externalSetIsSaving(isSaving)
    }
    if (externalSetHasChanges) {
      externalSetHasChanges(hasChanges)
    }
  }, [hasChanges, isSaving, onUnsavedChangesChange, externalSetIsSaving, externalSetHasChanges])

  // Notificar cambios de datos para actualizar totales en tiempo real
  useEffect(() => {
    // Enviar datos filtrados para el cálculo de totales
    onDataChange?.(filteredRows)
  }, [filteredRows, onDataChange])

  // Notificar cuando hay filtros activos
  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(filterValue => filterValue.trim() !== '')
    onFiltersActiveChange?.(hasActiveFilters)
  }, [filters, onFiltersActiveChange])

  // Manejar cambios en filtros
  const handleFilterChange = useCallback((columnKey: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: value
    }))
  }, [])

  // Limpiar todos los filtros
  const clearAllFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Agregar nueva fila
  const addRow = useCallback(() => {
    const newRow = type === 'payroll' 
      ? {
          year,
          mes,
          fecha: new Date().toISOString().split('T')[0],
          proveedor: '',
          pago: 0,
          objeto: '',
          valor_neto: 0,
          iva: 0,
          retencion: 0,
          total: 0,
          nit: '',
          numero_factura: '',
          obra: '',
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
          saldo: 0,
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
      
      // Calcular total para gastos y facturación (NO para transferencias - saldo es manual)
      if ((type === 'expenses' || type === 'payroll') && (columnKey === 'valor' || columnKey === 'iva' || columnKey === 'valor_neto' || columnKey === 'retencion')) {
        if (type === 'expenses') {
          const valor = Number(columnKey === 'valor' ? value : newRows[rowIndex].valor) || 0
          const iva = Number(columnKey === 'iva' ? value : newRows[rowIndex].iva) || 0
          newRows[rowIndex].total = valor + iva
        } else if (type === 'payroll') {
          const valor_neto = Number(columnKey === 'valor_neto' ? value : newRows[rowIndex].valor_neto) || 0
          const iva = Number(columnKey === 'iva' ? value : newRows[rowIndex].iva) || 0
          const retencion = Number(columnKey === 'retencion' ? value : newRows[rowIndex].retencion) || 0
          newRows[rowIndex].total = valor_neto + iva - retencion
        }
      }
      
      // Para transferencias, el saldo es manual - NO calcular automáticamente
      
      
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
    if (isSaving) return // Prevenir doble clic
    
    setIsSaving(true)
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
    } finally {
      setIsSaving(false)
    }
  }, [rows, onSave, onDelete, isSaving])

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
        return row.fecha !== original.fecha ||
               row.proveedor !== original.proveedor ||
               row.pago !== original.pago ||
               row.objeto !== original.objeto ||
               row.valor_neto !== original.valor_neto ||
               row.iva !== original.iva ||
               row.retencion !== original.retencion ||
               row.total !== original.total ||
               row.nit !== original.nit ||
               row.numero_factura !== original.numero_factura ||
               row.obra !== original.obra
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
        return row.fecha !== original.fecha ||
               row.actividad !== original.actividad ||
               row.sale !== original.sale ||
               row.entra !== original.entra ||
               row.saldo !== original.saldo ||
               row.concepto !== original.concepto
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

  // Usar estados externos si están disponibles, sino usar internos
  const currentShowFilters = externalShowFilters !== undefined ? externalShowFilters : showFilters
  const currentSetShowFilters = externalSetShowFilters || setShowFilters
  const currentIsSaving = externalIsSaving !== undefined ? externalIsSaving : isSaving
  const currentSetIsSaving = externalSetIsSaving || setIsSaving
  const currentHasChanges = externalHasChanges !== undefined ? externalHasChanges : hasChanges
  const currentAddRow = addRow
  const currentSaveChanges = saveChanges
  const currentHandleCancel = handleCancel

  // Exponer funciones internas al componente padre
  useImperativeHandle(ref, () => ({
    addRow: addRow,
    saveChanges: saveChanges,
    handleCancel: handleCancel
  }), [addRow, saveChanges, handleCancel])

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
            className="w-full min-h-8 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-sm px-1"
            style={{ minWidth: '120px', maxWidth: '120px' }}
            autoFocus
          />
        ) 
      } else if (['debe', 'haber', 'saldo', 'valor', 'iva', 'valor_neto', 'total', 'sale', 'entra', 'retencion', 'pago'].includes(columnKey)) {
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
            className="w-full min-h-8 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-sm px-1"
            style={{ minWidth: '130px', maxWidth: '130px' }}
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
            className="w-full min-h-8 border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left text-sm px-1"
            autoFocus
          />
        )
      }
    } else {
      if (['debe', 'haber', 'saldo', 'valor', 'iva', 'total', 'valor_neto', 'sale', 'entra', 'retencion', 'pago'].includes(columnKey)) {
        return (
          <div className="text-right min-h-8 flex items-center justify-end text-sm px-1">
            {formatCurrency(value)}
          </div>
        )
      }
      return (
        <div className="min-h-8 flex items-start text-sm px-1 text-left break-words" title={value} style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>
          {value}
        </div>
      )
    }
  }

  // Configuración de columnas
  const columns = type === 'payroll' 
    ? [
        { key: 'fecha', name: 'Fecha', width: 120 },
        { key: 'proveedor', name: 'Proveedor', width: 200 },
        { key: 'pago', name: 'Pago', width: 130 },
        { key: 'objeto', name: 'Objeto', width: 200 },
        { key: 'valor_neto', name: 'Valor Neto', width: 130 },
        { key: 'iva', name: 'IVA', width: 130 },
        { key: 'retencion', name: 'Retención', width: 130 },
        { key: 'total', name: 'Total', width: 130 },
        { key: 'nit', name: 'NIT', width: 120 },
        { key: 'numero_factura', name: 'N° de Factura', width: 120 },
        { key: 'obra', name: 'Obra', width: 150 },
        { key: 'actions', name: 'Acciones', width: 100 }
      ]
    : type === 'expenses'
    ? [
        { key: 'numero_facturacion', name: 'N° Facturación', width: 120 },
        { key: 'fecha', name: 'Fecha', width: 120 },
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
        { key: 'saldo', name: 'Saldo', width: 130 },
        { key: 'concepto', name: 'Concepto', width: 250 },
        { key: 'actions', name: 'Acciones', width: 100 }
      ]

  return (
    <div className="space-y-4">
      {/* Solo mostrar botones si no hay botones externos */}
      {!externalAddRow && (
        <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Button 
              onClick={() => currentSetShowFilters(!currentShowFilters)} 
            size="sm"
              variant={currentShowFilters ? "default" : "outline"}
          >
            <Filter className="h-4 w-4 mr-2" />
              {currentShowFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>
          <Button 
              onClick={currentAddRow} 
            size="sm"
            disabled={isSaving}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Fila
          </Button>
            {currentHasChanges && (
            <Button 
                onClick={currentSaveChanges} 
              size="sm" 
              variant="default"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
          {onCancel && (
              <Button onClick={currentHandleCancel} size="sm" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          )}
        </div>
      </div>
      )}
      
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-blue-800">
              {/* Fila de encabezados */}
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
              
              {/* Fila de filtros */}
              {currentShowFilters && (
                <tr className="bg-blue-700">
                  {columns.map((column) => (
                    <th 
                      key={`filter-${column.key}`} 
                      className="px-2 py-2 border border-gray-300"
                      style={{ width: column.width }}
                    >
                      {column.key === 'actions' ? (
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={clearAllFilters}
                            className="h-6 px-2 text-xs bg-white text-gray-700 hover:bg-gray-50"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Limpiar
                          </Button>
                        </div>
                      ) : (
                        <Input
                          type="text"
                          placeholder={`Filtrar ${column.name.toLowerCase()}...`}
                          value={filters[column.key] || ''}
                          onChange={(e) => handleFilterChange(column.key, e.target.value)}
                          className="h-7 text-xs bg-white border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          style={{ width: '100%', minWidth: '80px' }}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody className="bg-white">
              {filteredRows.map((row, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  className={`hover:bg-gray-50 ${row.isDeleted ? 'bg-red-50 opacity-60' : ''}`}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className="px-2 py-2 align-top border border-gray-300 text-left"
                      style={{ width: column.width, minWidth: column.width, maxWidth: column.width }}
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
})

SimpleDataGrid.displayName = "SimpleDataGrid"
