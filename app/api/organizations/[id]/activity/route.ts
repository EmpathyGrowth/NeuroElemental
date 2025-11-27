/**
 * Organization Activity Log API
 * Get activity log for an organization
 */

import { createAuthenticatedRoute, forbiddenError, internalError, successResponse } from '@/lib/api'
import { isUserOrgMember, getActivityLog } from '@/lib/db'

/**
 * GET /api/organizations/[id]/activity
 * Get activity log for organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params
  const { searchParams } = new URL(request.url)

  // Check if user is a member
  const isMember = await isUserOrgMember(user.id, id)
  if (!isMember) {
    throw forbiddenError('You do not have access to this organization')
  }

  // Parse query parameters
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const actionType = searchParams.get('action_type') || undefined

  // Get activity log
  const { success, activities, error } = await getActivityLog(id, {
    limit,
    offset,
    actionType: actionType !== 'all' ? actionType : undefined,
  })

  if (!success || error) {
    throw internalError('Failed to fetch activity log')
  }

  return successResponse({
    activities,
    pagination: {
      limit,
      offset,
      total: activities.length,
    },
  })
})
