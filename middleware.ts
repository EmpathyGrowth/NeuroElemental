/**
 * Next.js Middleware
 * Handles rate limiting, CSRF protection, and request validation
 * Runs on the Edge runtime for all matching routes
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter for Edge runtime
// In production with multiple instances, use Upstash Redis
const ipRequests = new Map<string, { count: number; resetTime: number }>()

// Rate limit configurations by route type
const RATE_LIMITS = {
  // Public API endpoints - stricter limits
  public: { limit: 30, windowMs: 60 * 1000 }, // 30 req/min
  // Auth endpoints - very strict to prevent brute force
  auth: { limit: 5, windowMs: 60 * 1000 }, // 5 req/min
  // Webhooks - need higher limits for legitimate traffic
  webhook: { limit: 100, windowMs: 60 * 1000 }, // 100 req/min
  // General API - moderate limits
  api: { limit: 60, windowMs: 60 * 1000 }, // 60 req/min
  // Health checks - no rate limiting
  health: { limit: 1000, windowMs: 60 * 1000 }, // Effectively unlimited
}

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

/**
 * Check if request is rate limited
 */
function checkRateLimit(
  ip: string,
  routeType: keyof typeof RATE_LIMITS
): { limited: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[routeType]
  const now = Date.now()
  const key = `${ip}:${routeType}`

  const record = ipRequests.get(key)

  // Clean up expired entries periodically
  if (ipRequests.size > 10000) {
    for (const [k, v] of ipRequests.entries()) {
      if (now > v.resetTime) {
        ipRequests.delete(k)
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    ipRequests.set(key, { count: 1, resetTime: now + config.windowMs })
    return { limited: false, remaining: config.limit - 1, resetIn: config.windowMs }
  }

  if (record.count >= config.limit) {
    return {
      limited: true,
      remaining: 0,
      resetIn: Math.max(0, record.resetTime - now),
    }
  }

  record.count++
  return {
    limited: false,
    remaining: config.limit - record.count,
    resetIn: Math.max(0, record.resetTime - now),
  }
}

/**
 * Determine route type for rate limiting
 */
function getRouteType(pathname: string): keyof typeof RATE_LIMITS {
  // Health checks
  if (pathname.startsWith('/api/health')) {
    return 'health'
  }

  // Webhooks
  if (
    pathname.includes('/webhook') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/billing/webhook')
  ) {
    return 'webhook'
  }

  // Auth endpoints
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/sso') ||
    pathname.startsWith('/auth')
  ) {
    return 'auth'
  }

  // Public API routes that don't require authentication
  if (
    pathname.startsWith('/api/waitlist') ||
    pathname.startsWith('/api/certificates/verify') ||
    pathname.startsWith('/api/pricing') ||
    pathname.startsWith('/api/courses') && !pathname.includes('/enroll')
  ) {
    return 'public'
  }

  // General API routes
  if (pathname.startsWith('/api/')) {
    return 'api'
  }

  return 'api'
}

/**
 * Validate CSRF for state-changing requests
 * Uses the double-submit cookie pattern for API routes
 */
function validateCsrf(request: NextRequest): boolean {
  // Only validate for state-changing methods
  const method = request.method
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return true
  }

  // Skip CSRF for:
  // - Webhooks (have their own signature verification)
  // - Public API calls with API keys
  // - Same-origin requests (checked via Origin/Referer)
  const pathname = request.nextUrl.pathname

  if (
    pathname.includes('/webhook') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/billing/webhook') ||
    pathname.startsWith('/api/cron/')
  ) {
    return true
  }

  // Check for API key authentication (skip CSRF)
  if (request.headers.get('x-api-key')) {
    return true
  }

  // For browser requests, validate origin
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // If no origin or referer, it might be a direct API call
  // In that case, require authentication headers
  if (!origin && !referer) {
    // Allow if it has auth header (programmatic access)
    if (request.headers.get('authorization')) {
      return true
    }
    // Block potentially malicious requests without origin
    return false
  }

  // Validate origin matches our app
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const allowedOrigins = [
    appUrl,
    new URL(appUrl).origin,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]

  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
    return true
  }

  // Check referer as fallback
  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed.replace(/\/$/, '')))) {
    return true
  }

  return false
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next()
  }

  // Get client IP
  const ip = getClientIp(request)

  // Determine route type
  const routeType = getRouteType(pathname)

  // Check rate limit
  const { limited, remaining, resetIn } = checkRateLimit(ip, routeType)

  if (limited) {
    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil(resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(resetIn / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMITS[routeType].limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + resetIn).toISOString(),
        },
      }
    )
  }

  // CSRF validation for API routes
  if (pathname.startsWith('/api/') && !validateCsrf(request)) {
    return NextResponse.json(
      {
        error: 'Forbidden',
        message: 'Invalid or missing origin. CSRF validation failed.',
      },
      { status: 403 }
    )
  }

  // Add rate limit headers to response
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-RateLimit-Limit', RATE_LIMITS[routeType].limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + resetIn).toISOString())

  // Add request ID for tracing
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  return response
}

// Configure which routes use middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
