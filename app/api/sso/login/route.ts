/**
 * SSO Login Initiation Endpoint
 * Initiates SSO login flow based on email domain
 * Public endpoint (no auth required - used for login)
 */

import { checkSSORequired, getSSOProvider } from '@/lib/sso/manage'
import { generateSAMLAuthnRequest, encodeSAMLRequest, buildSAMLSSOUrl } from '@/lib/sso/saml'
import { generateOAuthAuthorizationUrl } from '@/lib/sso/oauth'
import { createPublicRoute, badRequestError, notFoundError, successResponse, validateRequest } from '@/lib/api'
import { ssoLoginSchema } from '@/lib/validation/schemas'
import { getAppUrl } from '@/lib/utils'

/**
 * POST /api/sso/login
 * Initiate SSO login
 * Request body:
 *   - email: user email address
 *   - redirectUrl: URL to redirect to after successful login (optional)
 */
export const POST = createPublicRoute(async (request, _context) => {
  // Validate request body
  const validation = await validateRequest(request, ssoLoginSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { email: rawEmail, redirectUrl = '/dashboard' } = validation.data
  const email = rawEmail.toLowerCase().trim()

  // Check if email domain requires SSO
  const ssoCheck = await checkSSORequired(email)

  if (!ssoCheck.required || !ssoCheck.provider) {
    return successResponse({
      required: false,
      message: 'SSO not required for this email domain',
    })
  }

  // Get full provider configuration
  const provider = await getSSOProvider(ssoCheck.provider.organization_id)

  if (!provider) {
    throw notFoundError('SSO provider')
  }

  const baseUrl = getAppUrl()

  // Generate SSO redirect URL based on provider type
  let ssoUrl: string

  if (provider.provider_type === 'saml') {
    // Generate SAML AuthnRequest
    const entityId = `${baseUrl}/api/sso/saml/sp/${provider.organization_id}`
    const acsUrl = `${baseUrl}/api/sso/saml/acs`

    const { xml } = generateSAMLAuthnRequest(
      provider.id,
      acsUrl,
      entityId
    )

    const encodedRequest = encodeSAMLRequest(xml)

    // RelayState contains org ID and redirect URL
    const relayState = `${provider.organization_id}:${redirectUrl}`

    if (!provider.saml_sso_url) {
      throw badRequestError('SAML SSO URL not configured')
    }

    ssoUrl = buildSAMLSSOUrl(provider.saml_sso_url, encodedRequest, relayState)
  } else if (provider.provider_type === 'oauth' || provider.provider_type === 'oidc') {
    // Generate OAuth authorization URL
    if (!provider.oauth_client_id || !provider.oauth_authorize_url) {
      throw badRequestError('OAuth configuration incomplete')
    }

    const callbackUrl = `${baseUrl}/api/sso/oauth/callback`

    // State contains org ID and redirect URL
    const state = `${provider.organization_id}:${redirectUrl}`

    const scopes = provider.oauth_scopes || ['openid', 'profile', 'email']

    const authUrl = generateOAuthAuthorizationUrl(
      provider.oauth_authorize_url,
      provider.oauth_client_id,
      callbackUrl,
      scopes,
      state
    )

    ssoUrl = authUrl.url
  } else {
    throw badRequestError('Unsupported provider type')
  }

  return successResponse({
    required: true,
    provider: {
      name: provider.provider_name,
      type: provider.provider_type,
    },
    redirectUrl: ssoUrl,
  })
})
