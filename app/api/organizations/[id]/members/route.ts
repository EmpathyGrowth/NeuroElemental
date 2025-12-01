/**
 * Organization Members API Routes
 * Handle member management and invitations
 */

import { badRequestError, conflictError, createAuthenticatedRoute, forbiddenError, internalError, requireOrganizationAccess, successResponse, validateRequest } from '@/lib/api'
import { createOrganizationInvite, getOrganizationMembers, getUserOrgRole, isEmailAlreadyMember, organizationRepository, removeOrganizationMember, updateMemberRole, userRepository } from '@/lib/db'
import { sendOrganizationInvitation } from '@/lib/email'
import { logger } from '@/lib/logging'
import { organizationMemberInviteSchema, organizationMemberUpdateSchema } from '@/lib/validation/schemas'

/**
 * GET /api/organizations/[id]/members
 * Get all organization members
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  // Check if user is member of organization
  const role = await getUserOrgRole(user.id, id)
  if (!role) throw forbiddenError()

  // Get all members
  const members = await getOrganizationMembers(id)

  return successResponse({ members, userRole: role })
})

/**
 * POST /api/organizations/[id]/members
 * Invite a new member
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user has permission to invite members
  await requireOrganizationAccess(user.id, id, true)

  // Validate request body
  const validation = await validateRequest(request, organizationMemberInviteSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { email, role } = validation.data

  // Check if email is already a member
  const alreadyMember = await isEmailAlreadyMember(email, id)
  if (alreadyMember) throw conflictError('User is already a member')

  // Get organization name and inviter name for the email
  const [org, profile] = await Promise.all([
    organizationRepository.findById(id),
    userRepository.findById(user.id),
  ])

  const organizationName = org?.name || 'Organization'
  const inviterName = profile?.full_name || user.email || 'A team member'

  // Create invitation
  const { data: invitation, error } = await createOrganizationInvite({
    email,
    organization_id: id,
    role: role || 'member',
    invited_by: user.id,
    expires_in_days: 7,
  })

  if (error || !invitation) {
    throw internalError('Failed to create invitation: ' + error)
  }

  // Send invitation email (non-blocking - don't fail if email fails)
  sendOrganizationInvitation({
    to: email,
    organizationName,
    inviterName,
    role: role || 'member',
    inviteId: invitation.id,
  }).catch((err) => {
    logger.error('Failed to send organization invitation email:', err as Error)
  })

  return successResponse({ invitation })
})

/**
 * PATCH /api/organizations/[id]/members
 * Update member role
 */
export const PATCH = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user has permission to update members
  await requireOrganizationAccess(user.id, id, true)
  const currentRole = await getUserOrgRole(user.id, id)

  // Validate request body
  const validation = await validateRequest(request, organizationMemberUpdateSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { user_id, role } = validation.data

  // Check target member's current role
  const targetRole = await getUserOrgRole(user_id, id)

  // Only owners can change owner roles
  if (targetRole === 'owner' && currentRole !== 'owner') {
    throw forbiddenError('Only owners can change owner roles')
  }

  // Update member role
  const { data: membership, error } = await updateMemberRole(id, user_id, role)

  if (error || !membership) {
    throw internalError('Failed to update member: ' + error)
  }

  return successResponse({ member: membership })
})

/**
 * DELETE /api/organizations/[id]/members
 * Remove a member
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  const { searchParams } = new URL(request.url)
  const user_id_to_remove = searchParams.get('user_id')

  if (!user_id_to_remove) {
    throw badRequestError('user_id query parameter required')
  }

  // Check if user has permission to remove members
  // Users can remove themselves, or admins/owners can remove others
  if (user_id_to_remove !== user.id) {
    await requireOrganizationAccess(user.id, id, true)
  }
  const currentRole = await getUserOrgRole(user.id, id)

  // Check if trying to remove an owner
  const targetRole = await getUserOrgRole(user_id_to_remove, id)

  if (targetRole === 'owner') {
    // Count total owners - we can't remove the last one
    const membersResult = await getOrganizationMembers(id)
    const members = membersResult.data || []
    const ownerCount = members.filter((m) => m.role === 'owner').length

    if (ownerCount === 1) {
      throw badRequestError('Cannot remove the last owner')
    }

    // Only owners can remove other owners
    if (currentRole !== 'owner') {
      throw forbiddenError('Only owners can remove other owners')
    }
  }

  // Remove member
  const { error } = await removeOrganizationMember(id, user_id_to_remove)

  if (error) {
    throw internalError('Failed to remove member: ' + error)
  }

  return successResponse({ success: true })
})
