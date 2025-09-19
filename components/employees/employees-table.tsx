"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Edit, Trash2, MoreHorizontal, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { EmployeeDetails } from "./employee-details"
import { EmployeeForm } from "./employee-form"
import { ROLE_CODES } from "@/lib/constants"
import { formatCurrency } from "@/lib/currency-utils"

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  position?: string
  salary?: number
  role_name: string
  contract_status_name: string
  profile_picture?: string
  created_at: string
}

interface EmployeesTableProps {
  currentUserId?: number
  currentUserRole?: string
}

export function EmployeesTable({ currentUserId, currentUserRole }: EmployeesTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        console.log('Employees data received:', data.employees)
        setEmployees(data.employees || [])
      } else {
        console.error('Error response:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDetails(true)
  }

  const handleEdit = (employee: Employee) => {
    window.location.href = `/inicio/empleados/action?id=${employee.id}`
  }

  const handleCreateNew = () => {
    setEditingEmployee(null)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchEmployees()
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
    }
  }

  // Check if user can edit/delete employees
  const canManageEmployees = currentUserRole === ROLE_CODES.ADMIN || currentUserRole === ROLE_CODES.HR
  
  // Check if user can edit specific employee (prevent self-editing for admins)
  const canEditEmployee = (employee: Employee) => {
    if (!canManageEmployees) return false
    // Prevent admin from editing themselves
    if (currentUserRole === ROLE_CODES.ADMIN && employee.id === currentUserId) return false
    return true
  }

  // Check if user can delete specific employee
  const canDeleteEmployee = (employee: Employee) => {
    if (!canManageEmployees) return false
    // Prevent admin from deleting themselves
    if (currentUserRole === ROLE_CODES.ADMIN && employee.id === currentUserId) return false
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Cargando empleados...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Hidden button that can be triggered from parent */}
      <button 
        data-create-employee 
        onClick={handleCreateNew}
        className="hidden"
        aria-hidden="true"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>
            Gestiona la información de todos los empleados de la empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Salario</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No hay empleados registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.profile_picture || ""} alt={`${employee.first_name} ${employee.last_name}`} />
                            <AvatarFallback className="text-xs">
                              {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone || '-'}</TableCell>
                      <TableCell>{employee.position || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(employee.salary)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(employee.role_name)}>
                          {employee.role_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(employee.contract_status_name)}>
                          {employee.contract_status_name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(employee)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            {canEditEmployee(employee) && (
                              <DropdownMenuItem onClick={() => handleEdit(employee)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            )}
                            {canDeleteEmployee(employee) && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Estás seguro de que quieres eliminar este empleado?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(employee.id)}>Eliminar</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showDetails && selectedEmployee && (
        <EmployeeDetails
          employee={selectedEmployee}
          onClose={() => setShowDetails(false)}
          onEdit={() => {
            setShowDetails(false)
            handleEdit(selectedEmployee)
          }}
        />
      )}

      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          currentUserRole={currentUserRole}
          onClose={() => {
            setShowForm(false)
            setEditingEmployee(null)
          }}
          onSuccess={() => {
            setShowForm(false)
            setEditingEmployee(null)
            fetchEmployees()
          }}
        />
      )}
    </>
  )
}
