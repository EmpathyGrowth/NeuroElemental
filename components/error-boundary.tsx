'use client'

/**
 * Reusable Error Boundary Component
 * Can be customized per section with different return URLs and messages
 */

import { logger } from '@/lib/logging'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

interface SectionErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  description?: string
  returnUrl?: string
  returnLabel?: string
}

export function SectionError({
  error,
  reset,
  title = 'Something went wrong',
  description = 'We encountered an error loading this page.',
  returnUrl = '/dashboard',
  returnLabel = 'Return to Dashboard',
}: SectionErrorProps) {
  useEffect(() => {
    logger.error('Section error:', error, {
      digest: error.digest,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    })
  }, [error])

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{description}</p>

          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-lg bg-red-50 p-3 text-left">
              <p className="font-mono text-xs text-red-800">{error.message}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => reset()} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = returnUrl)}
            >
              <Home className="mr-2 h-4 w-4" />
              {returnLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
