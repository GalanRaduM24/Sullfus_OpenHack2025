import { useState, useCallback } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((toast: Toast) => {
    // For now, just use console.log
    // In a real implementation, this would show a toast notification
    console.log('Toast:', toast)
    
    // You can also use window.alert for immediate feedback
    if (toast.variant === 'destructive') {
      console.error(toast.title, toast.description)
    } else {
      console.log(toast.title, toast.description)
    }
  }, [])

  return { toast, toasts }
}
