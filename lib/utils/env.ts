/**
 * Environment Variable Utilities
 * Safe access to environment variables with appropriate fallbacks
 */

import { logger } from '@/lib/logging'

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

/**
 * Critical environment variables required for production
 */
const CRITICAL_ENV_VARS = {
  // Core Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase project URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase anonymous key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key for admin operations',

  // Stripe (if billing enabled)
  STRIPE_SECRET_KEY: 'Stripe secret key for payment processing',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook signature verification',

  // Security
  CRON_SECRET: 'Secret for authenticating cron job requests',
} as const

/**
 * Optional environment variables that enhance functionality
 */
const OPTIONAL_ENV_VARS = {
  NEXT_PUBLIC_APP_URL: 'Application URL (defaults to localhost in dev)',
  RESEND_API_KEY: 'Resend API key for transactional emails',
  SENTRY_DSN: 'Sentry DSN for error tracking',
  REDIS_URL: 'Redis connection URL for caching',
} as const

type CriticalEnvVar = keyof typeof CRITICAL_ENV_VARS
type OptionalEnvVar = keyof typeof OPTIONAL_ENV_VARS

/**
 * Result of environment validation
 */
export interface EnvValidationResult {
  valid: boolean
  missing: Array<{ name: string; description: string }>
  warnings: Array<{ name: string; description: string }>
}

/**
 * Validates all critical environment variables are set
 * Logs warnings for missing optional vars
 *
 * Call this at application startup in production
 *
 * @returns Validation result with missing and warning arrays
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: Array<{ name: string; description: string }> = []
  const warnings: Array<{ name: string; description: string }> = []

  // Check critical vars
  for (const [name, description] of Object.entries(CRITICAL_ENV_VARS)) {
    if (!process.env[name]) {
      missing.push({ name, description })
    }
  }

  // Check optional vars (only warn)
  for (const [name, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[name]) {
      warnings.push({ name, description })
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Logs environment validation results
 * In production, throws if critical vars are missing
 *
 * @param exitOnError - Whether to throw on missing critical vars (default: production only)
 */
export function logEnvironmentStatus(exitOnError?: boolean): void {
  const result = validateEnvironment()
  const shouldExit = exitOnError ?? process.env.NODE_ENV === 'production'

  if (result.missing.length > 0) {
    logger.error('Missing critical environment variables:', undefined, {
      vars: result.missing.map(v => `${v.name}: ${v.description}`),
    })

    if (shouldExit) {
      throw new Error(
        `Missing critical environment variables: ${result.missing.map(v => v.name).join(', ')}`
      )
    }
  }

  if (result.warnings.length > 0) {
    logger.info('Missing optional environment variables (functionality may be limited):', {
      vars: result.warnings.map(v => `${v.name}: ${v.description}`),
    })
  }

  if (result.valid && result.warnings.length === 0) {
    logger.info('All environment variables configured correctly')
  }
}

/**
 * Check if a specific critical env var is configured
 * Useful for feature flags based on env availability
 */
export function hasEnvVar(name: CriticalEnvVar | OptionalEnvVar): boolean {
  return !!process.env[name]
}

/**
 * Gets CRON_SECRET with validation
 * Throws a clear error if not configured
 */
export function getCronSecret(): string {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    throw new Error(
      'CRON_SECRET environment variable is not configured. ' +
      'Cron endpoints require this for authentication.'
    )
  }
  return secret
}

/**
 * Gets STRIPE_WEBHOOK_SECRET with validation
 * Throws a clear error if not configured
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET environment variable is not configured. ' +
      'Stripe webhooks require this for signature verification.'
    )
  }
  return secret
}
