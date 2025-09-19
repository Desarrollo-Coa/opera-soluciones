"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Phone, Mail, MapPin } from "lucide-react"
import { DocumentUpload } from "@/components/employees/document-upload"
import { NumericFormat } from "react-number-format"
import { DocumentList } from "@/components/employees/document-list"

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
  address?: string
  position?: string
  salary?: number
  role_name: string
  contract_status_name: string
  profile_picture?: string
  document_type?: string
  document_number?: string
  birth_date?: string
  gender?: string
  marital_status?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  hire_date?: string
  termination_date?: string
  department?: string
  work_schedule?: string
  employment_type?: string
  eps_id?: string
  arl_id?: string
  pension_fund_id?: string
  compensation_fund_id?: string
  bank_name?: string
  account_number?: string
  account_type?: string
  notes?: string
  is_active?: boolean
  created_at: string
}

export default function EmployeeDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<any[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'hoja-vida' | 'documentos' | 'volantes'>('hoja-vida')

  useEffect(() => {
    fetchUserData()
    fetchEmployeeData()
    fetchDocuments()
  }, [employeeId])

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
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchEmployeeData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/employees/${employeeId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Employee data received:', data)
        if (data.employee) {
          setEmployee({
            id: data.employee.id,
            first_name: data.employee.first_name || '',
            last_name: data.employee.last_name || '',
            email: data.employee.email || '',
            phone: data.employee.phone || '',
            address: data.employee.address || '',
            position: data.employee.position || '',
            salary: data.employee.salary || 0,
            role_name: data.employee.role_name || '',
            contract_status_name: data.employee.contract_status_name || '',
            profile_picture: data.employee.profile_picture || '',
            document_type: data.employee.document_type || '',
            document_number: data.employee.document_number || '',
            birth_date: data.employee.birth_date ? data.employee.birth_date.split('T')[0] : '',
            gender: data.employee.gender || '',
            marital_status: data.employee.marital_status || '',
            emergency_contact_name: data.employee.emergency_contact_name || '',
            emergency_contact_phone: data.employee.emergency_contact_phone || '',
            hire_date: data.employee.hire_date ? data.employee.hire_date.split('T')[0] : '',
            termination_date: data.employee.termination_date ? data.employee.termination_date.split('T')[0] : '',
            department: data.employee.department || '',
            work_schedule: data.employee.work_schedule || '',
            employment_type: data.employee.employment_type || '',
            eps_id: data.employee.eps_id || '',
            arl_id: data.employee.arl_id || '',
            pension_fund_id: data.employee.pension_fund_id || '',
            compensation_fund_id: data.employee.compensation_fund_id || '',
            bank_name: data.employee.bank_name || '',
            account_number: data.employee.account_number || '',
            account_type: data.employee.account_type || '',
            notes: data.employee.notes || '',
            is_active: data.employee.is_active || false,
            created_at: data.employee.created_at || ''
          })
          console.log('Employee state set:', employee)
        } else {
          console.error('Error: No employee data received')
          router.push('/inicio/empleados')
        }
      } else {
        console.error('Error fetching employee data:', response.status)
        router.push('/inicio/empleados')
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
      router.push('/inicio/empleados')
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true)
      const response = await fetch(`/api/documents?employeeId=${employeeId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setDocumentsLoading(false)
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

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'CC': 'Cédula de Ciudadanía',
      'CE': 'Cédula de Extranjería',
      'TI': 'Tarjeta de Identidad',
      'RC': 'Registro Civil',
      'PA': 'Pasaporte'
    }
    return types[type] || type
  }

  const getGenderLabel = (gender: string) => {
    const genders: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Femenino',
      'O': 'Otro'
    }
    return genders[gender] || gender
  }

  

  const handleBack = () => {
    router.push('/inicio/empleados')
  }

  if (loading) {
    return (
      <DashboardLayout userRole={user?.role || "ADMIN"}>
        <div className="h-[calc(100vh-8rem)] flex items-center justify-center -m-4 sm:-m-8 p-4 sm:p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando detalles del empleado...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!employee) {
    return (
      <DashboardLayout userRole={user?.role || "ADMIN"}>
        <div className="text-center text-red-600">Error: No se pudo cargar la información del empleado</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={user?.role || "ADMIN"}>
      <div className="h-[calc(100vh-8rem)] flex -m-4 sm:-m-8 p-4 sm:p-8 overflow-hidden">

        {/* Content */}
        <div className="flex-1 flex gap-6">
          {/* Sidebar izquierdo */}
          <div className="w-64 flex-shrink-0">
            <div className="space-y-2">
              <Button 
                variant={activeTab === 'hoja-vida' ? 'default' : 'outline'}
                className="w-full justify-start h-12 text-left"
                onClick={() => setActiveTab('hoja-vida')}
              >
                <FileText className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">HOJA DE VIDA</div>
                  <div className="text-xs text-gray-500">Información personal</div>
                </div>
              </Button>
              
              <Button 
                variant={activeTab === 'documentos' ? 'default' : 'outline'}
                className="w-full justify-start h-12 text-left"
                onClick={() => setActiveTab('documentos')}
              >
                <FileText className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">DOCUMENTOS</div>
                  <div className="text-xs text-gray-500">Archivos adjuntos</div>
                </div>
              </Button>
              
              <Button 
                variant={activeTab === 'volantes' ? 'default' : 'outline'}
                className="w-full justify-start h-12 text-left"
                onClick={() => setActiveTab('volantes')}
              >
                <FileText className="mr-3 h-5 w-5" />
                <div>
                  <div className="font-semibold">VOLANTES DE PAGO</div>
                  <div className="text-xs text-gray-500">Nómina mensual</div>
                </div>
              </Button>
            </div>
            
            {/* Botón volver debajo del sidebar */}
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'hoja-vida' && (
              <div className="space-y-6">
                {/* Header con foto y datos básicos */}
                <Card className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-bl-full"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-100 to-yellow-200 rounded-tr-full"></div>
                  
                  <CardContent className="p-8 relative">
                    <div className="flex items-start gap-6">
                      {/* Foto de perfil */}
                      <div className="relative">
                        <img
                          src={employee.profile_picture || '/placeholder-user.jpg'}
                          alt={`${employee.first_name} ${employee.last_name}`}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      </div>
                      
                      {/* Información básica */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h2 className="text-3xl font-bold text-blue-900 mb-2">
                              {employee.first_name} {employee.last_name}
                            </h2>
                            <p className="text-lg text-red-600 font-semibold">
                              {employee.position || 'Cargo no asignado'}
                            </p>
                          </div>
                          
                          {/* Logo de la empresa */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">OPERA</div>
                            <div className="text-sm text-blue-600">SOLUCIONES S.A.S.</div>
                          </div>
                        </div>
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Datos laborales destacados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">Datos laborales destacados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Inicio contrato:</span>
                        <span className="text-gray-900">
                          {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'No registrado'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Venc. contrato:</span>
                        <span className="text-gray-900">
                          {employee.termination_date ? new Date(employee.termination_date).toLocaleDateString() : 'No definido'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">ARL:</span>
                        <span className="text-gray-900">{employee.arl_id || 'No registrado'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">EPS:</span>
                        <span className="text-gray-900">{employee.eps_id || 'No registrado'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Caja compensación:</span>
                        <span className="text-gray-900">{employee.compensation_fund_id || 'No registrado'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Estado:</span>
                        <Badge variant={getStatusBadgeVariant(employee.contract_status_name)}>
                          {employee.contract_status_name}
                        </Badge>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Sueldo:</span>
                        <span className="text-gray-900 font-semibold">
                          {employee.salary !== undefined && employee.salary !== null ? (
                            <NumericFormat
                              value={employee.salary}
                              displayType="text"
                              thousandSeparator="."
                              decimalSeparator="," 
                              prefix="$ "
                              decimalScale={0}
                            />
                          ) : (
                            'No registrado'
                          )}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Tipo de empleo:</span>
                        <span className="text-gray-900">{employee.employment_type || 'No especificado'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Horario:</span>
                        <span className="text-gray-900">{employee.work_schedule || 'No definido'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Fondo de pensiones:</span>
                        <span className="text-gray-900">{employee.pension_fund_id || 'No registrado'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Información personal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">Información Personal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {employee.birth_date && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Fecha de Nacimiento:</span>
                          <span className="text-gray-900">{new Date(employee.birth_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {employee.gender && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Género:</span>
                          <span className="text-gray-900">{getGenderLabel(employee.gender)}</span>
                        </div>
                      )}
                      {employee.marital_status && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="font-medium text-gray-700">Estado Civil:</span>
                          <span className="text-gray-900">{employee.marital_status}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">Rol:</span>
                        <Badge variant={getRoleBadgeVariant(employee.role_name)}>
                          {employee.role_name}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contacto e Información Bancaria (contenedor único) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-900">Contacto e Información Bancaria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Contacto</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4" />
                            <span>{employee.phone || '(312) 345-6789'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4" />
                            <span>{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4" />
                            <span>Identificación: {employee.document_number || '123456'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4" />
                            <span>{employee.address || 'Calle Cualquiera 123, Cualquier Lugar'}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Bancaria</h3>
                        <div className="space-y-3">
                          {employee.bank_name && (
                            <div className="flex justify-between">
                              <span className="font-medium">Banco:</span>
                              <span>{employee.bank_name}</span>
                            </div>
                          )}
                          {employee.account_number && (
                            <div className="flex justify-between">
                              <span className="font-medium">Número de cuenta:</span>
                              <span>{employee.account_number}</span>
                            </div>
                          )}
                          {employee.account_type && (
                            <div className="flex justify-between">
                              <span className="font-medium">Tipo de cuenta:</span>
                              <span>{employee.account_type}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="font-medium">Estado:</span>
                            <Badge variant={employee.is_active ? 'default' : 'secondary'}>
                              {employee.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {activeTab === 'documentos' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Documentos del Empleado</h3>
                  <div className="flex gap-2">
                    <DocumentUpload 
                      employeeId={parseInt(employeeId)} 
                      onUploadSuccess={fetchDocuments}
                      allowedTypeNames={["Contrato", "Hoja de vida", "Exámenes médicos", "Seguridad social"]}
                    />
                  </div>
                </div>
                
                <DocumentList 
                  documents={documents.filter((d: any) => d.document_type_name !== 'Volantes de pago')} 
                  loading={documentsLoading}
                  onDelete={fetchDocuments}
                />
              </div>
            )}

            {activeTab === 'volantes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Volantes de Pago</h3>
                  <DocumentUpload 
                    employeeId={parseInt(employeeId)} 
                    onUploadSuccess={fetchDocuments}
                    allowedTypeNames={["Volantes de pago"]}
                    defaultTypeName="Volantes de pago"
                  />
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Volantes de Pago</CardTitle>
                    <CardDescription>
                      Nómina mensual del empleado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentList 
                      documents={documents.filter((d: any) => d.document_type_name === 'Volantes de pago')} 
                      loading={documentsLoading}
                      onDelete={fetchDocuments}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
