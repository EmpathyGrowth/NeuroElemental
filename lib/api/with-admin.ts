/**
 * Admin Authentication Check
 *
 * Used internally by createAdminRoute in route-factory.ts
 * For route handlers, prefer using createAdminRoute instead.
 */

import { checkPermission, getCurrentUser } from '@/lib/auth/supabase';
import { forbiddenError, unauthorizedError } from './error-handler';

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

  const isAdmin = await checkPermission(user.id, ['admin']);

  if (!isAdmin) {
    return { error: forbiddenError('Admin access required') };
  }

  return { userId: user.id, user };
}
