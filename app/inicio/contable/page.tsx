"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Calculator, FileText, Calendar, Users } from "lucide-react"
import { SimpleDataGrid } from "@/components/contable/simple-data-grid"

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
  empleado: string
  concepto: string
  debe: number
  haber: number
  saldo: number
}

interface ExpenseData {
  id: number
  year: number
  mes: string
  fecha: string
  proveedor_cliente: string
  objeto: string
  nit: string
  valor: number
  iva: number
  total: number
}

function ContableContent() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'nomina' | 'gastos'>('nomina')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [payrollData, setPayrollData] = useState<PayrollData[]>([])
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([])
  const [dataLoading, setDataLoading] = useState(false)

  // Años disponibles (estáticos)
  const availableYears = [2023, 2024, 2025, 2026, 2027]
  
  // Meses disponibles (estáticos)
  const availableMonths = [
    'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
  ]

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
      if (activeSection === 'nomina') {
        const response = await fetch(`/api/contable/payroll?year=${selectedYear}&mes=${selectedMonth}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setPayrollData(data.data || [])
        }
      } else {
        const response = await fetch(`/api/contable/expenses?year=${selectedYear}&mes=${selectedMonth}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setExpenseData(data.data || [])
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  const handleYearSelect = (year: number) => {
    setSelectedYear(year)
    setSelectedMonth(null) // Reset month when year changes
    setPayrollData([])
    setExpenseData([])
  }

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
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
        throw new Error('Error al guardar datos')
      }

      const result = await response.json()
      setPayrollData(result.data)
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
        throw new Error('Error al guardar datos')
      }

      const result = await response.json()
      setExpenseData(result.data)
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
            onClick={() => router.push('/inicio')}
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
                    variant={activeSection === 'nomina' ? 'default' : 'outline'}
                    className="w-full justify-start text-xs h-7 px-2"
                    onClick={() => setActiveSection('nomina')}
                  >
                    <Users className="h-3 w-3 mr-1.5" />
                    Libro de Mes a Mes
                  </Button>
                  <Button
                    variant={activeSection === 'gastos' ? 'default' : 'outline'}
                    className="w-full justify-start text-xs h-7 px-2"
                    onClick={() => setActiveSection('gastos')}
                  >
                    <FileText className="h-3 w-3 mr-1.5" />
                    Libro de Gastos / Facturación
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  {activeSection === 'nomina' ? 'Libro de Mes a Mes' : 'Libro de Gastos / Facturación'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {activeSection === 'nomina' 
                    ? 'Liquidaciones de nómina por período' 
                    : 'Gastos y facturación por período'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Year Selector */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Seleccionar Año</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {availableYears.map((year) => (
                      <Button
                        key={year}
                        variant={selectedYear === year ? 'default' : 'outline'}
                        size="sm"
                        className="text-xs h-7 px-2"
                        onClick={() => handleYearSelect(year)}
                      >
                        {year}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Data Table - SIEMPRE VISIBLE */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Tabla: {activeSection === 'nomina' ? 'Libro de Mes a Mes' : 'Libro de Gastos / Facturación'}
                  </h3>
                  
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
                      data={activeSection === 'nomina' ? payrollData : expenseData}
                      onSave={activeSection === 'nomina' ? savePayrollData : saveExpenseData}
                      onDelete={activeSection === 'nomina' ? deletePayrollRecord : deleteExpenseRecord}
                      onCancel={() => {
                        setSelectedYear(null)
                        setSelectedMonth(null)
                        setPayrollData([])
                        setExpenseData([])
                      }}
                      year={selectedYear}
                      mes={selectedMonth}
                      type={activeSection === 'nomina' ? 'payroll' : 'expenses'}
                    />
                  )}
                </div>

                {/* Month Selector - MOVIDO ABAJO */}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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