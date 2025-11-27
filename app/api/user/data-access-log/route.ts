/**
 * GDPR Data Access Log API
 * Get user's data access logs for transparency
 */

import { createAuthenticatedRoute, getPaginationParams, paginatedResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getDataAccessLogs } from '@/lib/gdpr';

/** User profile for access log */
interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

/**
 * GET /api/user/data-access-log
 * Get user's data access logs
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  // Get pagination params
  const { limit, offset, page } = getPaginationParams(request)

  // Get user's data access logs
  const { logs, total } = await getDataAccessLogs(user.id, {
    limit,
    offset,
  })

  // Enrich logs with user information
  const supabase = getSupabaseServer()
  const enrichedLogs = await Promise.all(
    logs.map(async (log) => {
      // Get accessed_by user info
      const { data: accessedByUser } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', log.accessed_by_user_id)
        .single() as { data: UserProfile | null }

      return {
        ...log,
        accessed_by_user: accessedByUser || {
          id: log.accessed_by_user_id,
          full_name: 'Unknown',
          email: null,
        },
      }
    })
  )

  return paginatedResponse(enrichedLogs, total, page, limit)
});

