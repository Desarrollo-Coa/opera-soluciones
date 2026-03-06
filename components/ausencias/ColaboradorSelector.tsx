"use client"

import { useState, useEffect } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Search, User, Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Colaborador {
  id: number
  first_name: string
  last_name: string
  position?: string
  department?: string
  is_active?: boolean
}

interface ColaboradorSelectorProps {
  value: Colaborador | null
  onChange: (colaborador: Colaborador | null) => void
}

export default function ColaboradorSelector({ value, onChange }: ColaboradorSelectorProps) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch('/api/colaboradores')
        const data = await res.json()
        if (Array.isArray(data)) {
          // Filtramos solo activos y mapeamos si es necesario
          setColaboradores(data.filter((u: any) => u.is_active || u.activo))
        }
      } catch (error) {
        console.error('Error cargando colaboradores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchColaboradores()
  }, [])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-all font-normal text-slate-700 h-10 px-3"
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        <div className="flex items-center gap-2 truncate">
          <User className="w-4 h-4 text-slate-400" />
          {value ? (
            <span className="truncate">
              {value.first_name} {value.last_name}
            </span>
          ) : (
            <span className="text-slate-400">
              {loading ? "Cargando..." : "Seleccionar colaborador…"}
            </span>
          )}
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex flex-col h-[450px]">
          <CommandInput placeholder="Buscar por nombre, cargo o departamento..." className="h-12" />
          <CommandList className="flex-1">
            <CommandEmpty>No se encontraron colaboradores.</CommandEmpty>
            <CommandGroup heading="Colaboradores">
              {colaboradores.map((colaborador) => (
                <CommandItem
                  key={colaborador.id}
                  value={`${colaborador.first_name} ${colaborador.last_name} ${colaborador.position || ""} ${colaborador.department || ""}`}
                  onSelect={() => {
                    onChange(colaborador)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-slate-50 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-xs group-hover:bg-blue-100 transition-colors">
                      {colaborador.first_name[0]}{colaborador.last_name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 leading-none mb-1">
                        {colaborador.first_name} {colaborador.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {colaborador.position || "Sin cargo"} • {colaborador.department || "Sin depto"}
                      </p>
                    </div>
                  </div>
                  {value?.id === colaborador.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </div>
      </CommandDialog>
    </>
  )
}
