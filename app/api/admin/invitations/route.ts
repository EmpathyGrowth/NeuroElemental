/**
 * Admin Invitations API
 * View all organization invitations
 */

import { createAdminRoute, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET, internalError, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'

/**
 * GET /api/admin/invitations
 * List all organization invitations (admin only)
 */
export const GET = createAdminRoute(async (request, _context, _admin) => {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get('active') === 'true'
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_PAGE_OFFSET))

  // Build query
  let query = supabase
    .from('organization_invitations')
    .select(`
      *,
      organization:organizations (
        name,
        slug
      ),
      inviter:profiles!organization_invitations_invited_by_fkey (
        email
      )
    `
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Filter for active only if requested
  if (activeOnly) {
    query = query.gte('expires_at', new Date().toISOString())
  }

  const { data: invitations, error } = await query

  if (error) {
    throw internalError('Failed to fetch invitations: ' + error.message)
  }

  return successResponse({
    invitations: invitations || [],
    count: invitations?.length || 0,
  })
})


