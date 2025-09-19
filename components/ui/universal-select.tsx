"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Option {
  name: string
  code: string
  id?: number
}

interface UniversalSelectProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: Option[]
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
}

export function UniversalSelect({ 
  value, 
  onValueChange, 
  placeholder = "Selecciona una opción",
  options,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontró ninguna opción.",
  disabled = false
}: UniversalSelectProps) {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find(option => option.id?.toString() === value || option.code === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left"
          disabled={disabled}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option.code}
                value={`${option.name} ${option.code}`}
                onSelect={() => {
                  onValueChange(option.id?.toString() || option.code)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === (option.id?.toString() || option.code) ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <div className="font-medium">{option.name}</div>
                  <div className="text-sm text-gray-500">{option.code}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 