/**
 * Admin Organizations API
 * Admin-only endpoint for viewing all organizations
 */

import { createAdminRoute, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET, internalError, paginatedResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'

/**
 * GET /api/admin/organizations
 * List all organizations with stats (admin only)
 */
export const GET = createAdminRoute(async (request, _context, _admin) => {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_PAGE_OFFSET))
  const page = Math.floor(offset / limit) + 1

  // Get all organizations with member counts
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select(`
      *,
      member_count:organization_members(count)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw internalError('Failed to fetch organizations: ' + error.message)
  }

  // Get total count
  const { count } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })

  return paginatedResponse(organizations || [], count || 0, page, limit)
})

