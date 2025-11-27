/**
 * Environment Variable Utilities
 * Safe access to environment variables with appropriate fallbacks
 */

/**
 * Gets the application base URL
 * In production, requires NEXT_PUBLIC_APP_URL to be set
 * In development, falls back to localhost:3000
 *
 * @throws Error if NEXT_PUBLIC_APP_URL is not set in production
 */
export function getAppUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (appUrl) {
    return appUrl
  }

  // In production, require the env var
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is required in production')
  }

  // In development, allow localhost fallback
  return 'http://localhost:3000'
}

/**
 * Gets a required environment variable
 * Throws an error if the variable is not set
 *
 * @param name - The environment variable name
 * @param description - Optional description for error message
 * @throws Error if the environment variable is not set
 */
export function getRequiredEnv(name: string, description?: string): string {
  const value = process.env[name]

  if (!value) {
    const desc = description ? ` (${description})` : ''
    throw new Error(`Required environment variable ${name}${desc} is not set`)
  }

  return value
}

/**
 * Gets an optional environment variable with a default
 *
 * @param name - The environment variable name
 * @param defaultValue - The default value if not set
 */
export function getOptionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue
}
