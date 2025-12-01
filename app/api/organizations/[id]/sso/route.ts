/**
 * SSO Provider Configuration API
 * Manage SSO providers for an organization
 */

import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
  badRequestError,
  requireOrganizationAccess,
  requireOrganizationOwner,
  validateRequest,
} from '@/lib/api'
import { ssoProviderSchema, ssoProviderUpdateSchema } from '@/lib/validation/schemas'
import {
  getSSOProvider,
  createSSOProvider,
  updateSSOProvider,
  deleteSSOProvider,
} from '@/lib/sso/manage'
import { logActivity, ActivityActions, EntityTypes } from '@/lib/db/activity-log'

/**
 * Sanitize SSO provider for API response (hide sensitive data)
 */
function sanitizeProvider(provider: any) {
  return {
    ...provider,
    oauth_client_secret: provider.oauth_client_secret ? '***' : undefined,
    saml_certificate: provider.saml_certificate ? '***' : undefined,
  }
}

/**
 * GET /api/organizations/[id]/sso
 * Get SSO provider configuration (requires org admin)
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params

    // Require admin access
    await requireOrganizationAccess(user.id, id, true)

    const provider = await getSSOProvider(id)

    if (!provider) {
      return successResponse({ provider: null })
    }

    return successResponse({ provider: sanitizeProvider(provider) })
  }
)

/**
 * POST /api/organizations/[id]/sso
 * Create SSO provider (requires org owner)
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id } = await context.params

    // Require owner access
    await requireOrganizationOwner(user.id, id)

    // Validate request body
    const validation = await validateRequest(request, ssoProviderSchema)
    if (!validation.success) {
      throw validation.error
    }

    const data = validation.data

    // Create the provider
    const result = await createSSOProvider(id, {
      provider_type: data.provider_type,
      provider_name: data.provider_name,
      domains: data.domains,
      enforce_sso: data.enforce_sso,
      auto_provision_users: data.auto_provision_users,
      default_role: data.default_role,
      saml_entity_id: data.saml_entity_id,
      saml_sso_url: data.saml_sso_url,
      saml_certificate: data.saml_certificate,
      saml_sign_requests: data.saml_sign_requests,
      oauth_client_id: data.oauth_client_id,
      oauth_client_secret: data.oauth_client_secret,
      oauth_authorize_url: data.oauth_authorize_url,
      oauth_token_url: data.oauth_token_url,
      oauth_userinfo_url: data.oauth_userinfo_url,
      oauth_scopes: data.oauth_scopes || (data.provider_type === 'oidc' ? ['openid', 'profile', 'email'] : []),
      attribute_mapping: data.attribute_mapping,
      metadata: data.metadata,
    })

    if (!result.success || !result.provider) {
      throw badRequestError(result.error || 'Failed to create SSO provider')
    }

    // Log activity
    await logActivity({
      organization_id: id,
      user_id: user.id,
      action_type: ActivityActions.SETTINGS_UPDATED,
      entity_type: EntityTypes.SETTINGS,
      entity_id: result.provider.id,
      description: `Created SSO provider "${data.provider_name}" (${data.provider_type})`,
      metadata: {
        provider_id: result.provider.id,
        provider_type: data.provider_type,
        domains: data.domains,
      },
    })

    return successResponse({
      success: true,
      provider: sanitizeProvider(result.provider),
    })
  }
)

/**
 * PATCH /api/organizations/[id]/sso
 * Update SSO provider (requires org owner)
 */
export const PATCH = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id } = await context.params

    // Require owner access
    await requireOrganizationOwner(user.id, id)

    // Get existing provider
    const existingProvider = await getSSOProvider(id)
    if (!existingProvider) {
      throw notFoundError('SSO provider')
    }

    // Validate request body
    const validation = await validateRequest(request, ssoProviderUpdateSchema)
    if (!validation.success) {
      throw validation.error
    }

    // Update the provider
    const result = await updateSSOProvider(existingProvider.id, validation.data)

    if (!result.success || !result.provider) {
      throw badRequestError(result.error || 'Failed to update SSO provider')
    }

    // Log activity
    await logActivity({
      organization_id: id,
      user_id: user.id,
      action_type: ActivityActions.SETTINGS_UPDATED,
      entity_type: EntityTypes.SETTINGS,
      entity_id: result.provider.id,
      description: `Updated SSO provider configuration`,
      metadata: {
        provider_id: result.provider.id,
        updates: Object.keys(validation.data),
      },
    })

    return successResponse({
      success: true,
      provider: sanitizeProvider(result.provider),
    })
  }
)

/**
 * DELETE /api/organizations/[id]/sso
 * Delete SSO provider (requires org owner)
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params

    // Require owner access
    await requireOrganizationOwner(user.id, id)

    // Get existing provider
    const existingProvider = await getSSOProvider(id)
    if (!existingProvider) {
      throw notFoundError('SSO provider')
    }

    // Delete (soft delete - deactivate)
    const result = await deleteSSOProvider(existingProvider.id)

    if (!result.success) {
      throw badRequestError(result.error || 'Failed to delete SSO provider')
    }

    // Log activity
    await logActivity({
      organization_id: id,
      user_id: user.id,
      action_type: ActivityActions.SETTINGS_UPDATED,
      entity_type: EntityTypes.SETTINGS,
      entity_id: existingProvider.id,
      description: `Deleted SSO provider "${existingProvider.provider_name}"`,
      metadata: {
        provider_id: existingProvider.id,
        provider_type: existingProvider.provider_type,
      },
    })

    return successResponse({ success: true })
  }
)
