"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calculator, FileText, Calendar, Users, ChevronLeft, ChevronRight, Filter, Plus, Save, X } from "lucide-react"
import { SimpleDataGrid } from "@/components/contable/simple-data-grid"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { DiscardChangesDialog } from "@/components/ui/discard-changes-dialog"

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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWithConfirmation('/inicio')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Módulo Contable
            </h1>
            <p className="text-gray-600 mt-2">
              Gestión de nómina y gastos por período con edición en tiempo real
            </p>
          </div>
        </div>

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