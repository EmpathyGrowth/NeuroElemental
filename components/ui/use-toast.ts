'use client'

import { toast as sonnerToast } from 'sonner'

/**
 * Custom hook wrapper for toast notifications using sonner
 * Provides a consistent API similar to shadcn/ui toast
 */
export function useToast() {
  return {
    toast: ({
      title,
      description,
      variant = 'default',
      ...props
    }: {
      title?: string
      description?: string
      variant?: 'default' | 'destructive'
      action?: React.ReactNode
    }) => {
      const message = title || description || ''

      if (variant === 'destructive') {
        return sonnerToast.error(message, {
          description: title && description ? description : undefined,
          ...props,
        })
      }

      return sonnerToast(message, {
        description: title && description ? description : undefined,
        ...props,
      })
    },
  }
}
