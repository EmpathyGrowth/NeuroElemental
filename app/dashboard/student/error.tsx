'use client'

import { SectionError } from '@/components/error-boundary'

export default function StudentDashboardError({
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
      title="Student Dashboard Error"
      description="We couldn't load your student dashboard. Please try again."
      returnUrl="/dashboard"
      returnLabel="Return to Dashboard"
    />
  )
}
