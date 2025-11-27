/**
 * Role Members API Routes
 * Get members assigned to a specific role
 */

import { createAuthenticatedRoute, forbiddenError, internalError, notFoundError, successResponse } from '@/lib/api'
import { getSupabaseServer, isUserOrgAdmin } from '@/lib/db'
import { logger } from '@/lib/logging'
import { getOrganizationRole } from '@/lib/permissions/manage'

/** Profile info */
interface ProfileInfo {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

/** Member with profile */
interface MemberWithProfile {
  user_id: string;
  role: string;
  role_id: string | null;
  joined_at: string;
  profiles: ProfileInfo | null;
}

/**
 * GET /api/organizations/[id]/roles/[roleId]/members
 * Get all members with this role
 * Requires: Organization admin
 */
export const GET = createAuthenticatedRoute<{ id: string; roleId: string }>(async (_request, context, user) => {
  const { id, roleId } = await context.params

  // Check if user is organization admin
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Only admins can view role members')

  // Get role to verify it belongs to this organization
  const role = await getOrganizationRole(roleId)
  if (!role) throw notFoundError('Role')
  if (role.organization_id !== id) throw forbiddenError()

  // Get members with this role
  const supabase = getSupabaseServer()
  const { data: members, error } = await supabase
    .from('organization_members')
    .select('user_id, role, role_id, joined_at, profiles:user_id (id, full_name, email, avatar_url)')
    .eq('organization_id', id)
    .eq('role_id', roleId) as { data: MemberWithProfile[] | null; error: { message: string } | null }

  if (error) {
    logger.error('Error fetching role members', undefined, { errorMsg: error.message })
    throw internalError('Failed to fetch members')
  }

  // Format response
  const formattedMembers = (members || []).map((member) => ({
    user_id: member.user_id,
    role: member.role,
    role_id: member.role_id,
    joined_at: member.joined_at,
    user: member.profiles,
  }))

  return successResponse({ members: formattedMembers })
})
