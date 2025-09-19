"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ROLE_CODES } from "@/lib/constants"

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  position?: string
  role_name: string
  contract_status_name: string
  created_at: string
}

interface EmployeeFormProps {
  employee?: Employee | null
  currentUserRole?: string
  onClose: () => void
  onSuccess: () => void
}

export function EmployeeForm({ employee, currentUserRole, onClose, onSuccess }: EmployeeFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<any[]>([])
  const [contractStatuses, setContractStatuses] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    password: '',
    role_id: '',
    contract_status_id: ''
  })

  const isEditing = !!employee

  useEffect(() => {
    fetchReferenceData()
    if (employee) {
      setFormData({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone || '',
        address: employee.address || '',
        position: employee.position || '',
        password: '',
        role_id: '',
        contract_status_id: ''
      })
    }
  }, [employee])

  const fetchReferenceData = async () => {
    try {
      const [rolesRes, statusesRes] = await Promise.all([
        fetch('/api/reference/roles'),
        fetch('/api/reference/contract-statuses')
      ])
      
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json()
        let availableRoles = rolesData.roles || []
        
        // Filter roles based on current user permissions
        // Only ADMIN can create other ADMIN users
        if (currentUserRole !== ROLE_CODES.ADMIN) {
          availableRoles = availableRoles.filter((role: any) => 
            role.code !== ROLE_CODES.ADMIN
          )
        }
        
        setRoles(availableRoles)
      }
      
      if (statusesRes.ok) {
        const statusesData = await statusesRes.json()
        setContractStatuses(statusesData.contract_statuses || [])
      }
    } catch (error) {
      console.error('Error fetching reference data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEditing ? `/api/employees/${employee.id}` : '/api/employees'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: isEditing ? "Empleado actualizado correctamente" : "Empleado creado correctamente",
        })
        onSuccess()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Error al procesar la solicitud",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        title: "Error",
        description: "Error al procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
              <CardDescription>
                Datos básicos del empleado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Nombre *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Apellido *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Laboral</CardTitle>
              <CardDescription>
                Datos relacionados con el trabajo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role_id">Rol *</Label>
                  <Select value={formData.role_id} onValueChange={(value) => handleInputChange('role_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="contract_status_id">Estado del Contrato *</Label>
                  <Select value={formData.contract_status_id} onValueChange={(value) => handleInputChange('contract_status_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isEditing && (
                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required={!isEditing}
                    minLength={6}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Actualizar' : 'Crear'} Empleado
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
