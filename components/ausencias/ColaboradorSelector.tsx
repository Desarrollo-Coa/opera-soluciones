"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Colaborador {
  id: number
  first_name: string
  last_name: string
  position?: string
  department?: string
}

interface ColaboradorSelectorProps {
  value: Colaborador | null
  onChange: (colaborador: Colaborador | null) => void
}

export default function ColaboradorSelector({ value, onChange }: ColaboradorSelectorProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch('/api/colaboradores')
        const data = await res.json()
        if (Array.isArray(data)) {
          setColaboradores(data.filter(user => user.is_active))
        }
      } catch (error) {
        console.error('Error cargando colaboradores:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchColaboradores()
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Colaborador *</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Cargando colaboradores..." />
          </SelectTrigger>
        </Select>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label>Colaborador *</Label>
      <Select
        value={value?.id.toString() || ""}
        onValueChange={(id) => {
          const colaborador = colaboradores.find(c => c.id.toString() === id)
          onChange(colaborador || null)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar colaborador" />
        </SelectTrigger>
        <SelectContent>
          {colaboradores.map((colaborador) => (
            <SelectItem key={colaborador.id} value={colaborador.id.toString()}>
              {colaborador.first_name} {colaborador.last_name}
              {colaborador.position && ` - ${colaborador.position}`}
              {colaborador.department && ` (${colaborador.department})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
