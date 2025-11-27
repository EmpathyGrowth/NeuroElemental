/**
 * SSO Test Configuration API
 * Test SSO provider configuration
 */

import {
  createAuthenticatedRoute,
  successResponse,
  badRequestError,
  notFoundError,
  requireOrganizationAccess,
} from '@/lib/api'
import { getSSOProvider, testSSOProvider } from '@/lib/sso/manage'
import { logActivity, ActivityActions, EntityTypes } from '@/lib/db/activity-log'

/**
 * POST /api/organizations/[id]/sso/test
 * Test SSO configuration (requires org admin)
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params

    // Require admin access
    await requireOrganizationAccess(user.id, id, true)

    // Get existing provider
    const provider = await getSSOProvider(id)
    if (!provider) {
      throw notFoundError('SSO provider')
    }

    // Test the provider configuration
    const result = await testSSOProvider(provider.id)

    // Log activity
    await logActivity({
      organization_id: id,
      user_id: user.id,
      action_type: ActivityActions.SETTINGS_UPDATED,
      entity_type: EntityTypes.SETTINGS,
      entity_id: provider.id,
      description: `Tested SSO provider configuration: ${result.success ? 'SUCCESS' : 'FAILED'}`,
      metadata: {
        provider_id: provider.id,
        test_result: result.success ? 'success' : 'failed',
        error: result.error,
      },
    })

    if (!result.success) {
      throw badRequestError(result.error || 'SSO configuration test failed')
    }

    return successResponse({
      success: true,
      message: result.message || 'SSO configuration is valid',
    })
  }
)
