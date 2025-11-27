'use client'

/**
 * Global Error Handler
 * Catches critical errors that escape the root layout
 * Must include its own <html> and <body> tags since it replaces the entire document
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#fafafa',
          }}
        >
          <div
            style={{
              maxWidth: '28rem',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '4rem',
                height: '4rem',
                margin: '0 auto 1.5rem',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.5rem',
              }}
            >
              Server Error
            </h1>

            <p
              style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: '1.5',
              }}
            >
              We're sorry, but something went wrong on our end. Our team has
              been notified and is working to fix the issue.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>

              <a
                href="/"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  display: 'inline-block',
                }}
              >
                Return Home
              </a>
            </div>

            {error.digest && (
              <p
                style={{
                  marginTop: '1.5rem',
                  fontSize: '0.75rem',
                  color: '#9ca3af',
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
