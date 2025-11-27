'use client'

import { SectionError } from '@/components/error-boundary'

export default function BusinessDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <SectionError
      error={error}
      reset={reset}
      title="Business Dashboard Error"
      description="We couldn't load your business dashboard. Please try again."
      returnUrl="/dashboard"
      returnLabel="Return to Dashboard"
    />
  )
}
