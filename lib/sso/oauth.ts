/**
 * OAuth 2.0 / OIDC Authentication Handler
 * Handles OAuth and OpenID Connect SSO flows
 */

import crypto from 'crypto'
import { getSSOProvider, logSSOAuthAttempt, autoProvisionSSOUser } from './manage'
import { logger } from '@/lib/logging'

/**
 * Generate OAuth authorization URL
 */
export function generateOAuthAuthorizationUrl(
  authorizeUrl: string,
  clientId: string,
  redirectUri: string,
  scopes: string[],
  state?: string
): { url: string; state: string } {
  const generatedState = state || crypto.randomBytes(32).toString('hex')
  const nonce = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state: generatedState,
    nonce,
  })

  return {
    url: `${authorizeUrl}?${params.toString()}`,
    state: generatedState,
  }
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeOAuthCode(
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<{
  access_token: string
  id_token?: string
  token_type: string
  expires_in: number
  refresh_token?: string
}> {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    return await response.json()
  } catch (error) {
    logger.error('Error exchanging OAuth code', undefined, { errorMsg: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)   })
    throw error
  }
}

/**
 * Fetch user info from OAuth provider
 */
export async function fetchOAuthUserInfo(
  userInfoUrl: string,
  accessToken: string
): Promise<Record<string, any>> {
  try {
    const response = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch user info: ${error}`)
    }

    return await response.json()
  } catch (error) {
    logger.error('Error fetching OAuth user info', undefined, { errorMsg: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)   })
    throw error
  }
}

/**
 * Decode JWT ID token (simplified - in production use proper JWT library)
 */
export function decodeJWT(token: string): Record<string, any> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format')
    }

    const payload = Buffer.from(parts[1], 'base64').toString('utf-8')
    return JSON.parse(payload)
  } catch (error) {
    logger.error('Error decoding JWT', undefined, { errorMsg: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)   })
    throw new Error('Invalid JWT token')
  }
}

/**
 * Process OAuth callback and authenticate user
 */
export async function processOAuthCallback(
  code: string,
  state: string,
  organizationId: string,
  redirectUri: string,
  options?: {
    ip_address?: string
    user_agent?: string
  }
): Promise<{
  success: boolean
  userId?: string
  email?: string
  error?: string
  errorCode?: string
}> {
  const startTime = Date.now()

  try {
    // Get SSO provider configuration
    const provider = await getSSOProvider(organizationId)
    if (!provider) {
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: '',
        email: '',
        status: 'error',
        error_code: 'provider_not_found',
        error_message: 'SSO provider not configured',
        duration_ms: Date.now() - startTime,
        oauth_state: state,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        error: 'SSO provider not configured',
        errorCode: 'provider_not_found',
      }
    }

    if (provider.provider_type !== 'oauth' && provider.provider_type !== 'oidc') {
      return {
        success: false,
        error: 'Provider is not configured for OAuth/OIDC',
        errorCode: 'invalid_provider_type',
      }
    }

    // Validate required OAuth configuration
    if (
      !provider.oauth_client_id ||
      !provider.oauth_client_secret ||
      !provider.oauth_token_url ||
      !provider.oauth_userinfo_url
    ) {
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        email: '',
        status: 'error',
        error_code: 'invalid_configuration',
        error_message: 'Incomplete OAuth configuration',
        duration_ms: Date.now() - startTime,
        oauth_state: state,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        error: 'Invalid OAuth configuration',
        errorCode: 'invalid_configuration',
      }
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeOAuthCode(
      provider.oauth_token_url,
      provider.oauth_client_id,
      provider.oauth_client_secret,
      code,
      redirectUri
    )

    // Get user info
    let userInfo: Record<string, any>

    // For OIDC, try to use ID token first
    if (provider.provider_type === 'oidc' && tokens.id_token) {
      userInfo = decodeJWT(tokens.id_token)
    } else {
      // Fall back to userinfo endpoint
      userInfo = await fetchOAuthUserInfo(
        provider.oauth_userinfo_url,
        tokens.access_token
      )
    }

    // Map attributes using provider's attribute mapping
    const mapping = provider.attribute_mapping
    const email = userInfo[mapping.email] || userInfo.email
    const firstName = userInfo[mapping.first_name] || userInfo.given_name || ''
    const lastName = userInfo[mapping.last_name] || userInfo.family_name || ''
    const idpUserId = userInfo[mapping.user_id] || userInfo.sub || email

    if (!email) {
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        email: '',
        status: 'failed',
        error_code: 'missing_email',
        error_message: 'Email not provided by OAuth provider',
        duration_ms: Date.now() - startTime,
        oauth_state: state,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        error: 'Email not provided by OAuth provider',
        errorCode: 'missing_email',
      }
    }

    // Validate email domain matches configured domains
    const emailDomain = email.split('@')[1]
    if (!provider.domains.includes(emailDomain)) {
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        email,
        status: 'failed',
        error_code: 'domain_mismatch',
        error_message: `Email domain ${emailDomain} not allowed`,
        duration_ms: Date.now() - startTime,
        oauth_state: state,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        email,
        error: 'Email domain not allowed for SSO',
        errorCode: 'domain_mismatch',
      }
    }

    // Auto-provision user if enabled
    if (provider.auto_provision_users) {
      const provisionResult = await autoProvisionSSOUser(
        organizationId,
        provider.id,
        {
          email,
          first_name: firstName,
          last_name: lastName,
          idp_user_id: idpUserId,
          idp_attributes: userInfo,
        }
      )

      if (!provisionResult.success) {
        await logSSOAuthAttempt({
          organization_id: organizationId,
          provider_id: provider.id,
          email,
          status: 'error',
          error_code: 'provisioning_failed',
          error_message: provisionResult.error || 'Failed to provision user',
          duration_ms: Date.now() - startTime,
          oauth_state: state,
          ip_address: options?.ip_address,
          user_agent: options?.user_agent,
        })
        return {
          success: false,
          email,
          error: 'Failed to provision user',
          errorCode: 'provisioning_failed',
        }
      }

      // Log successful authentication
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        user_id: provisionResult.userId,
        email,
        status: 'success',
        duration_ms: Date.now() - startTime,
        oauth_state: state,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })

      return {
        success: true,
        userId: provisionResult.userId,
        email,
      }
    } else {
      // Auto-provisioning disabled, user must exist
      await logSSOAuthAttempt({
        organization_id: organizationId,
        provider_id: provider.id,
        email,
        status: 'failed',
        error_code: 'user_not_found',
        error_message: 'User does not exist and auto-provisioning is disabled',
        duration_ms: Date.now() - startTime,
        oauth_state: state,
        ip_address: options?.ip_address,
        user_agent: options?.user_agent,
      })
      return {
        success: false,
        email,
        error: 'User not found',
        errorCode: 'user_not_found',
      }
    }
  } catch (error) {
    logger.error('Error processing OAuth callback', undefined, { errorMsg: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)   })
    await logSSOAuthAttempt({
      organization_id: organizationId,
      provider_id: '',
      email: '',
      status: 'error',
      error_code: 'processing_error',
      error_message: error instanceof Error ? error.message : String(error),
      duration_ms: Date.now() - startTime,
      oauth_state: state,
      ip_address: options?.ip_address,
      user_agent: options?.user_agent,
    })
    return {
      success: false,
      error: 'Failed to process OAuth callback',
      errorCode: 'processing_error',
    }
  }
}

/**
 * Refresh OAuth access token
 */
export async function refreshOAuthToken(
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
}> {
  try {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh failed: ${error}`)
    }

    return await response.json()
  } catch (error) {
    logger.error('Error refreshing OAuth token', undefined, { errorMsg: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error)   })
    throw error
  }
}
