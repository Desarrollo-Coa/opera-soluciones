"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Upload, Download, Trash2, User, FileText, Calendar, Phone, Mail, MapPin, Briefcase } from "lucide-react"
import { DocumentUpload } from "./document-upload"
import { DocumentList } from "./document-list"

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

interface EmployeeDetailsProps {
  employee: Employee
  onClose: () => void
  onEdit: () => void
}

export function EmployeeDetails({ employee, onClose, onEdit }: EmployeeDetailsProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [employee.id])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/employees/${employee.id}/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {employee.first_name} {employee.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Información Personal</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Nombre:</span>
                    <span>{employee.first_name} {employee.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email:</span>
                    <span>{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Teléfono:</span>
                    <span>{employee.phone || 'No registrado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Cargo:</span>
                    <span>{employee.position || 'No asignado'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Información Laboral */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información Laboral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Rol:</span>
                    <Badge variant={getRoleBadgeVariant(employee.role_name)}>
                      {employee.role_name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Estado del Contrato:</span>
                    <Badge variant={getStatusBadgeVariant(employee.contract_status_name)}>
                      {employee.contract_status_name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Fecha de Registro:</span>
                    <span>{new Date(employee.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Dirección */}
              {employee.address && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Dirección</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{employee.address}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar Empleado
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Documentos del Empleado</h3>
              <DocumentUpload 
                employeeId={employee.id} 
                onUploadSuccess={fetchDocuments}
              />
            </div>
            
            <DocumentList 
              documents={documents} 
              loading={loading}
              onDelete={fetchDocuments}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Actividad</CardTitle>
                <CardDescription>
                  Registro de cambios y actividades del empleado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-gray-500 py-8">
                  Historial de actividad no disponible en esta versión
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
