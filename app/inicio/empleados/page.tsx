"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { EmployeesTable } from "@/components/employees/employees-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Edit, Trash2, MoreHorizontal, Plus, Search, Filter, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ROLE_CODES } from "@/lib/constants"
import { formatCurrency } from "@/lib/currency-utils"

interface User {
  id: number
  role: string
  email: string
}

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  document_number?: string
  position?: string
  salary?: number
  role_name: string
  contract_status_name: string
  profile_picture?: string
  is_active: boolean
  created_at: string
}

/**
 * Employees page - Employee management
 * Página de empleados - Gestión de empleados
 * 
 * Note: Authentication is handled by middleware, so we can trust that
 * the user is authenticated when this component renders
 */
export default function EmployeesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null)

  useEffect(() => {
    // Fetch user data and employees in parallel
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch user data and employees in parallel
        const [userResponse, employeesResponse] = await Promise.all([
          fetch('/api/auth/me', {
            method: 'GET',
            credentials: 'include'
          }),
          fetch('/api/employees', {
            method: 'GET',
            credentials: 'include'
          })
        ])
        
        // Handle user data
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser({
            id: userData.id,
            role: userData.role,
            email: userData.email
          })
        } else {
          console.error("Error fetching user data:", userResponse.status)
        }
        
        // Handle employees data
        if (employeesResponse.ok) {
          const data = await employeesResponse.json()
          console.log('Fetched employees data:', data.employees)
          setEmployees(data.employees || [])
        } else {
          console.error('Error response:', employeesResponse.status, employeesResponse.statusText)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched employees data:', data.employees)
        setEmployees(data.employees || [])
      } else {
        console.error('Error response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  // Use useMemo to optimize filtering and avoid unnecessary re-renders
  const filteredEmployees = useMemo(() => {
    let filtered = [...employees]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(employee => 
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.document_number?.includes(searchTerm)
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(employee => employee.role_name === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(employee => employee.contract_status_name === statusFilter)
    }

    return filtered
  }, [employees, searchTerm, roleFilter, statusFilter])

  const handleViewDetails = (employee: Employee) => {
    router.push(`/inicio/empleados/${employee.id}`)
  }

  const handleEdit = (employee: Employee) => {
    router.push(`/inicio/empleados/action?id=${employee.id}`)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Solo actualizar el estado si la petición fue exitosa
        setEmployees(prevEmployees => prevEmployees.filter(employee => employee.id !== id))
        console.log('Employee deleted successfully')
      } else {
        console.error('Error deleting employee:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      console.log('Toggling status for employee', id, 'from', currentStatus, 'to', !currentStatus)
      
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })
      
      if (response.ok) {
        // Solo actualizar el estado si la petición fue exitosa
        setEmployees(prevEmployees => 
          prevEmployees.map(employee => 
            employee.id === id 
              ? { ...employee, is_active: !currentStatus }
              : employee
          )
        )
        console.log('Status update successful')
      } else {
        console.error('Error response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error toggling employee status:', error)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setRoleFilter("all")
    setStatusFilter("all")
  }

  // Check if user can create employees (only ADMIN and HR)
  const canCreateEmployees = user?.role === ROLE_CODES.ADMIN || user?.role === ROLE_CODES.HR

  // Check if user can edit/delete employees
  const canManageEmployees = user?.role === ROLE_CODES.ADMIN || user?.role === ROLE_CODES.HR
  
  // Check if user can edit specific employee (prevent self-editing for admins)
  const canEditEmployee = (employee: Employee) => {
    if (!canManageEmployees) return false
    // Prevent admin from editing themselves
    if (user?.role === ROLE_CODES.ADMIN && employee.id === user.id) return false
    return true
  }

  // Check if user can delete specific employee
  const canDeleteEmployee = (employee: Employee) => {
    if (!canManageEmployees) return false
    // Prevent admin from deleting themselves
    if (user?.role === ROLE_CODES.ADMIN && employee.id === user.id) return false
    return true
  }

  // Check if user can toggle employee status (activate/deactivate)
  const canToggleEmployeeStatus = (employee: Employee) => {
    if (!canManageEmployees) return false
    // Prevent admin from toggling their own status
    if (user?.role === ROLE_CODES.ADMIN && employee.id === user.id) return false
    return true
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Administrador': return 'destructive'
      case 'Recursos Humanos': return 'default'
      case 'Auditor': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Activo': return 'default'
      case 'Inactivo': return 'secondary'
      case 'Terminado': return 'destructive'
      default: return 'outline'
    }
  }

  return (
    <DashboardLayout userRole={user?.role || 'ADMIN'}>
      <div className="h-[calc(100vh-8rem)] flex flex-col -m-4 sm:-m-8 p-4 sm:p-8">
        {/* Header */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
              <p className="text-gray-600 mt-1">Gestión de personal y recursos humanos</p>
          </div>
          {canCreateEmployees && (
            <Button 
              className="flex items-center gap-2"
              onClick={() => {
                router.push('/inicio/empleados/action')
              }}
            >
              <Plus className="h-4 w-4" />
              Nuevo Empleado
            </Button>
          )}
        </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar empleados por nombre, email, cargo o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">Rol</label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                        <SelectItem value="Auditor">Auditor</SelectItem>
                        <SelectItem value="Empleado">Empleado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium mb-2 block">Estado</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="Activo">Activo</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                        <SelectItem value="Terminado">Terminado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                    <X className="h-4 w-4" />
                    Limpiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredEmployees.length} de {employees.length} empleados
            </p>
            {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Filtros activos
                <X className="h-3 w-3 cursor-pointer" onClick={clearFilters} />
              </Badge>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardContent className="flex-1 overflow-auto p-0">
              <div className="min-w-full">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white border-b z-10">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Empleado</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Email</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Cédula</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Cargo</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Salario</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Rol</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Estado Contrato</th>
                      <th className="text-left p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Usuario Activo</th>
                      <th className="text-right p-3 text-xs font-medium text-gray-900 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      // Skeleton loading rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-8 w-8 rounded-full" />
                              <div className="space-y-1">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-4 w-40" />
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-4 w-20" />
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-6 w-16 rounded-full" />
                          </td>
                          <td className="p-3">
                            <Skeleton className="h-8 w-8 rounded" />
                          </td>
                        </tr>
                      ))
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-12 text-gray-500">
                          {employees.length === 0 ? 'No hay empleados registrados' : 'No se encontraron empleados con los filtros aplicados'}
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr key={employee.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={employee.profile_picture || ""} alt={`${employee.first_name} ${employee.last_name}`} />
                                <AvatarFallback className="text-xs">
                                  {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{employee.first_name} {employee.last_name}</div>
                                <div className="text-xs text-gray-500">ID: {employee.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-900">{employee.email}</td>
                          <td className="p-3 text-sm text-gray-900">{employee.document_number || '-'}</td>
                          <td className="p-3 text-sm text-gray-900">{employee.position || '-'}</td>
                          <td className="p-3 text-sm font-medium text-gray-900">
                            {formatCurrency(employee.salary)}
                          </td>
                          <td className="p-3">
                            <Badge variant={getRoleBadgeVariant(employee.role_name)} className="text-xs">
                              {employee.role_name}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={getStatusBadgeVariant(employee.contract_status_name)} className="text-xs">
                              {employee.contract_status_name}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant={employee.is_active ? "default" : "secondary"} className="text-xs">
                              {employee.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(employee)}>
                                  <Eye className="mr-2 h-3 w-3" />
                                  Ver Detalles
                                </DropdownMenuItem>
                                {canEditEmployee(employee) && (
                                  <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                {canDeleteEmployee(employee) && (
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.preventDefault()
                                      setDeleteEmployeeId(employee.id)
                                      setShowDeleteDialog(true)
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Eliminar
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteEmployeeId) {
                handleDelete(deleteEmployeeId)
                setShowDeleteDialog(false)
                setDeleteEmployeeId(null)
              }
            }}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
