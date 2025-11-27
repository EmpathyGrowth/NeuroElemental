'use client'

/**
 * Global Error Handler
 * Catches errors that escape the root layout
 */

export default function GlobalError({
  error: _error, reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: '32rem',
            textAlign: 'center',
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '1rem',
            }}>
              Something went wrong!
            </h1>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
            }}>
              We encountered a critical error. Please try reloading the page.
            </p>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
