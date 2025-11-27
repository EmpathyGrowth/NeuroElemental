/**
 * Role Assignment History API Routes
 * View audit trail of role changes
 */

import { createAuthenticatedRoute, forbiddenError, successResponse } from '@/lib/api'
import { isUserOrgAdmin } from '@/lib/db'
import { getRoleAssignmentHistory } from '@/lib/permissions/manage'

/**
 * GET /api/organizations/[id]/roles/history
 * Get role assignment history for organization
 * Requires: Organization admin
 * Query params:
 *   - userId (optional): Filter by user
 *   - limit (optional): Number of records (default: 50)
 *   - offset (optional): Pagination offset (default: 0)
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is organization admin
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Only admins can view role assignment history')

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId') || undefined
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  // Get history
  const result = await getRoleAssignmentHistory(id, {
    userId,
    limit,
    offset,
  })

  return successResponse({
    history: result.history,
    total: result.total,
    limit,
    offset,
  })
})
