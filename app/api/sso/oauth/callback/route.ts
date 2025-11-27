/**
 * OAuth Callback Endpoint
 * Processes OAuth authorization codes from Identity Providers
 * This is a public endpoint (no auth required - called by IdP)
 */

import { NextResponse } from 'next/server'
import { processOAuthCallback } from '@/lib/sso/oauth'
import { cookies } from 'next/headers'
import { createPublicRoute, badRequestError } from '@/lib/api'
import { getAppUrl } from '@/lib/utils'

/**
 * GET /api/sso/oauth/callback
 * OAuth callback endpoint
 * Receives authorization code from IdP
 * Query params:
 *   - code: authorization code
 *   - state: state parameter (format: "orgId:redirectUrl")
 *   - error: error code (if authorization failed)
 *   - error_description: error description
 */
export const GET = createPublicRoute(async (request, _context) => {
  const { searchParams } = new URL(request.url)

  // Check for OAuth error
  const error = searchParams.get('error')
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Authorization failed'
    const errorUrl = new URL('/auth/sso-error', request.url)
    errorUrl.searchParams.set('error', errorDescription)
    errorUrl.searchParams.set('code', error)

    return NextResponse.redirect(errorUrl)
  }

  // Get code and state
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    throw badRequestError('Missing authorization code')
  }

  if (!state) {
    throw badRequestError('Missing state parameter')
  }

  // Extract organization ID and redirect URL from state
  // State format: "orgId:redirectUrl" or just "orgId"
  const parts = state.split(':')
  const organizationId = parts[0]
  const redirectUrl = parts.length > 1 ? parts.slice(1).join(':') : '/dashboard'

  // Get client IP and user agent for logging
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Build redirect URI (must match the one used in authorization request)
  const baseUrl = getAppUrl()
  const callbackUrl = `${baseUrl}/api/sso/oauth/callback`

  // Process OAuth callback
  const result = await processOAuthCallback(
    code,
    state,
    organizationId,
    callbackUrl,
    {
      ip_address: ip,
      user_agent: userAgent,
    }
  )

  if (!result.success) {
    // Redirect to error page with error message
    const errorUrl = new URL('/auth/sso-error', request.url)
    errorUrl.searchParams.set('error', result.error || 'Authentication failed')
    errorUrl.searchParams.set('code', result.errorCode || 'unknown')

    return NextResponse.redirect(errorUrl)
  }

  // Success - create session and redirect
  const successUrl = new URL(redirectUrl, request.url)
  successUrl.searchParams.set('sso', 'success')

  const response = NextResponse.redirect(successUrl)

  // Set a cookie to indicate SSO login success
  // In production, this would be handled by your auth system
  const _cookieStore = cookies()
  response.cookies.set('sso_login', 'success', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 5, // 5 minutes
  })

  return response
})
