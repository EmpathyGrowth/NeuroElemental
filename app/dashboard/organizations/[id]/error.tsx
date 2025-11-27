'use client'

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function OrganizationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h1 className="text-2xl font-bold">Error Loading Organization</h1>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'Could not load organization data'}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => window.location.href = '/dashboard/organizations'}>
          Back to Organizations
        </Button>
      </div>
    </div>
  )
}
