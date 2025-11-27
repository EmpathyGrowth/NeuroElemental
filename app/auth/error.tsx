'use client'

import { SectionError } from '@/components/error-boundary'

export default function AuthError({
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
      title="Authentication Error"
      description="We encountered a problem with the authentication process. Please try again."
      returnUrl="/"
      returnLabel="Go to Home"
    />
  )
}
