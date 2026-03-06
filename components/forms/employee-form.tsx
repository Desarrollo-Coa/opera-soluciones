// =====================================================
// SGI Opera Soluciones - Employee Form Component
// Componente de formulario de empleado
// =====================================================
// Description: Reusable form component for employee creation
// Descripción: Componente de formulario reutilizable para creación de empleados
// Author: Carlos Muñoz
// Date: 2025-01-16
// =====================================================

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" // Changed from "@/hooks/use-toast"

interface EmployeeFormData {
  nombres: string
  apellidos: string
  email: string
  cedula: string
}

interface EmployeeFormProps {
  onSubmit: (data: EmployeeFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function EmployeeForm({ onSubmit, onCancel, isLoading = false }: EmployeeFormProps) {
  const [form, setForm] = useState<EmployeeFormData>({
    nombres: "",
    apellidos: "",
    email: "",
    cedula: "",
  })

  // Removed: const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await onSubmit(form)
      toast.success("El empleado ha sido creado exitosamente") // Updated toast call
    } catch (error) {
      toast.error("No se pudo crear el empleado") // Updated toast call
    }
  }

  const updateField = (field: keyof EmployeeFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="nombres">Nombres</Label>
        <Input
          id="nombres"
          value={form.nombres}
          onChange={(e) => updateField("nombres", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="apellidos">Apellidos</Label>
        <Input
          id="apellidos"
          value={form.apellidos}
          onChange={(e) => updateField("apellidos", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <Label htmlFor="cedula">Cédula</Label>
        <Input
          id="cedula"
          value={form.cedula}
          onChange={(e) => updateField("cedula", e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creando..." : "Crear empleado"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
