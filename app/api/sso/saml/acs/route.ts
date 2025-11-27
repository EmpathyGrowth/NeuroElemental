/**
 * SAML Assertion Consumer Service (ACS) Endpoint
 * Processes SAML responses from Identity Providers
 * This is a public endpoint (no auth required - called by IdP)
 */

import { NextResponse } from 'next/server'
import { processSAMLResponse } from '@/lib/sso/saml'
import { cookies } from 'next/headers'
import { createPublicRoute, badRequestError } from '@/lib/api'

/**
 * POST /api/sso/saml/acs
 * SAML Assertion Consumer Service endpoint
 * Receives SAML responses from IdP
 */
export const POST = createPublicRoute(async (request, _context) => {
  // Parse form data (SAML uses POST binding with form-encoded data)
  const formData = await request.formData()
  const samlResponse = formData.get('SAMLResponse') as string
  const relayState = formData.get('RelayState') as string | null

  if (!samlResponse) {
    throw badRequestError('Missing SAMLResponse')
  }

  // Extract organization ID from RelayState
  // RelayState format: "orgId:redirectUrl" or just "orgId"
  let organizationId: string
  let redirectUrl = '/dashboard'

  if (relayState) {
    const parts = relayState.split(':')
    organizationId = parts[0]
    if (parts.length > 1) {
      redirectUrl = parts.slice(1).join(':')
    }
  } else {
    throw badRequestError('Missing RelayState (organization ID)')
  }

  // Get client IP and user agent for logging
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  // Process SAML response
  const result = await processSAMLResponse(samlResponse, organizationId, {
    ip_address: ip,
    user_agent: userAgent,
  })

  if (!result.success) {
    // Redirect to error page with error message
    const errorUrl = new URL('/auth/sso-error', request.url)
    errorUrl.searchParams.set('error', result.error || 'Authentication failed')
    errorUrl.searchParams.set('code', result.errorCode || 'unknown')

    return NextResponse.redirect(errorUrl)
  }

  // Success - create session and redirect
  // In production, you would create a proper session here
  // For now, redirect to success page
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
