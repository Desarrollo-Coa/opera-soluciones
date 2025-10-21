"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calculator, FileText, Calendar, Users, ChevronLeft, ChevronRight, Filter, Plus, Save, X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, CheckSquare, Square } from "lucide-react"
import { SimpleDataGrid } from "@/components/contable/simple-data-grid"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { DiscardChangesDialog } from "@/components/ui/discard-changes-dialog"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  role: string
  email: string
}

interface PayrollData {
  id: number
  year: number
  mes: string
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

interface ExpenseData {
  id: number
  year: number
  mes: string
  numero_facturacion: string
  fecha: string
  cliente: string
  servicio: string
  nit: string
  valor: number
  iva: number
  total: number
}

interface TransferData {
  id: number
  year: number
  mes: string
  fecha: string
  actividad: string
  sale: number
  entra: number
  concepto: string
}

interface ImportData {
  rows: any[]
  allRows?: any[] // Nueva propiedad con todos los registros (válidos y con errores)
  totalRows: number
  validRows: number
  invalidRows: number
  errors: string[]
  warnings: string[]
  summary: {
    totalAmount?: number
    dateRange?: { from: string, to: string }
    uniqueValues?: Record<string, number>
  }
}

interface SheetInfo {
  name: string
  rows: number
  columns: string[]
}

interface RowWithStatus {
  data: any
  isValid: boolean
  errors: string[]
  index: number
}

function ContableContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'gastos' | 'facturacion' | 'bancos'>('gastos')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [transferData, setTransferData] = useState<TransferData[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  
  // Estados para datos en tiempo real (incluyendo cambios no guardados)
  const [currentPayrollData, setCurrentPayrollData] = useState<PayrollData[]>([])
  const [currentExpenseData, setCurrentExpenseData] = useState<ExpenseData[]>([])
  const [currentTransferData, setCurrentTransferData] = useState<TransferData[]>([])
  
  // Estados para filtros activos
  const [hasActiveFilters, setHasActiveFilters] = useState(false)

  // Estados para el SimpleDataGrid
  const [showFilters, setShowFilters] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Usar el mismo estado para hasChanges y hasUnsavedChanges
  const [hasChanges, setHasChanges] = useState(false)
  const hasUnsavedChanges = hasChanges

  // Estado para el año central del selector (navegación infinita)
  const [centerYear, setCenterYear] = useState<number>(new Date().getFullYear())
  
  // Estados para importación
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [availableSheets, setAvailableSheets] = useState<SheetInfo[]>([])
  const [selectedSheet, setSelectedSheet] = useState<string>("")
  const [importData, setImportData] = useState<ImportData | null>(null)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [allRows, setAllRows] = useState<any[]>([])
  const { toast } = useToast()
  
  // Generar años dinámicamente basados en el año central
  const generateYears = (center: number) => [center - 1, center, center + 1]
  
  // Meses disponibles (estáticos)
  const availableMonths = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ]

  // Configurar hook para manejar cambios sin guardar
  const { 
    navigateWithConfirmation, 
    handleStateChange, 
    showDiscardDialog, 
    confirmDiscard, 
    cancelDiscard 
  } = useUnsavedChanges({
    hasUnsavedChanges,
    onConfirmDiscard: () => {
      setHasChanges(false)
      // Limpiar datos al descartar
      setPayrollData([])
      setExpenseData([])
      setTransferData([])
    },
    onCancelDiscard: () => {
      // No hacer nada, mantener los cambios
    }
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          setUser({
            id: userData.id,
            role: userData.role,
            email: userData.email
          })
        } else if (response.status === 401) {
          // Token expirado o inválido, redirigir al login
          console.log("Token expirado, redirigiendo al login")
          router.push('/login')
          return
        } else {
          console.error("Error fetching user data:", response.status)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        // En caso de error de red, también redirigir al login
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  // Seleccionar año actual automáticamente al cargar la página
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    if (!selectedYear) {
      setSelectedYear(currentYear)
    }
  }, [selectedYear])

  // Cargar datos cuando cambie la selección
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      fetchData()
    }
  }, [selectedYear, selectedMonth, activeSection])

  const fetchData = async () => {
    if (!selectedYear || !selectedMonth) return

    setDataLoading(true)
    try {
      if (activeSection === 'gastos') {
        const response = await fetch(`/api/contable/payroll?year=${selectedYear}&mes=${selectedMonth}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setPayrollData(data.data || [])
          setCurrentPayrollData([]) // Limpiar datos en tiempo real
        }
      } else if (activeSection === 'facturacion') {
        const response = await fetch(`/api/contable/expenses?year=${selectedYear}&mes=${selectedMonth}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setExpenseData(data.data || [])
          setCurrentExpenseData([]) // Limpiar datos en tiempo real
        }
      } else if (activeSection === 'bancos') {
        const response = await fetch(`/api/contable/transfers?year=${selectedYear}&mes=${selectedMonth}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setTransferData(data.data || [])
          setCurrentTransferData([]) // Limpiar datos en tiempo real
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleYearSelect = (year: number) => {
    handleStateChange(() => {
      setSelectedYear(year)
      setSelectedMonth(null) // Reset month when year changes
      setPayrollData([])
      setExpenseData([])
      setTransferData([])
      setCurrentPayrollData([])
      setCurrentExpenseData([])
      setCurrentTransferData([])
      setHasChanges(false)
    })
  }

  // Navegar al año anterior
  const navigateToPreviousYear = () => {
    const newCenterYear = centerYear - 1
    // Si el año seleccionado es el año central anterior, mantenerlo seleccionado
    if (selectedYear === centerYear) {
      handleStateChange(() => {
        setCenterYear(newCenterYear)
        setSelectedYear(newCenterYear)
        setSelectedMonth(null) // Reset month when year changes
        setPayrollData([])
        setExpenseData([])
        setTransferData([])
        setCurrentPayrollData([])
        setCurrentExpenseData([])
        setCurrentTransferData([])
        setHasChanges(false)
      })
    } else {
      // Solo cambiar el centro si no afecta el año seleccionado
      setCenterYear(newCenterYear)
    }
  }

  // Navegar al año siguiente
  const navigateToNextYear = () => {
    const newCenterYear = centerYear + 1
    // Si el año seleccionado es el año central siguiente, mantenerlo seleccionado
    if (selectedYear === centerYear) {
      handleStateChange(() => {
        setCenterYear(newCenterYear)
        setSelectedYear(newCenterYear)
        setSelectedMonth(null) // Reset month when year changes
        setPayrollData([])
        setExpenseData([])
        setTransferData([])
        setCurrentPayrollData([])
        setCurrentExpenseData([])
        setCurrentTransferData([])
        setHasChanges(false)
      })
    } else {
      // Solo cambiar el centro si no afecta el año seleccionado
      setCenterYear(newCenterYear)
    }
  }

  // Referencias para las funciones del SimpleDataGrid
  const simpleDataGridRef = useRef<any>(null)

  // Agregar nueva fila - delegar al SimpleDataGrid
  const addRow = () => {
    if (simpleDataGridRef.current?.addRow) {
      simpleDataGridRef.current.addRow()
    }
  }

  // Guardar cambios - delegar al SimpleDataGrid
  const saveChanges = async () => {
    if (simpleDataGridRef.current?.saveChanges) {
      await simpleDataGridRef.current.saveChanges()
    }
  }

  // Manejar cancelar - delegar al SimpleDataGrid
  const handleCancel = () => {
    if (simpleDataGridRef.current?.handleCancel) {
      simpleDataGridRef.current.handleCancel()
    }
  }

  // Función onCancel para el SimpleDataGrid
  const onCancel = () => {
    setSelectedYear(null)
    setSelectedMonth(null)
    setPayrollData([])
    setExpenseData([])
    setTransferData([])
    setCurrentPayrollData([])
    setCurrentExpenseData([])
    setCurrentTransferData([])
    setHasChanges(false)
  }

  const handleMonthSelect = (month: string) => {
    handleStateChange(() => {
      setSelectedMonth(month)
      setHasChanges(false)
    })
  }

  const handleModuleChange = (module: 'gastos' | 'facturacion' | 'bancos') => {
    handleStateChange(() => {
      setActiveSection(module)
      setHasChanges(false)
      // Limpiar datos en tiempo real al cambiar de módulo
      setCurrentPayrollData([])
      setCurrentExpenseData([])
      setCurrentTransferData([])
      // Limpiar estado de filtros activos
      setHasActiveFilters(false)
    })
  }

  // Manejar cambios de datos en tiempo real
  const handleDataChange = (data: any[]) => {
    if (activeSection === 'gastos') {
      setCurrentPayrollData(data)
    } else if (activeSection === 'facturacion') {
      setCurrentExpenseData(data)
    } else if (activeSection === 'bancos') {
      setCurrentTransferData(data)
    }
  }

  // Manejar cambios en el estado de filtros activos
  const handleFiltersActiveChange = (hasActiveFilters: boolean) => {
    setHasActiveFilters(hasActiveFilters)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Función para obtener columnas en el orden correcto según el tipo de módulo
  const getOrderedColumns = (type: string) => {
    const columnDefinitions = {
      gastos: [
        { key: 'fecha', label: 'FECHA' },
        { key: 'proveedor', label: 'PROVEEDOR' },
        { key: 'pago', label: 'PAGO' },
        { key: 'objeto', label: 'OBJETO' },
        { key: 'valor_neto', label: 'VALOR NETO' },
        { key: 'iva', label: 'IVA' },
        { key: 'retencion', label: 'RETENCIÓN' },
        { key: 'total', label: 'TOTAL' },
        { key: 'nit', label: 'NIT' },
        { key: 'numero_factura', label: 'N° FACTURA' },
        { key: 'obra', label: 'OBRA' },
        { key: 'year', label: 'AÑO' },
        { key: 'mes', label: 'MES' }
      ],
      facturacion: [
        { key: 'numero_facturacion', label: 'N° FACTURACIÓN' },
        { key: 'fecha', label: 'FECHA' },
        { key: 'cliente', label: 'CLIENTE' },
        { key: 'servicio', label: 'SERVICIO' },
        { key: 'nit', label: 'NIT' },
        { key: 'valor', label: 'VALOR' },
        { key: 'iva', label: 'IVA' },
        { key: 'total', label: 'TOTAL' },
        { key: 'year', label: 'AÑO' },
        { key: 'mes', label: 'MES' }
      ],
      bancos: [
        { key: 'fecha', label: 'FECHA' },
        { key: 'actividad', label: 'ACTIVIDAD' },
        { key: 'sale', label: 'SALE' },
        { key: 'entra', label: 'ENTRA' },
        { key: 'saldo', label: 'SALDO' },
        { key: 'concepto', label: 'CONCEPTO' },
        { key: 'year', label: 'AÑO' },
        { key: 'mes', label: 'MES' }
      ]
    }
    
    return columnDefinitions[type as keyof typeof columnDefinitions] || []
  }

  // Función para procesar archivo Excel/CSV
  const processFile = async (file: File, sheetName?: string) => {
    setIsProcessingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (sheetName) {
        formData.append('sheet', sheetName)
      }
      // Mapear el tipo del frontend al tipo del backend
      const typeMapping: Record<string, string> = {
        'gastos': 'payroll',
        'facturacion': 'expenses', 
        'bancos': 'transfers'
      }
      const backendType = typeMapping[activeSection] || activeSection
      console.log('Sending type to API:', activeSection, '->', backendType)
      formData.append('type', backendType)

      const response = await fetch('/api/contable/import', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al procesar el archivo')
      }

      const data = await response.json()
      console.log('API response:', data)
      return data
    } catch (error) {
      console.error('Error processing file:', error)
      throw error
    } finally {
      setIsProcessingFile(false)
    }
  }

  // Manejar selección de archivo
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportFile(file)
    
    try {
      // Primero obtener información de las hojas disponibles
      const sheetsData = await processFile(file)
      
      if (sheetsData.sheets && sheetsData.sheets.length > 1) {
        setAvailableSheets(sheetsData.sheets)
        setSelectedSheet("")
      } else {
        // Si solo hay una hoja o es CSV, procesar directamente
        const processedData = await processFile(file, sheetsData.sheets?.[0]?.name)
        console.log('Frontend received data (single sheet):', processedData)
        console.log('First row (single sheet):', processedData.rows[0])
        console.log('First row keys (single sheet):', processedData.rows[0] ? Object.keys(processedData.rows[0]) : 'No first row')
        console.log('First row values (single sheet):', processedData.rows[0] ? Object.values(processedData.rows[0]) : 'No first row')
        console.log('allRows from backend (single sheet):', processedData.allRows)
        console.log('allRows length (single sheet):', processedData.allRows ? processedData.allRows.length : 'No allRows')
        console.log('First allRow (single sheet):', processedData.allRows ? processedData.allRows[0] : 'No allRows')
        
        // Procesar allRows igual que en handleSheetSelect
        const allRowsWithStatus: RowWithStatus[] = []
        
        if (processedData.allRows) {
          // Usar los datos completos del backend
          console.log('Processing allRows from backend (single sheet)...')
          console.log('processedData.allRows length (single sheet):', processedData.allRows.length)
          console.log('First processedData.allRows item (single sheet):', processedData.allRows[0])
          
          processedData.allRows.forEach((row: any, index: number) => {
            // Log solo para las primeras 3 filas para debugging
            if (index < 3) {
              console.log(`Processing row ${index} (single sheet):`, row)
            }
            
            // Verificar si el objeto tiene las propiedades de estado
            if (row._isValid !== undefined) {
              // Caso 1: El objeto tiene propiedades de estado (_isValid, _errors, etc.)
              const { _isValid, _errors, _originalIndex, ...rowData } = row
              if (index < 3) {
                console.log(`Row ${index} (single sheet) - _isValid:`, _isValid, '_errors:', _errors, 'rowData:', rowData)
              }
              
              allRowsWithStatus.push({
                data: rowData,
                isValid: _isValid,
                errors: _errors || [],
                index: index
              })
            } else {
              // Caso 2: El objeto solo tiene datos (sin propiedades de estado)
              // Asumir que es válido si no hay errores explícitos
              if (index < 3) {
                console.log(`Row ${index} (single sheet) - No _isValid property, assuming valid`)
              }
              
              allRowsWithStatus.push({
                data: row,
                isValid: true, // Asumir válido si no hay propiedades de estado
                errors: [],
                index: index
              })
            }
          })
          
          console.log('Finished processing allRows (single sheet). allRowsWithStatus length:', allRowsWithStatus.length)
        } else {
          // Fallback: crear lista desde datos válidos y errores (método anterior)
          processedData.rows.forEach((row: any, index: number) => {
            allRowsWithStatus.push({
              data: row,
              isValid: true,
              errors: [],
              index: index
            })
          })
          
          if (processedData.errors && processedData.errors.length > 0) {
            processedData.errors.forEach((error: string, errorIndex: number) => {
              const match = error.match(/Fila (\d+):/)
              if (match) {
                const rowNumber = parseInt(match[1]) - 2
                if (rowNumber >= 0 && rowNumber < processedData.totalRows) {
                  allRowsWithStatus.push({
                    data: {},
                    isValid: false,
                    errors: [error],
                    index: processedData.rows.length + errorIndex
                  })
                }
              }
            })
          }
        }
        
        console.log('allRowsWithStatus created (single sheet):', allRowsWithStatus)
        console.log('allRowsWithStatus length (single sheet):', allRowsWithStatus.length)
        console.log('First allRowsWithStatus item (single sheet):', allRowsWithStatus[0])
        console.log('Valid rows count (single sheet):', allRowsWithStatus.filter(row => row.isValid).length)
        console.log('Invalid rows count (single sheet):', allRowsWithStatus.filter(row => !row.isValid).length)
        
        setAllRows(allRowsWithStatus)
        
        // Seleccionar automáticamente solo los registros válidos
        const validRowIndices = new Set(
          allRowsWithStatus
            .filter(row => row.isValid)
            .map(row => row.index)
        )
        console.log('Valid row indices (single sheet):', Array.from(validRowIndices))
        setSelectedRows(validRowIndices)
        
        setImportData(processedData)
        setAvailableSheets([])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el archivo",
        variant: "destructive"
      })
    }
  }

  // Manejar selección de hoja
  const handleSheetSelect = async (sheetName: string) => {
    console.log('handleSheetSelect called with sheetName:', sheetName)
    if (!importFile) {
      console.log('No importFile, returning')
      return
    }
    
    console.log('Setting selectedSheet to:', sheetName)
    setSelectedSheet(sheetName)
    
    try {
      console.log('Calling processFile...')
      const processedData = await processFile(importFile, sheetName)
      console.log('Frontend received data:', processedData)
      console.log('First row:', processedData.rows[0])
      console.log('First row keys:', processedData.rows[0] ? Object.keys(processedData.rows[0]) : 'No first row')
      console.log('First row values:', processedData.rows[0] ? Object.values(processedData.rows[0]) : 'No first row')
      console.log('allRows from backend:', processedData.allRows)
      console.log('allRows length:', processedData.allRows ? processedData.allRows.length : 'No allRows')
      console.log('First allRow:', processedData.allRows ? processedData.allRows[0] : 'No allRows')
      
      // Usar los datos reales del backend
      const allRowsWithStatus: RowWithStatus[] = []
      
      if (processedData.allRows) {
        // Usar los datos completos del backend
        console.log('Processing allRows from backend...')
        console.log('processedData.allRows length:', processedData.allRows.length)
        console.log('First processedData.allRows item:', processedData.allRows[0])
        
        // Procesar todos los elementos del backend
        console.log('Processing all rows from backend:', processedData.allRows.length)
        
        processedData.allRows.forEach((row: any, index: number) => {
          // Log solo para las primeras 3 filas para debugging
          if (index < 3) {
            console.log(`Processing row ${index}:`, row)
          }
          
          // Verificar si el objeto tiene las propiedades de estado
          if (row._isValid !== undefined) {
            // Caso 1: El objeto tiene propiedades de estado (_isValid, _errors, etc.)
            const { _isValid, _errors, _originalIndex, ...rowData } = row
            if (index < 3) {
              console.log(`Row ${index} - _isValid:`, _isValid, '_errors:', _errors, 'rowData:', rowData)
            }
            
            allRowsWithStatus.push({
              data: rowData,
              isValid: _isValid,
              errors: _errors || [],
              index: index
            })
          } else {
            // Caso 2: El objeto solo tiene datos (sin propiedades de estado)
            // Asumir que es válido si no hay errores explícitos
            if (index < 3) {
              console.log(`Row ${index} - No _isValid property, assuming valid`)
            }
            
            allRowsWithStatus.push({
              data: row,
              isValid: true, // Asumir válido si no hay propiedades de estado
              errors: [],
              index: index
            })
          }
        })
        
        console.log('Finished processing allRows. allRowsWithStatus length:', allRowsWithStatus.length)
        console.log('First allRowsWithStatus item:', allRowsWithStatus[0])
      } else {
        // Fallback: crear lista desde datos válidos y errores (método anterior)
        processedData.rows.forEach((row: any, index: number) => {
          allRowsWithStatus.push({
            data: row,
            isValid: true,
            errors: [],
            index: index
          })
        })
        
        if (processedData.errors && processedData.errors.length > 0) {
          processedData.errors.forEach((error: string, errorIndex: number) => {
            const match = error.match(/Fila (\d+):/)
            if (match) {
              const rowNumber = parseInt(match[1]) - 2
              if (rowNumber >= 0 && rowNumber < processedData.totalRows) {
                allRowsWithStatus.push({
                  data: {},
                  isValid: false,
                  errors: [error],
                  index: processedData.rows.length + errorIndex
                })
              }
            }
          })
        }
      }
      
      console.log('allRowsWithStatus created:', allRowsWithStatus)
      console.log('allRowsWithStatus length:', allRowsWithStatus.length)
      console.log('First allRowsWithStatus item:', allRowsWithStatus[0])
      console.log('Valid rows count:', allRowsWithStatus.filter(row => row.isValid).length)
      console.log('Invalid rows count:', allRowsWithStatus.filter(row => !row.isValid).length)
      
      setAllRows(allRowsWithStatus)
      
      // Seleccionar automáticamente solo los registros válidos
      const validRowIndices = new Set(
        allRowsWithStatus
          .filter(row => row.isValid)
          .map(row => row.index)
      )
      console.log('Valid row indices:', Array.from(validRowIndices))
      setSelectedRows(validRowIndices)
      
      setImportData(processedData)
    } catch (error) {
      console.error('Error in handleSheetSelect:', error)
      console.error('Error details:', error)
      toast({
        title: "Error",
        description: "No se pudo procesar la hoja seleccionada",
        variant: "destructive"
      })
    }
  }

  // Manejar selección de filas
  const toggleRowSelection = (index: number) => {
    const newSelection = new Set(selectedRows)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedRows(newSelection)
  }

  const selectAllValid = () => {
    const validIndices = allRows
      .filter(row => row.isValid)
      .map(row => row.index)
    setSelectedRows(new Set(validIndices))
  }

  const selectAll = () => {
    const allIndices = allRows.map(row => row.index)
    setSelectedRows(new Set(allIndices))
  }

  const deselectAll = () => {
    setSelectedRows(new Set())
  }

  const selectAllErrors = () => {
    const errorIndices = allRows
      .filter(row => !row.isValid)
      .map(row => row.index)
    setSelectedRows(new Set(errorIndices))
  }

  const deselectValid = () => {
    const validIndices = allRows
      .filter(row => row.isValid)
      .map(row => row.index)
    const newSelection = new Set(selectedRows)
    validIndices.forEach(index => newSelection.delete(index))
    setSelectedRows(newSelection)
  }

  const deselectErrors = () => {
    const errorIndices = allRows
      .filter(row => !row.isValid)
      .map(row => row.index)
    const newSelection = new Set(selectedRows)
    errorIndices.forEach(index => newSelection.delete(index))
    setSelectedRows(newSelection)
  }

  // Confirmar importación
  const confirmImport = async () => {
    if (!importData) return
    
    // Filtrar los registros seleccionados (tanto válidos como con errores)
    const selectedRowsData = allRows
      .filter(row => selectedRows.has(row.index))
      .map(row => row.data)
    
    if (selectedRowsData.length === 0) {
      toast({
        title: "Sin registros seleccionados",
        description: "Selecciona al menos un registro para importar",
        variant: "destructive"
      })
      return
    }
    
    const validSelectedCount = allRows.filter(row => selectedRows.has(row.index) && row.isValid).length
    const errorSelectedCount = allRows.filter(row => selectedRows.has(row.index) && !row.isValid).length
    
    setIsImporting(true)
    try {
      const response = await fetch('/api/contable/import/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: selectedRowsData,
          type: activeSection
        }),
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Error al importar los datos')
      }

      let successMessage = `${selectedRowsData.length} registros importados correctamente`
      if (errorSelectedCount > 0) {
        successMessage += ` (${validSelectedCount} válidos + ${errorSelectedCount} con errores)`
      }

      toast({
        title: "Éxito",
        description: successMessage
      })

      // Recargar datos
      await fetchData()
      
      // Cerrar diálogo
      setShowImportDialog(false)
      setImportFile(null)
      setImportData(null)
      setAvailableSheets([])
      setSelectedSheet("")
      setAllRows([])
      setSelectedRows(new Set())
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron importar los datos",
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Calcular totales para cada módulo usando datos filtrados en tiempo real
  const calculateTotals = () => {
    if (activeSection === 'gastos') {
      // Usar datos filtrados (currentPayrollData contiene los datos filtrados)
      const dataToUse = currentPayrollData.length > 0 ? currentPayrollData : payrollData
      const total = dataToUse.reduce((sum, row) => {
        const value = Number(row.total) || 0
        return sum + value
      }, 0)
      return { total, label: 'Total Gastos' }
    } else if (activeSection === 'facturacion') {
      // Usar datos filtrados (currentExpenseData contiene los datos filtrados)
      const dataToUse = currentExpenseData.length > 0 ? currentExpenseData : expenseData
      const total = dataToUse.reduce((sum, row) => {
        const value = Number(row.total) || 0
        return sum + value
      }, 0)
      return { total, label: 'Total Facturación' }
    } else if (activeSection === 'bancos') {
      // Usar datos filtrados (currentTransferData contiene los datos filtrados)
      const dataToUse = currentTransferData.length > 0 ? currentTransferData : transferData
      const totalEntra = dataToUse.reduce((sum, row) => {
        const value = Number(row.entra) || 0
        return sum + value
      }, 0)
      const totalSale = dataToUse.reduce((sum, row) => {
        const value = Number(row.sale) || 0
        return sum + value
      }, 0)
      return { 
        totalEntra, 
        totalSale, 
        label: 'Bancos',
        isTransfer: true 
      }
    }
    return { total: 0, label: '' }
  }

  // Guardar datos de nómina
  const savePayrollData = async (data: any[]) => {
    try {
      const response = await fetch('/api/contable/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar datos')
      }

      const result = await response.json()
      setPayrollData(result.data)
      setHasChanges(false)
      return result
    } catch (error) {
      console.error("Error saving payroll data:", error)
      throw error
    }
  }

  // Eliminar registro de nómina
  const deletePayrollRecord = async (id: number) => {
    try {
      const response = await fetch(`/api/contable/payroll?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar registro')
      }

      return await response.json()
    } catch (error) {
      console.error("Error deleting payroll record:", error)
      throw error
    }
  }

  // Guardar datos de gastos
  const saveExpenseData = async (data: any[]) => {
    try {
      const response = await fetch('/api/contable/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar datos')
      }

      const result = await response.json()
      setExpenseData(result.data)
      setHasChanges(false)
      return result
    } catch (error) {
      console.error("Error saving expense data:", error)
      throw error
    }
  }

  // Eliminar registro de gastos
  const deleteExpenseRecord = async (id: number) => {
    try {
      const response = await fetch(`/api/contable/expenses?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar registro')
      }

      return await response.json()
    } catch (error) {
      console.error("Error deleting expense record:", error)
      throw error
    }
  }

  // Guardar datos de transferencias
  const saveTransferData = async (data: any[]) => {
    try {
      const response = await fetch('/api/contable/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar datos')
      }

      const result = await response.json()
      setTransferData(result.data)
      setHasChanges(false)
      return result
    } catch (error) {
      console.error("Error saving transfer data:", error)
      throw error
    }
  }

  // Eliminar registro de transferencias
  const deleteTransferRecord = async (id: number) => {
    try {
      const response = await fetch(`/api/contable/transfers?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar registro')
      }

      return await response.json()
    } catch (error) {
      console.error("Error deleting transfer record:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="space-y-6 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">Error: No se pudo cargar la información del usuario</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          {/* Sidebar Navigation */}
          <div className="xl:col-span-1">
            <Card className="p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Calculator className="h-3 w-3" />
                  <h3 className="text-sm font-semibold">Módulos</h3>
                </div>
                <p className="text-xs text-gray-600">Selecciona el módulo</p>
                
                {/* Botón Volver y Título - MOVIDO ARRIBA */}
                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWithConfirmation('/inicio')}
                    className="w-full justify-start text-xs h-7 px-2"
                  >
                    <ArrowLeft className="h-3 w-3 mr-1.5" />
                    Volver
                  </Button>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Módulo Contable</h2>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Button
                    variant={activeSection === 'gastos' ? 'default' : 'outline'}
                    className="w-full justify-start text-xs h-7 px-2"
                    onClick={() => handleModuleChange('gastos')}
                  >
                    <Users className="h-3 w-3 mr-1.5" />
                    Libro Gastos Mes a Mes
                  </Button>
                  <Button
                    variant={activeSection === 'facturacion' ? 'default' : 'outline'}
                    className="w-full justify-start text-xs h-7 px-2"
                    onClick={() => handleModuleChange('facturacion')}
                  >
                    <FileText className="h-3 w-3 mr-1.5" />
                    Facturación
                  </Button>
                  <Button
                    variant={activeSection === 'bancos' ? 'default' : 'outline'}
                    className="w-full justify-start text-xs h-7 px-2"
                    onClick={() => handleModuleChange('bancos')}
                  >
                    <Calculator className="h-3 w-3 mr-1.5" />
                    Bancos
                  </Button>
                </div>
                
                {/* Botón de Importar - Parte inferior */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportDialog(true)}
                    className="w-full justify-start text-xs h-7 px-2"
                    disabled={!activeSection}
                  >
                    <Upload className="h-3 w-3 mr-1.5" />
                    Importar Excel/CSV
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-4">
            <Card className="relative">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    {/* Sin títulos redundantes */}
                  </div>
                  
                </div>
              </CardHeader>
              
              {/* Totales del mes seleccionado - Overlay absoluto fuera del CardHeader */}
              {selectedYear && selectedMonth && (
                <div className="absolute top-4 right-4 z-10 flex gap-3">
                  {(() => {
                    const totals = calculateTotals()
                    
                    if (totals.isTransfer) {
                      return (
                        <>
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg shadow-xl min-w-[130px] backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium opacity-90">
                                  Total Entra {hasActiveFilters && <span className="text-blue-200">(Filtrado)</span>}
                                </p>
                                <p className="text-sm font-bold">{formatCurrency(totals.totalEntra)}</p>
                              </div>
                              <div className="bg-blue-400 bg-opacity-30 p-1.5 rounded-full">
                                <ArrowLeft className="h-3 w-3" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-3 rounded-lg shadow-xl min-w-[130px] backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium opacity-90">
                                  Total Sale {hasActiveFilters && <span className="text-gray-200">(Filtrado)</span>}
                                </p>
                                <p className="text-sm font-bold">{formatCurrency(totals.totalSale)}</p>
                              </div>
                              <div className="bg-gray-500 bg-opacity-30 p-1.5 rounded-full">
                                <ArrowLeft className="h-3 w-3 rotate-180" />
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-slate-500 to-slate-600 text-white p-3 rounded-lg shadow-xl min-w-[130px] backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-medium opacity-90">
                                  Diferencia {hasActiveFilters && <span className="text-slate-200">(Filtrado)</span>}
                                </p>
                                <p className={`text-sm font-bold ${totals.totalEntra - totals.totalSale >= 0 ? 'text-blue-200' : 'text-gray-200'}`}>
                                  {formatCurrency(totals.totalEntra - totals.totalSale)}
                                </p>
                              </div>
                              <div className="bg-slate-400 bg-opacity-30 p-1.5 rounded-full">
                                <Calculator className="h-3 w-3" />
                              </div>
                            </div>
                          </div>
                        </>
                      )
                    } else {
                      return (
                        <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white p-3 rounded-lg shadow-xl min-w-[180px] backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-medium opacity-90">
                                {totals.label} {hasActiveFilters && <span className="text-slate-200">(Filtrado)</span>}
                              </p>
                              <p className="text-lg font-bold">{formatCurrency(totals.total || 0)}</p>
                              <p className="text-xs opacity-75">{selectedMonth} {selectedYear}</p>
                            </div>
                            <div className="bg-slate-500 bg-opacity-30 p-2 rounded-full">
                              <Calculator className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      )
                    }
                  })()}
                </div>
              )}
              
              <CardContent className="space-y-4">
                {/* Year Selector con Acciones */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Seleccionar Año</h3>
                  <div className="flex items-center gap-4">
                    {/* Selector de años */}
                    <div className="flex items-center gap-2">
                      {/* Botón para retroceder año */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigateToPreviousYear}
                        className="h-7 w-7 p-0"
                        title="Año anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {/* Años disponibles (dinámicos) */}
                      <div className="flex gap-1.5">
                        {generateYears(centerYear).map((year) => (
                      <Button
                        key={year}
                        variant={selectedYear === year ? 'default' : 'outline'}
                        size="sm"
                            className="text-xs h-7 px-2 min-w-[60px]"
                        onClick={() => handleYearSelect(year)}
                      >
                        {year}
                      </Button>
                    ))}
                      </div>
                      
                      {/* Botón para avanzar año */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={navigateToNextYear}
                        className="h-7 w-7 p-0"
                        title="Año siguiente"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Acciones (solo iconos) - DESPUÉS del selector - Solo cuando hay tabla visible */}
                    {selectedYear && selectedMonth && (
                      <div className="flex items-center gap-3 ml-4">
                        {/* Mostrar/Ocultar Filtros */}
                        <Button
                          variant={showFilters ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                          className="h-7 w-10 p-0"
                          title={showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                        >
                          <Filter className="h-4 w-4" />
                        </Button>

                        {/* Agregar Fila */}
                        <Button
                          size="sm"
                          onClick={addRow}
                          disabled={isSaving}
                          className="h-7 w-10 p-0"
                          title="Agregar Fila"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>

                        {/* Guardar (solo si hay cambios) */}
                        {hasChanges && (
                          <Button
                            onClick={saveChanges}
                            size="sm"
                            variant="default"
                            disabled={isSaving}
                            className="h-7 w-10 p-0"
                            title={isSaving ? 'Guardando...' : 'Guardar'}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Cerrar */}
                        <Button
                          onClick={handleCancel}
                          size="sm"
                          variant="outline"
                          className="h-7 w-10 p-0"
                          title="Cerrar"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Month Selector - MOVIDO ARRIBA */}
                {selectedYear && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Seleccionar Mes</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {availableMonths.map((month) => (
                        <Button
                          key={month}
                          variant={selectedMonth === month ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs h-7 px-2"
                          onClick={() => handleMonthSelect(month)}
                        >
                          {month}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Table - SIEMPRE VISIBLE */}
                <div>
                  
                  {!selectedYear || !selectedMonth ? (
                    <div className="border rounded-lg overflow-hidden min-h-[320px] bg-gray-50 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Selecciona un año y mes para ver los datos</p>
                      </div>
                    </div>
                  ) : dataLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <SimpleDataGrid
                      ref={simpleDataGridRef}
                      data={activeSection === 'gastos' ? payrollData : 
                            activeSection === 'facturacion' ? expenseData : 
                            transferData}
                      onSave={activeSection === 'gastos' ? savePayrollData : 
                             activeSection === 'facturacion' ? saveExpenseData : 
                             saveTransferData}
                      onDelete={activeSection === 'gastos' ? deletePayrollRecord : 
                               activeSection === 'facturacion' ? deleteExpenseRecord : 
                               deleteTransferRecord}
                      onCancel={() => {
                        setSelectedYear(null)
                        setSelectedMonth(null)
                        setPayrollData([])
                        setExpenseData([])
                        setTransferData([])
                        setCurrentPayrollData([])
                        setCurrentExpenseData([])
                        setCurrentTransferData([])
                        setHasChanges(false)
                      }}
                      onUnsavedChangesChange={setHasChanges}
                      onDataChange={handleDataChange}
                      onFiltersActiveChange={handleFiltersActiveChange}
                      year={selectedYear}
                      mes={selectedMonth}
                      type={activeSection === 'gastos' ? 'payroll' : 
                            activeSection === 'facturacion' ? 'expenses' : 
                            'transfers'}
                      // Pasar estados y funciones para los botones externos
                      showFilters={showFilters}
                      setShowFilters={setShowFilters}
                      isSaving={isSaving}
                      setIsSaving={setIsSaving}
                      hasChanges={hasChanges}
                      setHasChanges={setHasChanges}
                      addRow={addRow}
                      saveChanges={saveChanges}
                      handleCancel={handleCancel}
                    />
                  )}
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Diálogo de confirmación para cambios sin guardar */}
      <DiscardChangesDialog
        open={showDiscardDialog}
        onOpenChange={cancelDiscard}
        onConfirm={confirmDiscard}
        onCancel={cancelDiscard}
      />

      {/* Diálogo de Importación */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Importar Datos - {activeSection === 'gastos' ? 'Libro Gastos' : 
                               activeSection === 'facturacion' ? 'Facturación' : 'Bancos'}
            </DialogTitle>
            <DialogDescription>
              Importa datos desde un archivo Excel (.xlsx) o CSV. Las fechas en el archivo determinarán automáticamente el año y mes de destino.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Paso 1: Selección de archivo */}
            {!importFile && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Seleccionar archivo</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Sube un archivo Excel (.xlsx) o CSV con los datos a importar
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar archivo
                  </label>
                </div>
              </div>
            )}

            {/* Paso 2: Selección de hoja (si aplica) */}
            {importFile && availableSheets.length > 0 && !selectedSheet && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Seleccionar hoja</h3>
                <p className="text-sm text-gray-600">
                  El archivo contiene múltiples hojas. Selecciona cuál procesar:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {availableSheets.map((sheet) => (
                    <Button
                      key={sheet.name}
                      variant="outline"
                      onClick={() => handleSheetSelect(sheet.name)}
                      className="justify-start h-auto p-4"
                    >
                      <div className="text-left">
                        <div className="font-medium">{sheet.name}</div>
                        <div className="text-sm text-gray-500">
                          {sheet.rows} filas, {sheet.columns.length} columnas
                        </div>
                        <div className="text-xs text-gray-400">
                          Columnas: {sheet.columns.slice(0, 3).join(', ')}
                          {sheet.columns.length > 3 && '...'}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 3: Vista previa y resumen */}
            {importData && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vista previa de datos</h3>
                
                {/* Resumen */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600">Total filas</div>
                    <div className="text-lg font-semibold text-blue-900">{importData.totalRows}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600">Válidas</div>
                    <div className="text-lg font-semibold text-green-900">{importData.validRows}</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-red-600">Con errores</div>
                    <div className="text-lg font-semibold text-red-900">{importData.invalidRows}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600">Advertencias</div>
                    <div className="text-lg font-semibold text-purple-900">{importData.warnings.length}</div>
                  </div>
                </div>


                {/* Tabla de registros con errores */}
                {allRows.filter(row => !row.isValid).length > 0 && (
                  <div className="border rounded-lg overflow-hidden border-red-200">
                    <div className="bg-red-50 px-4 py-2 text-sm font-medium flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span>Registros con errores ({allRows.filter(row => !row.isValid).length})</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto max-h-80">
                      <TooltipProvider>
                        <table className="w-full text-sm">
                          <thead className="bg-red-100 sticky top-0">
                            <tr>
                              <th className="px-2 py-2 text-center font-medium border-r w-12">
                                <CheckSquare className="h-4 w-4 mx-auto" />
                              </th>
                              <th className="px-3 py-2 text-left font-medium border-r">#</th>
                              <th className="px-3 py-2 text-left font-medium border-r">Errores</th>
                              {(() => {
                                // Obtener todas las columnas únicas de todos los registros
                                const allColumns = new Set<string>()
                                allRows.forEach(row => {
                                  if (row.data && typeof row.data === 'object') {
                                    Object.keys(row.data).forEach(key => allColumns.add(key))
                                  }
                                })
                                return Array.from(allColumns).map((key) => (
                                  <th key={key} className="px-3 py-2 text-left font-medium border-r">
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                  </th>
                                ))
                              })()}
                            </tr>
                          </thead>
                          <tbody>
                            {allRows.filter(row => !row.isValid).map((rowWithStatus, index) => (
                              <tr 
                                key={index} 
                                className={`border-t hover:bg-red-50 ${
                                  selectedRows.has(rowWithStatus.index) ? 'bg-blue-50' : ''
                                }`}
                              >
                                <td className="px-2 py-2 text-center border-r">
                                  <button
                                    onClick={() => toggleRowSelection(rowWithStatus.index)}
                                    className="hover:bg-gray-200 rounded p-1"
                                  >
                                    {selectedRows.has(rowWithStatus.index) ? (
                                      <CheckSquare className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <Square className="h-4 w-4 text-gray-400" />
                                    )}
                                  </button>
                                </td>
                                <td className="px-3 py-2 text-center font-medium text-gray-600 border-r">
                                  {index + 1}
                                </td>
                                <td className="px-3 py-2 text-center border-r">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        {rowWithStatus.errors.length} error{rowWithStatus.errors.length > 1 ? 'es' : ''}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="max-w-xs">
                                        <p className="font-medium mb-1">Errores encontrados:</p>
                                        <ul className="text-xs space-y-1">
                                          {rowWithStatus.errors.map((error: string, errorIndex: number) => (
                                            <li key={errorIndex}>• {error}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </td>
                                {(() => {
                                  // Obtener todas las columnas únicas de todos los registros
                                  const allColumns = new Set<string>()
                                  allRows.forEach(row => {
                                    if (row.data && typeof row.data === 'object') {
                                      Object.keys(row.data).forEach(key => allColumns.add(key))
                                    }
                                  })
                                  
                                  return Array.from(allColumns).map((key, cellIndex) => {
                                    const value = rowWithStatus.data && rowWithStatus.data[key] !== undefined 
                                      ? rowWithStatus.data[key] 
                                      : null
                                    
                                    return (
                                      <td key={cellIndex} className="px-3 py-2 border-r">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <div className="max-w-32 truncate cursor-help">
                                              {key.includes('fecha') ? (
                                                <span className="text-blue-600 font-medium">
                                                  {String(value || '')}
                                                </span>
                                              ) : typeof value === 'number' && !key.includes('year') && !key.includes('mes') ? (
                                                <span className="text-green-600 font-medium">
                                                  {formatCurrency(value || 0)}
                                                </span>
                                              ) : (
                                                <span className="text-gray-800">
                                                  {String(value || '')}
                                                </span>
                                              )}
                                            </div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <div className="max-w-xs">
                                              <p className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}</p>
                                              <p className="text-sm">{String(value || '')}</p>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </td>
                                    )
                                  })
                                })()}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </TooltipProvider>
                    </div>
                  </div>
                )}

                {importData.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium mb-2 flex items-center justify-between">
                        <span>Advertencias ({importData.warnings.length})</span>
                        <span className="text-xs text-gray-500">Estos registros SÍ se importarán</span>
                      </div>
                      <div className="max-h-40 overflow-y-auto bg-yellow-50 p-2 rounded border">
                        <ul className="text-sm space-y-1">
                          {importData.warnings.map((warning, index) => (
                            <li key={index} className="text-yellow-700">• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Controles de selección */}
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Seleccionar registros para importar</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllValid}
                        className="text-xs"
                      >
                        Solo válidos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllErrors}
                        className="text-xs"
                      >
                        Solo errores
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAll}
                        className="text-xs"
                      >
                        Todos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectValid}
                        className="text-xs"
                      >
                        Quitar válidos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectErrors}
                        className="text-xs"
                      >
                        Quitar errores
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deselectAll}
                        className="text-xs"
                      >
                        Ninguno
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{selectedRows.size}</span> de <span className="font-medium">{allRows.length}</span> registros seleccionados
                    {allRows.filter(row => row.isValid).length > 0 && (
                      <span className="ml-2">
                        ({allRows.filter(row => row.isValid && selectedRows.has(row.index)).length} válidos)
                      </span>
                    )}
                    {allRows.filter(row => !row.isValid).length > 0 && (
                      <span className="ml-2 text-red-600">
                        ({allRows.filter(row => !row.isValid && selectedRows.has(row.index)).length} con errores)
                      </span>
                    )}
                  </div>
                </div>

                {/* Vista previa de datos con selección */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 text-sm font-medium flex justify-between items-center">
                    <span>Vista previa de datos a importar</span>
                    <span className="text-gray-600">
                      {allRows.filter(row => row.isValid).length} válidos, {allRows.filter(row => !row.isValid).length} con errores
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-96">
                    <TooltipProvider>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-2 py-2 text-center font-medium border-r w-12">
                              <CheckSquare className="h-4 w-4 mx-auto" />
                            </th>
                            <th className="px-3 py-2 text-left font-medium border-r">#</th>
                            <th className="px-3 py-2 text-left font-medium border-r">Estado</th>
                            {(() => {
                              // Obtener todas las columnas únicas de todos los registros
                              const allColumns = new Set<string>()
                              allRows.forEach(row => {
                                if (row.data && typeof row.data === 'object') {
                                  Object.keys(row.data).forEach(key => allColumns.add(key))
                                }
                              })
                              return Array.from(allColumns).map((key) => (
                                <th key={key} className="px-3 py-2 text-left font-medium border-r">
                                  {key.replace(/_/g, ' ').toUpperCase()}
                                </th>
                              ))
                            })()}
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            console.log('Rendering table with allRows:', allRows)
                            console.log('allRows length in render:', allRows.length)
                            console.log('First allRow in render:', allRows[0])
                            return null
                          })()}
                          {allRows.slice(0, 20).map((rowWithStatus, index) => (
                            <tr 
                              key={index} 
                              className={`border-t hover:bg-gray-50 ${
                                !rowWithStatus.isValid ? 'bg-red-50' : ''
                              } ${
                                selectedRows.has(rowWithStatus.index) ? 'bg-blue-50' : ''
                              }`}
                            >
                              <td className="px-2 py-2 text-center border-r">
                                <button
                                  onClick={() => toggleRowSelection(rowWithStatus.index)}
                                  className="hover:bg-gray-200 rounded p-1"
                                  disabled={!rowWithStatus.isValid}
                                >
                                  {selectedRows.has(rowWithStatus.index) ? (
                                    <CheckSquare className="h-4 w-4 text-blue-600" />
                                  ) : (
                                    <Square className="h-4 w-4 text-gray-400" />
                                  )}
                                </button>
                              </td>
                              <td className="px-3 py-2 text-center font-medium text-gray-600 border-r">
                                {index + 1}
                              </td>
                              <td className="px-3 py-2 text-center border-r">
                                {rowWithStatus.isValid ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Válido
                                  </span>
                                ) : (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Error
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="max-w-xs">
                                        <p className="font-medium mb-1">Errores encontrados:</p>
                                        <ul className="text-xs space-y-1">
                                          {rowWithStatus.errors.map((error: string, errorIndex: number) => (
                                            <li key={errorIndex}>• {error}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </td>
                              {(() => {
                                // Obtener todas las columnas únicas de todos los registros
                                const allColumns = new Set<string>()
                                allRows.forEach(row => {
                                  if (row.data && typeof row.data === 'object') {
                                    Object.keys(row.data).forEach(key => allColumns.add(key))
                                  }
                                })
                                
                                return Array.from(allColumns).map((key, cellIndex) => {
                                  const value = rowWithStatus.data && rowWithStatus.data[key] !== undefined 
                                    ? rowWithStatus.data[key] 
                                    : null
                                  
                                  return (
                                    <td key={cellIndex} className="px-3 py-2 border-r">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="max-w-32 truncate cursor-help">
                                            {key.includes('fecha') ? (
                                              <span className="text-blue-600 font-medium">
                                                {String(value || '')}
                                              </span>
                                            ) : typeof value === 'number' && !key.includes('year') && !key.includes('mes') ? (
                                              <span className="text-green-600 font-medium">
                                                {formatCurrency(value || 0)}
                                              </span>
                                            ) : (
                                              <span className="text-gray-800">
                                                {String(value || '')}
                                              </span>
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="max-w-xs">
                                            <p className="font-medium">{key.replace(/_/g, ' ').toUpperCase()}</p>
                                            <p className="text-sm">{String(value || '')}</p>
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </td>
                                  )
                                })
                              })()}
                            </tr>
                          ))}
                          {allRows.length > 20 && (
                            <tr className="bg-gray-50">
                              <td colSpan={(() => {
                                const allColumns = new Set<string>()
                                allRows.forEach(row => {
                                  if (row.data && typeof row.data === 'object') {
                                    Object.keys(row.data).forEach(key => allColumns.add(key))
                                  }
                                })
                                return allColumns.size + 3 // +3 para checkbox, #, y estado
                              })()} className="px-3 py-2 text-center text-gray-600 italic">
                                ... y {allRows.length - 20} registros más
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Resumen detallado por período */}
                {importData.summary.uniqueValues && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-blue-900">Resumen por Período</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border">
                        <div className="text-gray-600">Años detectados:</div>
                        <div className="font-semibold text-lg text-blue-600">
                          {importData.summary.uniqueValues['Años únicos'] || 0}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-gray-600">Meses detectados:</div>
                        <div className="font-semibold text-lg text-blue-600">
                          {importData.summary.uniqueValues['Meses únicos'] || 0}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="text-gray-600">Total importado:</div>
                        <div className="font-semibold text-lg text-green-600">
                          {formatCurrency(importData.summary.totalAmount || 0)}
                        </div>
                      </div>
                    </div>
                    {importData.summary.dateRange && importData.summary.dateRange.from && (
                      <div className="mt-3 text-sm bg-white p-2 rounded border">
                        <span className="text-gray-600">Rango de fechas:</span>
                        <span className="ml-2 font-medium text-blue-600">
                          {importData.summary.dateRange.from} - {importData.summary.dateRange.to}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Indicador de procesamiento */}
            {isProcessingFile && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Procesando archivo...</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false)
                setImportFile(null)
                setImportData(null)
                setAvailableSheets([])
                setSelectedSheet("")
                setAllRows([])
                setSelectedRows(new Set())
              }}
            >
              Cancelar
            </Button>
            {importData && selectedRows.size > 0 && (
              <Button
                onClick={confirmImport}
                disabled={isImporting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Importar {selectedRows.size} registros seleccionados
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Loading component for Suspense fallback
function ContableLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function ContablePage() {
  return (
    <Suspense fallback={<ContableLoading />}>
      <ContableContent />
    </Suspense>
  )
}