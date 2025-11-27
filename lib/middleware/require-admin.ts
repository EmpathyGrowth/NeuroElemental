/**
 * User Role Utilities
 *
 * For admin authentication in routes, use createAdminRoute from @/lib/api
 */

import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getSupabaseServer } from '@/lib/db/supabase-server'

/**
 * Get current user's role
 *
 * @returns User role string or null if not authenticated
 *
 * @example
 * ```typescript
 * const role = await getUserRole()
 * if (role === 'instructor') {
 *   // Show instructor features
 * }
 * ```
 */
export async function getUserRole(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = getSupabaseServer()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role || null
}
