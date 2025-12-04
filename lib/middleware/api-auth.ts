/**
 * Unified Authentication Middleware
 * Supports both session-based auth (web app) and API key auth (programmatic)
 */

import { NextRequest, NextResponse } from 'next/server'
import { validateApiKey, hasScope, type ApiScope } from '@/lib/api-keys'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { withRateLimit, addRateLimitHeaders, checkRateLimit } from '@/lib/middleware/rate-limiter'
import { logger } from '@/lib/logging'

export interface ApiAuthResult {
  authenticated: boolean
  authMethod?: 'session' | 'api_key'
  error?: string
  organizationId?: string
  userId?: string
  scopes?: string[]
  keyId?: string
}

/**
 * Extract API key from request headers
 * Supports both "Authorization: Bearer <key>" and "X-API-Key: <key>"
 */
function extractApiKey(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('x-api-key')
  if (apiKeyHeader) {
    return apiKeyHeader
  }

  return null
}

/**
 * Authenticate request using API key OR session
 * Tries API key first, then falls back to session
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<ApiAuthResult> {
  // Try API key authentication first
  const apiKey = extractApiKey(request)

  if (apiKey) {
    const validation = await validateApiKey(apiKey)

    if (!validation.valid) {
      return {
        authenticated: false,
        error: validation.error || 'Invalid API key',
      }
    }

    if (!validation.key) {
      return {
        authenticated: false,
        error: 'API key validation failed',
      }
    }

    // API key authentication successful
    // Note: api_keys table uses 'created_by' instead of 'user_id'
    return {
      authenticated: true,
      authMethod: 'api_key',
      organizationId: validation.key.organization_id as string | undefined,
      userId: (validation.key.created_by as string | undefined) || undefined,
      scopes: validation.key.scopes as string[] | undefined,
      keyId: validation.key.id as string | undefined,
    }
  }

  // Try session authentication
  try {
    const user = await getCurrentUser()

    if (user) {
      // Session authentication successful
      // Note: Session auth has ALL scopes by default (trusted user)
      return {
        authenticated: true,
        authMethod: 'session',
        userId: user.id,
        scopes: [], // Session auth bypasses scope checks
      }
    }
  } catch (error) {
    logger.error('Session auth error', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
  }

  // No authentication method succeeded
  return {
    authenticated: false,
    error: 'Authentication required. Provide session cookie or API key.',
  }
}

/**
 * Check if authenticated user has required scope
 * Session auth bypasses scope checks (trusted user)
 * API key auth requires specific scopes
 */
export function checkApiScope(
  authResult: ApiAuthResult,
  requiredScope: ApiScope
): { authorized: boolean; error?: string } {
  if (!authResult.authenticated) {
    return {
      authorized: false,
      error: 'Not authenticated',
    }
  }

  // Session auth has all permissions (trusted user via web app)
  if (authResult.authMethod === 'session') {
    return { authorized: true }
  }

  // API key auth requires specific scopes
  if (!authResult.scopes) {
    return {
      authorized: false,
      error: 'No scopes available',
    }
  }

  if (!hasScope(authResult.scopes, requiredScope)) {
    return {
      authorized: false,
      error: `Missing required scope: ${requiredScope}`,
    }
  }

  return { authorized: true }
}

/**
 * Middleware wrapper for routes that require authentication and specific scopes
 * Supports both session auth and API key auth
 *
 * Example usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAuth(request, ['credits:read'])
 *   if (auth.error) {
 *     return auth.error // Returns NextResponse with error
 *   }
 *
 *   // auth.data contains { userId, organizationId?, authMethod, ... }
 *   const { userId, authMethod } = auth.data
 *   // ... handle request
 * }
 * ```
 */
export async function requireAuth(
  request: NextRequest,
  requiredScopes: ApiScope[] = []
): Promise<
  | { error: NextResponse; data: null }
  | {
      error: null
      data: {
        userId: string
        authMethod: 'session' | 'api_key'
        organizationId?: string
        scopes?: string[]
        keyId?: string
      }
    }
> {
  // Authenticate request (tries API key, then session)
  const authResult = await authenticateRequest(request)

  if (!authResult.authenticated) {
    return {
      error: NextResponse.json(
        { error: authResult.error || 'Authentication failed' },
        { status: 401 }
      ),
      data: null,
    }
  }

  // Check required scopes (only applies to API key auth)
  if (requiredScopes.length > 0) {
    for (const scope of requiredScopes) {
      const scopeCheck = checkApiScope(authResult, scope)
      if (!scopeCheck.authorized) {
        return {
          error: NextResponse.json(
            { error: scopeCheck.error || 'Insufficient permissions' },
            { status: 403 }
          ),
          data: null,
        }
      }
    }
  }

  return {
    error: null,
    data: {
      userId: authResult.userId!,
      authMethod: authResult.authMethod!,
      organizationId: authResult.organizationId,
      scopes: authResult.scopes,
      keyId: authResult.keyId,
    },
  }
}

// Backwards compatibility alias
export const requireApiAuth = requireAuth

/**
 * Create a standardized error response for API authentication failures
 */
export function createApiErrorResponse(
  error: string,
  statusCode: number = 401
): NextResponse {
  return NextResponse.json(
    {
      error,
      code: statusCode === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN',
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

/**
 * Middleware wrapper with authentication AND rate limiting
 * Enforces both auth requirements and organization rate limits
 *
 * Example usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAuthWithRateLimit(request, {
 *     requiredScopes: ['credits:read'],
 *     organizationId: params.id
 *   })
 *
 *   if (auth.error) {
 *     return auth.error // Returns NextResponse with error (401, 403, or 429)
 *   }
 *
 *   // auth.data contains { userId, organizationId, authMethod, ... }
 *   // auth.response is the response to return (with rate limit headers)
 *   const { userId, organizationId } = auth.data
 *
 *   // ... handle request, then return response with rate limit headers
 *   return auth.addHeaders(NextResponse.json({ data }))
 * }
 * ```
 */
export async function requireAuthWithRateLimit(
  request: NextRequest,
  options: {
    requiredScopes?: ApiScope[]
    organizationId: string
    skipRateLimit?: boolean // For internal endpoints
  }
): Promise<
  | { error: NextResponse; data: null; addHeaders: null }
  | {
      error: null
      data: {
        userId: string
        authMethod: 'session' | 'api_key'
        organizationId: string
        scopes?: string[]
        keyId?: string
      }
      addHeaders: (response: NextResponse) => NextResponse
    }
> {
  // First, authenticate the request
  const authResult = await requireAuth(request, options.requiredScopes || [])

  if (authResult.error) {
    return {
      error: authResult.error,
      data: null,
      addHeaders: null,
    }
  }

  // Then, check rate limits (unless skipped)
  if (!options.skipRateLimit) {
    const rateLimitError = await withRateLimit(request, options.organizationId, {
      apiKeyId: authResult.data.keyId,
      userId: authResult.data.userId,
    })

    if (rateLimitError) {
      return {
        error: rateLimitError,
        data: null,
        addHeaders: null,
      }
    }
  }

  // Get current rate limit status for headers
  const rateLimitStatus = await checkRateLimit(options.organizationId, {
    apiKeyId: authResult.data.keyId,
    windowType: 'minute',
  })

  // Helper function to add rate limit headers to any response
  const addHeaders = (response: NextResponse): NextResponse => {
    return addRateLimitHeaders(response, rateLimitStatus)
  }

  return {
    error: null,
    data: {
      ...authResult.data,
      organizationId: options.organizationId,
    },
    addHeaders,
  }
}
