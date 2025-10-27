"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Save, User } from "lucide-react"
import { ROLE_CODES } from "@/lib/constants"
import { ProfilePictureUpload } from "@/components/ui/profile-picture-upload"

interface User {
  id: number
  role: string
  email: string
}

interface ContractStatus {
  id: number
  name: string
}

interface UserRole {
  id: number
  name: string
  code: string
}

function EmployeeActionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const employeeId = searchParams.get('id')
  const isEdit = !!employeeId

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contractStatuses, setContractStatuses] = useState<ContractStatus[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [employeeDataLoaded, setEmployeeDataLoaded] = useState(false)


  // Form data
  const [formData, setFormData] = useState({
    // Información básica
    first_name: '',
    last_name: '',
    email: '',
    
    // Información personal y documental
    document_type: 'CC',
    document_number: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    
    // Información de contacto
    phone: '',
    address: '',
    
    // Información laboral
    position: '',
    salary: '',
    hire_date: '',
    termination_date: '',
    work_schedule: '',
    department: '',
    manager_id: '',
    employment_type: 'Tiempo Completo',
    
    // Información de seguridad social
    eps_id: '',
    arl_id: '',
    pension_fund_id: '',
    compensation_fund_id: '',
    
    // Información bancaria
    bank_name: '',
    account_number: '',
    account_type: '',
    
    // Información adicional
    profile_picture: '',
    notes: '',
    is_active: true,
    
    // Campos del sistema
    role_id: '',
    contract_status_id: '',
    password: ''
  })

  // Profile picture file handling
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null)
  const [originalProfilePictureUrl, setOriginalProfilePictureUrl] = useState<string | null>(null)

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

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
        } else {
          console.error("Failed to fetch user data:", response.status)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
      // No establecer loading en false aquí, se hará después de cargar todos los datos
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch contract statuses and roles in parallel
        const [contractResponse, rolesResponse] = await Promise.all([
          fetch('/api/reference/contract-statuses', { credentials: 'include' }),
          fetch('/api/reference/roles', { credentials: 'include' })
        ])

        let contractData = null
        let rolesData = null

        if (contractResponse.ok) {
          contractData = await contractResponse.json()
          setContractStatuses(contractData.contract_statuses || [])
        } else {
          console.error('Failed to fetch contract statuses:', contractResponse.status)
        }

        if (rolesResponse.ok) {
          rolesData = await rolesResponse.json()
          setUserRoles(rolesData.roles || [])
        } else {
          console.error('Failed to fetch roles:', rolesResponse.status)
        }

        // Set default values if not in edit mode
        if (!isEdit) {
          if (contractData?.contract_statuses?.length > 0) {
            setFormData(prev => ({ ...prev, contract_status_id: contractData.contract_statuses[0].id.toString() }))
          }
          if (rolesData?.roles?.length > 0) {
            setFormData(prev => ({ ...prev, role_id: rolesData.roles[0].id.toString() }))
          }
          // Set loading to false for new employees after reference data is loaded
          setLoading(false)
        }
        // For edit mode, loading will be set to false after employee data is loaded
      } catch (error) {
        console.error("Error fetching reference data:", error)
        setError("Error al cargar los datos de referencia")
        setLoading(false)
      }
    }

    fetchReferenceData()
  }, [isEdit])

  useEffect(() => {
    if (isEdit && employeeId && userRoles.length > 0 && contractStatuses.length > 0) {
      const fetchEmployeeData = async () => {
        try {
          console.log('Fetching employee data for ID:', employeeId)
          const response = await fetch(`/api/employees/${employeeId}`)
          
          if (response.ok) {
            const employeeData = await response.json()
            console.log('Employee data received:', employeeData)
            
            if (employeeData.employee) {
              setFormData(prev => ({
                ...prev,
                ...employeeData.employee,
                salary: employeeData.employee.salary?.toString() || '',
                manager_id: employeeData.employee.manager_id?.toString() || '',
                role_id: employeeData.employee.role_id?.toString() || '',
                contract_status_id: employeeData.employee.contract_status_id?.toString() || '',
                birth_date: employeeData.employee.birth_date ? employeeData.employee.birth_date.split('T')[0] : '',
                hire_date: employeeData.employee.hire_date ? employeeData.employee.hire_date.split('T')[0] : '',
                termination_date: employeeData.employee.termination_date ? employeeData.employee.termination_date.split('T')[0] : '',
                is_active: Boolean(employeeData.employee.is_active),
              }))
              
              // Preserve original profile picture URL for deletion
              if (employeeData.employee.profile_picture) {
                setOriginalProfilePictureUrl(employeeData.employee.profile_picture)
              }
              
              // Set loading to false after employee data is loaded
              setEmployeeDataLoaded(true)
              setLoading(false)
            } else {
              console.error('No employee data found in response')
              setError('No se encontraron datos del empleado')
              setLoading(false)
            }
          } else {
            console.error('Failed to fetch employee data:', response.status, response.statusText)
            const errorData = await response.json().catch(() => ({}))
            console.error('Error details:', errorData)
            setError(`Error al cargar los datos del empleado: ${response.status}`)
            setEmployeeDataLoaded(true)
            setLoading(false)
          }
        } catch (error) {
          console.error("Error fetching employee data:", error)
          setError("Error al cargar los datos del empleado")
          setEmployeeDataLoaded(true)
          setLoading(false)
        }
      }

      fetchEmployeeData()
    }
  }, [isEdit, employeeId, userRoles.length, contractStatuses.length])


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[0-9\s\-\(\)]{7,15}$/
    return phoneRegex.test(phone)
  }

  const validateDocumentNumber = (docNumber: string): boolean => {
    const docRegex = /^[0-9]{6,12}$/
    return docRegex.test(docNumber)
  }

  // Check if required fields are filled
  const isFormValid = (): boolean => {
    const requiredFields = [
      formData.first_name.trim(),
      formData.last_name.trim(),
      formData.email.trim()
    ]

    // For new employees, password is also required
    if (!isEdit) {
      requiredFields.push(formData.password.trim())
    }

    // Only require role_id and contract_status_id if they are available
    if (userRoles.length > 0 && formData.role_id) {
      requiredFields.push(formData.role_id)
    }
    if (contractStatuses.length > 0 && formData.contract_status_id) {
      requiredFields.push(formData.contract_status_id)
    }

    return requiredFields.every(field => field !== '')
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del email no es válido'
    }

    if (userRoles.length > 0 && !formData.role_id) {
      newErrors.role_id = 'El rol es requerido'
    }

    if (contractStatuses.length > 0 && !formData.contract_status_id) {
      newErrors.contract_status_id = 'El estado de contrato es requerido'
    }

    // Password validation for new employees
    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (!isEdit && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    }

    // Optional field validations
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'El formato del teléfono no es válido'
    }

    if (formData.document_number && !validateDocumentNumber(formData.document_number)) {
      newErrors.document_number = 'El número de documento debe tener entre 6 y 12 dígitos'
    }

    if (formData.emergency_contact_phone && !validatePhone(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = 'El formato del teléfono de emergencia no es válido'
    }

    if (formData.salary && formData.salary.trim()) {
      // Remove currency formatting and check if it's a valid number
      const numericValue = formData.salary.replace(/[^\d]/g, '')
      if (isNaN(Number(numericValue)) || Number(numericValue) < 0) {
        newErrors.salary = 'El salario debe ser un número válido'
      }
    }

    // Date validations
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date)
      const today = new Date()
      if (birthDate >= today) {
        newErrors.birth_date = 'La fecha de nacimiento debe ser anterior a hoy'
      }
    }

    if (formData.hire_date) {
      const hireDate = new Date(formData.hire_date)
      const today = new Date()
      if (hireDate > today) {
        newErrors.hire_date = 'La fecha de contratación no puede ser futura'
      }
    }

    if (formData.termination_date && formData.hire_date) {
      const hireDate = new Date(formData.hire_date)
      const terminationDate = new Date(formData.termination_date)
      if (terminationDate <= hireDate) {
        newErrors.termination_date = 'La fecha de terminación debe ser posterior a la fecha de contratación'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submitting
    if (!validateForm()) {
      setSaving(false)
      return
    }
    
    setSaving(true)

    try {
      let profilePictureUrl = formData.profile_picture

      // Upload profile picture if a new file was selected
      if (profilePictureFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", profilePictureFile)

        const uploadResponse = await fetch("/api/upload/profile-picture", {
          method: "POST",
          body: uploadFormData,
          credentials: "include"
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          profilePictureUrl = uploadData.url
        } else {
          const errorData = await uploadResponse.json()
          console.error('Error al subir la foto de perfil:', errorData)
          setSaving(false)
          return
        }
      }

      const url = isEdit ? `/api/employees/${employeeId}` : '/api/employees'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          profile_picture: profilePictureUrl || undefined,
          salary: formData.salary || undefined,
          manager_id: formData.manager_id ? parseInt(formData.manager_id) : undefined,
          role_id: formData.role_id,
          contract_status_id: formData.contract_status_id,
          // Clean up empty strings and convert to undefined for optional fields
          phone: formData.phone || undefined,
          address: formData.address || undefined,
          document_number: formData.document_number || undefined,
          birth_date: formData.birth_date || undefined,
          gender: formData.gender || undefined,
          marital_status: formData.marital_status || undefined,
          emergency_contact_name: formData.emergency_contact_name || undefined,
          emergency_contact_phone: formData.emergency_contact_phone || undefined,
          position: formData.position || undefined,
          hire_date: formData.hire_date || undefined,
          termination_date: formData.termination_date || undefined,
          work_schedule: formData.work_schedule || undefined,
          department: formData.department || undefined,
          eps_id: formData.eps_id || undefined,
          arl_id: formData.arl_id || undefined,
          pension_fund_id: formData.pension_fund_id || undefined,
          compensation_fund_id: formData.compensation_fund_id || undefined,
          bank_name: formData.bank_name || undefined,
          account_number: formData.account_number || undefined,
          account_type: formData.account_type || undefined,
          notes: formData.notes || undefined,
          is_active: Boolean(formData.is_active), // Ensure boolean conversion
        })
      })

      if (response.ok) {
        router.push('/inicio/empleados?success=' + (isEdit ? 'updated' : 'created'))
        } else {
        const errorData = await response.json()
        
        // Handle validation errors from backend
        if (errorData.details && Array.isArray(errorData.details)) {
          const backendErrors: Record<string, string> = {}
          
          errorData.details.forEach((err: any) => {
            backendErrors[err.field] = err.message
          })
          
          setErrors(backendErrors)
          } else {
            console.error('Error al guardar empleado:', errorData)
          }
      }
    } catch (error) {
      console.error("Error saving employee:", error)
    } finally {
      setSaving(false)
    }
  }

  // Debug info
  console.log('Render state:', { 
    loading, 
    isEdit, 
    employeeDataLoaded, 
    userRolesLength: userRoles.length, 
    contractStatusesLength: contractStatuses.length,
    employeeId 
  })

  if (loading || (isEdit && !employeeDataLoaded)) {
    return (
      <DashboardLayout userRole={user?.role || "ADMIN"}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Form skeleton */}
          <div className="space-y-6">
            {/* Información Básica skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-24 w-24 rounded-full" />
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Documental skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Información Laboral skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-80" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botones skeleton */}
            <div className="flex justify-end gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole={user?.role || "ADMIN"}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/inicio/empleados')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-red-600">Error</h1>
              <p className="text-gray-600 mt-2">{error}</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-600 mb-4">No se pudieron cargar los datos necesarios</p>
                <Button onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
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
    <DashboardLayout userRole={user.role}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/inicio/empleados')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEdit ? 'Modifica la información del empleado' : 'Completa la información del nuevo empleado'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Datos personales y de contacto del empleado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Label className="text-sm font-medium mb-2 block">Foto de Perfil</Label>
                  <ProfilePictureUpload
                    value={formData.profile_picture}
                    onChange={(file, previewUrl) => {
                      setProfilePictureFile(file)
                      setProfilePicturePreview(previewUrl)
                      if (previewUrl) {
                        handleInputChange('profile_picture', previewUrl)
                      }
                    }}
                    disabled={saving}
                  />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      required
                      className={errors.first_name ? 'border-red-500' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="last_name">Apellido *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      required
                      className={errors.last_name ? 'border-red-500' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Documental */}
          <Card>
            <CardHeader>
              <CardTitle>Información Documental</CardTitle>
              <CardDescription>
                Documentos de identidad y datos personales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type">Tipo de Documento</Label>
                  <Select value={formData.document_type} onValueChange={(value) => handleInputChange('document_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                      <SelectItem value="RC">Registro Civil</SelectItem>
                      <SelectItem value="PA">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="document_number">Número de Documento</Label>
                  <Input
                    id="document_number"
                    value={formData.document_number}
                    onChange={(e) => handleInputChange('document_number', e.target.value)}
                    className={errors.document_number ? 'border-red-500' : ''}
                  />
                  {errors.document_number && (
                    <p className="text-sm text-red-500 mt-1">{errors.document_number}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    className={errors.birth_date ? 'border-red-500' : ''}
                  />
                  {errors.birth_date && (
                    <p className="text-sm text-red-500 mt-1">{errors.birth_date}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gender">Género</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="marital_status">Estado Civil</Label>
                  <Select value={formData.marital_status} onValueChange={(value) => handleInputChange('marital_status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Soltero/a">Soltero/a</SelectItem>
                      <SelectItem value="Casado/a">Casado/a</SelectItem>
                      <SelectItem value="Divorciado/a">Divorciado/a</SelectItem>
                      <SelectItem value="Viudo/a">Viudo/a</SelectItem>
                      <SelectItem value="Unión Libre">Unión Libre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="emergency_contact_name">Contacto de Emergencia</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Laboral */}
          <Card>
            <CardHeader>
              <CardTitle>Información Laboral</CardTitle>
              <CardDescription>
                Datos del puesto de trabajo y condiciones laborales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salario</Label>
                  <CurrencyInput
                    id="salary"
                    value={formData.salary}
                    onChange={(value) => handleInputChange('salary', value)}
                    placeholder="0"
                    className={errors.salary ? 'border-red-500' : ''}
                  />
                  {errors.salary && (
                    <p className="text-sm text-red-500 mt-1">{errors.salary}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="hire_date">Fecha de Contratación</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="termination_date">Fecha de Terminación</Label>
                  <Input
                    id="termination_date"
                    type="date"
                    value={formData.termination_date}
                    onChange={(e) => handleInputChange('termination_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="work_schedule">Horario de Trabajo</Label>
                  <Input
                    id="work_schedule"
                    value={formData.work_schedule}
                    onChange={(e) => handleInputChange('work_schedule', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="employment_type">Tipo de Empleo</Label>
                  <Select value={formData.employment_type} onValueChange={(value) => handleInputChange('employment_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tiempo Completo">Tiempo Completo</SelectItem>
                      <SelectItem value="Medio Tiempo">Medio Tiempo</SelectItem>
                      <SelectItem value="Por Horas">Por Horas</SelectItem>
                      <SelectItem value="Por Contrato">Por Contrato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role_id">Rol *</Label>
                  <Select value={formData.role_id} onValueChange={(value) => handleInputChange('role_id', value)} required>
                    <SelectTrigger className={errors.role_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={userRoles.length === 0 ? "Cargando roles..." : "Seleccionar rol"} />
                    </SelectTrigger>
                    <SelectContent>
                      {userRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.role_id}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="contract_status_id">Estado de Contrato *</Label>
                  <Select value={formData.contract_status_id} onValueChange={(value) => handleInputChange('contract_status_id', value)} required>
                    <SelectTrigger className={errors.contract_status_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={contractStatuses.length === 0 ? "Cargando estados..." : "Seleccionar estado"} />
                    </SelectTrigger>
                    <SelectContent>
                      {contractStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contract_status_id && (
                    <p className="text-sm text-red-500 mt-1">{errors.contract_status_id}</p>
                  )}
                </div>
                {!isEdit && (
                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información de Seguridad Social */}
          <Card>
            <CardHeader>
              <CardTitle>Seguridad Social</CardTitle>
              <CardDescription>
                Información de afiliaciones a seguridad social
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eps_id">EPS</Label>
                  <Input
                    id="eps_id"
                    value={formData.eps_id}
                    onChange={(e) => handleInputChange('eps_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="arl_id">ARL</Label>
                  <Input
                    id="arl_id"
                    value={formData.arl_id}
                    onChange={(e) => handleInputChange('arl_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pension_fund_id">Fondo de Pensiones</Label>
                  <Input
                    id="pension_fund_id"
                    value={formData.pension_fund_id}
                    onChange={(e) => handleInputChange('pension_fund_id', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="compensation_fund_id">Caja de Compensación</Label>
                  <Input
                    id="compensation_fund_id"
                    value={formData.compensation_fund_id}
                    onChange={(e) => handleInputChange('compensation_fund_id', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Bancaria */}
          <Card>
            <CardHeader>
              <CardTitle>Información Bancaria</CardTitle>
              <CardDescription>
                Datos para el pago de nómina
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bank_name">Banco</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="account_number">Número de Cuenta</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="account_type">Tipo de Cuenta</Label>
                  <Select value={formData.account_type} onValueChange={(value) => handleInputChange('account_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ahorros">Ahorros</SelectItem>
                      <SelectItem value="Corriente">Corriente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional */}
          <Card>
            <CardHeader>
              <CardTitle>Información Adicional</CardTitle>
              <CardDescription>
                Notas y observaciones adicionales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="text-base">
                    Empleado activo
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    {formData.is_active ? "El empleado puede acceder al sistema" : "El empleado no puede acceder al sistema"}
                  </div>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  disabled={loading || saving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/inicio/empleados')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || saving || !isFormValid()}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Cargando...' : saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

// Loading component for Suspense fallback
function EmployeeActionLoading() {
  return (
    <DashboardLayout userRole="ADMIN">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cargando...</h1>
            <p className="text-muted-foreground">
              Preparando formulario de empleado
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </DashboardLayout>
  )
}

// Main component with Suspense boundary
export default function EmployeeActionPage() {
  return (
    <Suspense fallback={<EmployeeActionLoading />}>
      <EmployeeActionContent />
    </Suspense>
  )
}
