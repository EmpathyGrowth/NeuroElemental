/**
 * Health Check Endpoints
 * GET /api/health - Basic health check for load balancers
 *
 * Returns:
 * - 200 OK: Application is healthy
 * - 503 Service Unavailable: Application is unhealthy
 */

import { createPublicRoute, successResponse, internalError } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db/supabase-server'
import { logger } from '@/lib/logging'
import { hasEnvVar } from '@/lib/utils/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  checks: {
    database: CheckResult
    environment: CheckResult
    services: CheckResult
  }
}

interface CheckResult {
  status: 'pass' | 'warn' | 'fail'
  message?: string
  latencyMs?: number
}

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<CheckResult> {
  const startTime = Date.now()

  try {
    const supabase = getSupabaseServer()

    // Simple query to verify connectivity
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle()

    const latencyMs = Date.now() - startTime

    if (error) {
      logger.error('Health check: Database query failed', error)
      return {
        status: 'fail',
        message: 'Database query failed',
        latencyMs,
      }
    }

    // Warn if latency is high (> 1 second)
    if (latencyMs > 1000) {
      return {
        status: 'warn',
        message: 'Database latency is high',
        latencyMs,
      }
    }

    return {
      status: 'pass',
      latencyMs,
    }
  } catch (err) {
    const latencyMs = Date.now() - startTime
    logger.error('Health check: Database connection failed', err instanceof Error ? err : undefined)
    return {
      status: 'fail',
      message: 'Database connection failed',
      latencyMs,
    }
  }
}

/**
 * Check critical environment variables
 */
function checkEnvironment(): CheckResult {
  const criticalVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ]

  const missingVars = criticalVars.filter(v => !process.env[v])

  if (missingVars.length > 0) {
    return {
      status: 'fail',
      message: `Missing critical env vars: ${missingVars.join(', ')}`,
    }
  }

  // Check optional but recommended vars
  const optionalVars = ['STRIPE_SECRET_KEY', 'CRON_SECRET', 'RESEND_API_KEY']
  const missingOptional = optionalVars.filter(v => !hasEnvVar(v as 'STRIPE_SECRET_KEY' | 'CRON_SECRET'))

  if (missingOptional.length > 0) {
    return {
      status: 'warn',
      message: `Missing optional env vars: ${missingOptional.join(', ')}`,
    }
  }

  return { status: 'pass' }
}

/**
 * Check external services (basic availability)
 */
function checkServices(): CheckResult {
  // For now, just check if Stripe is configured
  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY
  const emailConfigured = !!process.env.RESEND_API_KEY

  if (!stripeConfigured && !emailConfigured) {
    return {
      status: 'warn',
      message: 'No external services configured (Stripe, Email)',
    }
  }

  return { status: 'pass' }
}

/**
 * GET /api/health
 * Basic health check endpoint for load balancers and monitoring
 */
export const GET = createPublicRoute(async () => {
  const startTime = Date.now()

  // Run all checks
  const [databaseCheck, environmentCheck, servicesCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkEnvironment()),
    Promise.resolve(checkServices()),
  ])

  // Determine overall status
  const checks = {
    database: databaseCheck,
    environment: environmentCheck,
    services: servicesCheck,
  }

  const hasFail = Object.values(checks).some(c => c.status === 'fail')
  const hasWarn = Object.values(checks).some(c => c.status === 'warn')

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
  if (hasFail) {
    overallStatus = 'unhealthy'
  } else if (hasWarn) {
    overallStatus = 'degraded'
  } else {
    overallStatus = 'healthy'
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.0.0',
    checks,
  }

  // Log health check results if unhealthy
  if (overallStatus === 'unhealthy') {
    logger.error('Health check failed', undefined, { checks, duration: Date.now() - startTime })
    throw internalError('Service unhealthy')
  }

  return successResponse(healthStatus)
})
