/**
 * Individual API Key Management
 * Revoke or delete specific API keys
 */

import { createAuthenticatedRoute, internalError, requireOrganizationAccess, successResponse } from '@/lib/api'
import { logActivity, ActivityActions, EntityTypes } from '@/lib/db'
import { revokeApiKey, deleteApiKey } from '@/lib/api-keys'

/**
 * PATCH /api/organizations/[id]/api-keys/[keyId]
 * Revoke an API key (soft delete)
 */
export const PATCH = createAuthenticatedRoute<{ id: string; keyId: string }>(async (_request, context, user) => {
  const { id, keyId } = await context.params

  // Check if user is an admin
  await requireOrganizationAccess(user.id, id, true)

  const result = await revokeApiKey(keyId, id)

  if (!result.success) {
    throw internalError('Failed to revoke API key')
  }

  // Log activity
  await logActivity({
    organization_id: id,
    user_id: user.id,
    action_type: ActivityActions.API_KEY_REVOKED,
    entity_type: EntityTypes.API_KEY,
    entity_id: keyId,
    description: 'Revoked API key',
    metadata: {
      key_id: keyId,
    },
  })

  return successResponse({ success: true })
})

/**
 * DELETE /api/organizations/[id]/api-keys/[keyId]
 * Permanently delete an API key
 */
export const DELETE = createAuthenticatedRoute<{ id: string; keyId: string }>(async (_request, context, user) => {
  const { id, keyId } = await context.params

  // Check if user is an admin
  await requireOrganizationAccess(user.id, id, true)

  const result = await deleteApiKey(keyId, id)

  if (!result.success) {
    throw internalError('Failed to delete API key')
  }

  // Log activity
  await logActivity({
    organization_id: id,
    user_id: user.id,
    action_type: ActivityActions.API_KEY_DELETED,
    entity_type: EntityTypes.API_KEY,
    entity_id: keyId,
    description: 'Permanently deleted API key',
    metadata: {
      key_id: keyId,
    },
  })

  return successResponse({ success: true })
})
