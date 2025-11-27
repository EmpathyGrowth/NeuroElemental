/**
 * Permissions API Routes
 * Get available permissions for role creation
 */

import { createAuthenticatedRoute, successResponse } from '@/lib/api'
import { getPermissionsByCategory } from '@/lib/permissions'

/**
 * GET /api/permissions
 * Get all available permissions grouped by category
 * Requires: Authenticated user
 */
export const GET = createAuthenticatedRoute(async (_request, _context, _user) => {
  // Get permissions grouped by category
  const permissions = await getPermissionsByCategory()

  return successResponse({ permissions })
})
