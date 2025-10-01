import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface UseUnsavedChangesProps {
  hasUnsavedChanges: boolean
  onConfirmDiscard: () => void
  onCancelDiscard: () => void
}

export function useUnsavedChanges({ 
  hasUnsavedChanges, 
  onConfirmDiscard, 
  onCancelDiscard 
}: UseUnsavedChangesProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isNavigating = useRef(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [isUrlChangeBlocked, setIsUrlChangeBlocked] = useState(false)

  // Función para mostrar el diálogo de confirmación
  const requestDiscardConfirmation = useCallback((action: () => void) => {
    setPendingAction(() => action)
    setShowDiscardDialog(true)
  }, [])

  // Interceptar navegación del router
  const navigateWithConfirmation = useCallback((url: string) => {
    if (hasUnsavedChanges && !isNavigating.current) {
      requestDiscardConfirmation(() => {
        router.push(url)
        isNavigating.current = false
      })
    } else {
      router.push(url)
    }
  }, [hasUnsavedChanges, requestDiscardConfirmation, router])

  // Interceptar cambios de estado (año, mes, módulo)
  const handleStateChange = useCallback((changeFunction: () => void) => {
    if (hasUnsavedChanges) {
      requestDiscardConfirmation(changeFunction)
    } else {
      changeFunction()
    }
  }, [hasUnsavedChanges, requestDiscardConfirmation])

  // Confirmar descarte
  const confirmDiscard = useCallback(() => {
    setShowDiscardDialog(false)
    onConfirmDiscard()
    if (pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }, [onConfirmDiscard, pendingAction])

  // Cancelar descarte
  const cancelDiscard = useCallback(() => {
    setShowDiscardDialog(false)
    onCancelDiscard()
    setPendingAction(null)
  }, [onCancelDiscard])

  // Interceptar cambios de URL (navegación del navegador)
  useEffect(() => {
    let currentUrl = window.location.href
    
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges && !isUrlChangeBlocked) {
        // Prevenir la navegación volviendo a la URL actual
        window.history.pushState(null, '', currentUrl)
        
        // Mostrar el diálogo de confirmación
        requestDiscardConfirmation(() => {
          setIsUrlChangeBlocked(true)
          // Permitir la navegación después de confirmar
          setTimeout(() => {
            window.history.back()
            setIsUrlChangeBlocked(false)
          }, 100)
        })
      } else {
        // Actualizar la URL actual si no hay cambios pendientes
        currentUrl = window.location.href
      }
    }

    // Interceptar navegación hacia atrás/adelante
    window.addEventListener('popstate', handlePopState)
    
    // Interceptar cambios de URL programáticos
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState
    
    window.history.pushState = function(...args) {
      if (hasUnsavedChanges && !isUrlChangeBlocked) {
        requestDiscardConfirmation(() => {
          setIsUrlChangeBlocked(true)
          originalPushState.apply(this, args)
          currentUrl = window.location.href
          setIsUrlChangeBlocked(false)
        })
        return
      }
      originalPushState.apply(this, args)
      currentUrl = window.location.href
    }
    
    window.history.replaceState = function(...args) {
      if (hasUnsavedChanges && !isUrlChangeBlocked) {
        requestDiscardConfirmation(() => {
          setIsUrlChangeBlocked(true)
          originalReplaceState.apply(this, args)
          currentUrl = window.location.href
          setIsUrlChangeBlocked(false)
        })
        return
      }
      originalReplaceState.apply(this, args)
      currentUrl = window.location.href
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [hasUnsavedChanges, isUrlChangeBlocked, requestDiscardConfirmation])

  // Interceptar el evento beforeunload del navegador (cerrar pestaña/ventana)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        // Mensaje más claro y consistente con shadcn/ui
        const message = '⚠️ ¿Descartar cambios?\n\nTienes cambios sin guardar. Si continúas, se perderán todos los cambios no guardados.\n\n¿Estás seguro de que quieres salir?'
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  return {
    navigateWithConfirmation,
    handleStateChange,
    showDiscardDialog,
    confirmDiscard,
    cancelDiscard
  }
}

