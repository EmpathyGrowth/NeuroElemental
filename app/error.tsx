'use client'

/**
 * Global Error Boundary
 * Catches errors in the app and displays a friendly error message
 */

import { logger } from '@/lib/logging';
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error with context
    logger.error('Application error:', error as Error, {
      digest: error.digest,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
    })

    // Production error tracking
    // To enable Sentry:
    // 1. Install: npm install @sentry/nextjs
    // 2. Run: npx @sentry/wizard@latest -i nextjs
    // 3. Uncomment the following:
    // import * as Sentry from '@sentry/nextjs';
    // Sentry.captureException(error, {
    //   extra: { digest: error.digest },
    // });
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-red-600">Oops!</h1>
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-gray-600">
            We encountered an unexpected error. Our team has been notified.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="rounded-lg bg-red-50 p-4 text-left">
            <p className="font-mono text-sm text-red-800">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 font-mono text-xs text-red-600">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Button
            onClick={() => reset()}
            className="w-full"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="w-full"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
}
