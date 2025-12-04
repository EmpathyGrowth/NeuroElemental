/**
 * Admin Authentication Check
 *
 * Used internally by createAdminRoute in route-factory.ts
 * For route handlers, prefer using createAdminRoute instead.
 */

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { createClient } from '@/lib/supabase/server';
import { forbiddenError, unauthorizedError } from './error-handler';

/**
 * Server-side permission check using server client
 */
async function checkPermissionServer(userId: string, allowedRoles: string[]): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle() as { data: { role: string } | null; error: unknown };

  if (error || !data?.role) {
    return false;
  }

  return allowedRoles.includes(data.role);
}

/**
 * Check if current user has admin permissions
 *
 * Verifies user authentication and admin role.
 * Returns error object if authentication or authorization fails.
 *
 * @returns Object with either error or userId and user
 *
 * @example
 * ```typescript
 * const auth = await requireAdmin()
 * if (auth.error) {
 *   return errorResponse(auth.error)
 * }
 * // User is authenticated and is an admin
 * const { userId, user } = auth
 * ```
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return { error: unauthorizedError('Please login') };
  }

  const isAdmin = await checkPermissionServer(user.id, ['admin']);

  if (!isAdmin) {
    return { error: forbiddenError('Admin access required') };
  }

  return { userId: user.id, user };
}
