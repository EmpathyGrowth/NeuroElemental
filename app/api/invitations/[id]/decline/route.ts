/**
 * Decline Invitation API
 * Decline an organization invitation
 */

import { createAuthenticatedRoute, forbiddenError, internalError, notFoundError, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'

/** Organization invite from database */
interface OrganizationInvite {
  id: string;
  email: string;
  organization_id: string;
  role: string;
  expires_at: string;
  created_at: string;
}

/**
 * POST /api/invitations/[id]/decline
 * Decline an invitation to join an organization
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params
    const supabase = getSupabaseServer()

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('id', id)
      .single() as { data: OrganizationInvite | null; error: { message: string } | null }

    if (inviteError || !invitation) {
      throw notFoundError('Invitation not found')
    }

    // Check if user's email matches the invitation
    if (user.email !== invitation.email) {
      throw forbiddenError('This invitation is for a different email address')
    }

    // Delete the invitation
    const { error: deleteError } = await supabase
      .from('organization_invitations')
      .delete()
      .eq('id', id)

    if (deleteError) {
      logger.error('Error declining invitation', deleteError, {
        endpoint: 'POST /api/invitations/[id]/decline',
        invitationId: id,
        userId: user.id
      })
      throw internalError('Failed to decline invitation')
    }

    return successResponse({
      message: 'Invitation declined successfully',
    })
  }
)
