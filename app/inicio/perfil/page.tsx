"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Calendar, Shield, Camera } from "lucide-react"
import { ROLE_CODES } from "@/lib/constants"
import { formatCurrency } from "@/lib/currency-utils"

interface User {
  id: number
  role: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  address?: string
  position?: string
  salary?: number
  hire_date?: string
  document_type?: string
  document_number?: string
  birth_date?: string
  gender?: string
  marital_status?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  profile_picture?: string
  role_name: string
  contract_status_name: string
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser({
          id: userData.id,
          role: userData.role,
          email: userData.email,
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          phone: userData.phone || '',
          address: userData.address || '',
          position: userData.position || '',
          salary: userData.salary || 0,
          hire_date: userData.hire_date || '',
          document_type: userData.document_type || 'CC',
          document_number: userData.document_number || '',
          birth_date: userData.birth_date || '',
          gender: userData.gender || '',
          marital_status: userData.marital_status || '',
          emergency_contact_name: userData.emergency_contact_name || '',
          emergency_contact_phone: userData.emergency_contact_phone || '',
          profile_picture: userData.profile_picture || '',
          role_name: userData.role_name || '',
          contract_status_name: userData.contract_status_name || '',
          created_at: userData.created_at || ''
        })
      } else {
        console.error('Error fetching user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'Administrador':
        return 'destructive'
      case 'Auditor':
        return 'secondary'
      case 'RRHH':
        return 'default'
      case 'Empleado':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeVariant = (statusName: string) => {
    switch (statusName) {
      case 'Activo':
        return 'default'
      case 'Inactivo':
        return 'secondary'
      case 'Suspendido':
        return 'destructive'
      default:
        return 'outline'
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

  if (loading) {
    return (
      <DashboardLayout userRole="ADMIN">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando perfil...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout userRole="ADMIN">
        <div className="text-center text-red-600">Error: No se pudo cargar la información del usuario</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={user.role}>
      <div className="h-[calc(100vh-8rem)] flex flex-col -m-4 sm:-m-8 p-4 sm:p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-sm text-gray-600">Información personal y profesional</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Columna 1: Información Básica */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <img
                      src={user.profile_picture || '/placeholder-user.jpg'}
                      alt={`${user.first_name} ${user.last_name}`}
                      className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Nombre</label>
                    <p className="text-sm text-gray-900">{user.first_name}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Apellido</label>
                    <p className="text-sm text-gray-900">{user.last_name}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Teléfono</label>
                    <p className="text-sm text-gray-900">{user.phone || '-'}</p>
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-500">Dirección</label>
                    <p className="text-sm text-gray-900">{user.address || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Columna 2: Información Laboral */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-4 w-4" />
                  Información Laboral
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Cargo</label>
                  <p className="text-sm text-gray-900">{user.position || '-'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Salario</label>
                  <p className="text-sm text-gray-900">{user.salary ? formatCurrency(user.salary) : '-'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Rol</label>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(user.role_name)} className="text-xs">
                      {user.role_name}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Estado</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(user.contract_status_name)} className="text-xs">
                      {user.contract_status_name}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Fecha de Contratación</label>
                  <p className="text-sm text-gray-900">
                    {user.hire_date ? new Date(user.hire_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Miembro desde</label>
                  <p className="text-sm text-gray-900">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Columna 3: Información Personal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">Tipo de Documento</label>
                  <p className="text-sm text-gray-900">{getDocumentTypeLabel(user.document_type || '')}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Número de Documento</label>
                  <p className="text-sm text-gray-900">{user.document_number || '-'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Fecha de Nacimiento</label>
                  <p className="text-sm text-gray-900">
                    {user.birth_date ? new Date(user.birth_date).toLocaleDateString() : '-'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Género</label>
                  <p className="text-sm text-gray-900">{getGenderLabel(user.gender || '')}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Estado Civil</label>
                  <p className="text-sm text-gray-900">{user.marital_status || '-'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Contacto de Emergencia</label>
                  <p className="text-sm text-gray-900">{user.emergency_contact_name || '-'}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500">Teléfono de Emergencia</label>
                  <p className="text-sm text-gray-900">{user.emergency_contact_phone || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}