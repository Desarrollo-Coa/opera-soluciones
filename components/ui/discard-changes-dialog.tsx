"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AlertTriangle, Save, X } from "lucide-react"

interface DiscardChangesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  title?: string
  description?: string
  unsavedChangesCount?: number
  year?: number
  mes?: string
}

export function DiscardChangesDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "¿Descartar cambios?",
  description,
  unsavedChangesCount,
  year,
  mes
}: DiscardChangesDialogProps) {
  const getDescription = () => {
    if (description) return description
    
    if (unsavedChangesCount !== undefined && year && mes) {
      return `Tienes ${unsavedChangesCount} ${unsavedChangesCount === 1 ? 'cambio sin guardar' : 'cambios sin guardar'} para el año ${year} y mes ${mes}.\n\n¿Qué deseas hacer?`
    }
    
    return "Tienes cambios sin guardar.\n\n¿Qué deseas hacer?"
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {getDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Seguir editando
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700 flex items-center gap-2">
            <X className="h-4 w-4" />
            Descartar cambios
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
