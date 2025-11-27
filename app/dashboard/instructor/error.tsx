'use client'

import { SectionError } from '@/components/error-boundary'

export default function InstructorDashboardError({
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
      title="Instructor Dashboard Error"
      description="We couldn't load your instructor dashboard. Please try again."
      returnUrl="/dashboard"
      returnLabel="Return to Dashboard"
    />
  )
}
