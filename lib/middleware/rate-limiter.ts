/**
 * Rate Limiting Middleware
 * Enforce API rate limits per organization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logging'

/** Window type for rate limiting */
type WindowType = 'minute' | 'hour' | 'day';

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp
  retryAfter?: number // Seconds
}

export interface RateLimitConfig {
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  burst_allowance: number
  webhooks_per_minute: number
  webhooks_per_hour: number
  max_concurrent_requests: number
  enforce_hard_limits: boolean
}

/**
 * Check rate limit for organization
 */
export async function checkRateLimit(
  organizationId: string,
  options?: {
    apiKeyId?: string
    windowType?: 'minute' | 'hour' | 'day'
    isWebhook?: boolean
  }
): Promise<RateLimitResult> {
  try {
    const supabase = createAdminClient()
    const windowType = options?.windowType || 'minute'

    // Call database function to check rate limit
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_organization_id: organizationId,
      p_api_key_id: options?.apiKeyId || null,
      p_window_type: windowType,
    })

    if (error) {
      logger.error('Error checking rate limit', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
      // Fail open - allow request if rate limit check fails
      return {
        allowed: true,
        limit: 60,
        remaining: 60,
        reset: Math.floor(Date.now() / 1000) + 60,
      }
    }

    if (!data || data.length === 0) {
      // No data returned, fail open
      return {
        allowed: true,
        limit: 60,
        remaining: 60,
        reset: Math.floor(Date.now() / 1000) + 60,
      }
    }

    const result = data[0]

    return {
      allowed: result.allowed,
      limit: result.limit_value,
      remaining: Math.max(0, result.limit_value - result.current_count),
      reset: Math.floor(Date.now() / 1000) + (result.retry_after ?? 60),
      retryAfter: result.allowed ? undefined : (result.retry_after ?? undefined),
    }
  } catch (error) {
    logger.error('Error in checkRateLimit', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    // Fail open
    return {
      allowed: true,
      limit: 60,
      remaining: 60,
      reset: Math.floor(Date.now() / 1000) + 60,
    }
  }
}

/**
 * Increment rate limit counter
 */
export async function incrementRateLimit(
  organizationId: string,
  options?: {
    apiKeyId?: string
    isWebhook?: boolean
  }
): Promise<void> {
  try {
    const supabase = createAdminClient()

    // Increment for all window types
    const windowTypes: WindowType[] = ['minute', 'hour', 'day']

    await Promise.all(
      windowTypes.map((windowType) =>
        supabase.rpc('increment_rate_limit', {
          p_organization_id: organizationId,
          p_api_key_id: options?.apiKeyId || null,
          p_window_type: windowType,
          p_is_webhook: options?.isWebhook || false,
        })
      )
    )
  } catch (error) {
    logger.error('Error incrementing rate limit', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    // Don't throw - increment failures shouldn't break requests
  }
}

/**
 * Log rate limit violation
 */
export async function logRateLimitViolation(params: {
  organizationId: string
  apiKeyId?: string
  userId?: string
  endpoint: string
  method: string
  limitType: string
  currentCount: number
  limitValue: number
  ipAddress?: string
  userAgent?: string
  retryAfter?: number
}): Promise<void> {
  try {
    const supabase = createAdminClient()

    await supabase.from('rate_limit_violations').insert({
      organization_id: params.organizationId,
      api_key_id: params.apiKeyId,
      user_id: params.userId,
      endpoint: params.endpoint,
      method: params.method,
      limit_type: params.limitType,
      current_count: params.currentCount,
      limit_value: params.limitValue,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
      response_status: 429,
      retry_after: params.retryAfter,
    })
  } catch (error) {
    logger.error('Error logging rate limit violation', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
  }
}

/**
 * Get rate limit config for organization
 */
export async function getRateLimitConfig(
  organizationId: string
): Promise<RateLimitConfig | null> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('rate_limit_configs')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (error || !data) {
      // Return default free tier if no config found
      const { data: tierData } = await supabase
        .from('rate_limit_tiers')
        .select('*')
        .eq('tier_name', 'free')
        .single()

      if (tierData) {
        return {
          requests_per_minute: tierData.requests_per_minute,
          requests_per_hour: tierData.requests_per_hour,
          requests_per_day: tierData.requests_per_day,
          burst_allowance: tierData.burst_allowance,
          webhooks_per_minute: tierData.webhooks_per_minute,
          webhooks_per_hour: tierData.webhooks_per_hour,
          max_concurrent_requests: tierData.max_concurrent_requests,
          enforce_hard_limits: true,
        }
      }

      return null
    }

    return data
  } catch (error) {
    logger.error('Error getting rate limit config', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return null
  }
}

/**
 * Update rate limit tier for organization
 */
export async function updateRateLimitTier(
  organizationId: string,
  tierName: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get tier details
    const { data: tier, error: tierError } = await supabase
      .from('rate_limit_tiers')
      .select('*')
      .eq('tier_name', tierName)
      .single()

    if (tierError || !tier) {
      return { success: false, error: 'Tier not found' }
    }

    // Update organization config
    const { error } = await supabase
      .from('rate_limit_configs')
      .upsert({
        organization_id: organizationId,
        tier: tierName,
        requests_per_minute: tier.requests_per_minute,
        requests_per_hour: tier.requests_per_hour,
        requests_per_day: tier.requests_per_day,
        burst_allowance: tier.burst_allowance,
        webhooks_per_minute: tier.webhooks_per_minute,
        webhooks_per_hour: tier.webhooks_per_hour,
        max_concurrent_requests: tier.max_concurrent_requests,
      })

    if (error) {
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error updating rate limit tier', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error }
  }
}

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit(
  request: NextRequest,
  organizationId: string,
  options?: {
    apiKeyId?: string
    userId?: string
    windowType?: 'minute' | 'hour' | 'day'
    isWebhook?: boolean
  }
): Promise<NextResponse | null> {
  const windowType = options?.windowType || 'minute'

  // Check all window types (minute, hour, day)
  const checks = await Promise.all([
    checkRateLimit(organizationId, {
      ...options,
      windowType: 'minute',
    }),
    checkRateLimit(organizationId, {
      ...options,
      windowType: 'hour',
    }),
    checkRateLimit(organizationId, {
      ...options,
      windowType: 'day',
    }),
  ])

  // Find first violation
  const violation = checks.find((check) => !check.allowed)

  if (violation) {
    // Log violation
    await logRateLimitViolation({
      organizationId,
      apiKeyId: options?.apiKeyId,
      userId: options?.userId,
      endpoint: request.nextUrl.pathname,
      method: request.method,
      limitType: `per_${windowType}`,
      currentCount: violation.limit - violation.remaining,
      limitValue: violation.limit,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      retryAfter: violation.retryAfter,
    })

    // Return 429 response
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${violation.retryAfter} seconds.`,
        limit: violation.limit,
        remaining: 0,
        reset: violation.reset,
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': violation.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': violation.reset.toString(),
          'Retry-After': (violation.retryAfter || 60).toString(),
        },
      }
    )
  }

  // Increment counters
  await incrementRateLimit(organizationId, {
    apiKeyId: options?.apiKeyId,
    isWebhook: options?.isWebhook,
  })

  // Add rate limit headers to response (to be added by caller)
  // Using the minute window for response headers
  const _minuteCheck = checks[0]

  return null // No rate limit violation
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  rateLimitResult: RateLimitResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString())

  return response
}

/**
 * Get current rate limit status
 */
export async function getRateLimitStatus(
  organizationId: string,
  options?: {
    apiKeyId?: string
  }
): Promise<{
  minute: RateLimitResult
  hour: RateLimitResult
  day: RateLimitResult
}> {
  const [minute, hour, day] = await Promise.all([
    checkRateLimit(organizationId, { ...options, windowType: 'minute' }),
    checkRateLimit(organizationId, { ...options, windowType: 'hour' }),
    checkRateLimit(organizationId, { ...options, windowType: 'day' }),
  ])

  return { minute, hour, day }
}

