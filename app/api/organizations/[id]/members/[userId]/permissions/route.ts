/**
 * User Permissions API Routes
 * Get and manage user permissions within an organization
 */

import {
  createAuthenticatedRoute,
  successResponse,
  forbiddenError,
  badRequestError,
  requireOrganizationOwner,
} from '@/lib/api'
import { isUserOrgAdmin } from '@/lib/db/organizations'
import { getUserPermissions, assignRoleToUser } from '@/lib/permissions/manage'

/**
 * GET /api/organizations/[id]/members/[userId]/permissions
 * Get user's permissions in organization
 * Requires: Organization admin OR self
 */
export const GET = createAuthenticatedRoute<{ id: string; userId: string }>(
  async (_request, context, user) => {
    const { id, userId } = await context.params

    // Check if user is admin or requesting their own permissions
    const isAdmin = await isUserOrgAdmin(user.id, id)
    const isSelf = user.id === userId

    if (!isAdmin && !isSelf) {
      throw forbiddenError('You can only view your own permissions or be an admin')
    }

    // Get user permissions
    const permissions = await getUserPermissions(userId, id)

    return successResponse({ permissions })
  }
)

/**
 * PATCH /api/organizations/[id]/members/[userId]/permissions
 * Update user's role (and thus permissions)
 * Requires: Organization owner
 */
export const PATCH = createAuthenticatedRoute<{ id: string; userId: string }>(
  async (request, context, user) => {
    const { id, userId } = await context.params

    // Require owner access
    await requireOrganizationOwner(user.id, id)

    const body = await request.json()
    const { role_id } = body

    if (!role_id) {
      throw badRequestError('role_id is required')
    }

    // Assign role to user
    const result = await assignRoleToUser(userId, id, role_id)

    if (!result.success) {
      throw badRequestError(result.error || 'Failed to update role')
    }

    // Get updated permissions
    const permissions = await getUserPermissions(userId, id)

    return successResponse({ success: true, permissions })
  }
)
