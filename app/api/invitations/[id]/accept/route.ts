/**
 * Accept Invitation API
 * Accept an organization invitation
 */

import { badRequestError, createAuthenticatedRoute, forbiddenError, notFoundError, successResponse } from '@/lib/api'
import { acceptInvitation, getSupabaseServer } from '@/lib/db'
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
 * POST /api/invitations/[id]/accept
 * Accept an invitation to join an organization
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

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw badRequestError('Invitation has expired')
    }

    // Check if user's email matches the invitation
    if (user.email !== invitation.email) {
      throw forbiddenError('This invitation is for a different email address')
    }

    // Accept the invitation using helper function
    try {
      await acceptInvitation(id, user.id)
    } catch (acceptError) {
      logger.error('Error accepting invitation', acceptError instanceof Error ? acceptError : undefined, {
        endpoint: 'POST /api/invitations/[id]/accept',
        invitationId: id,
        userId: user.id,
        error: String(acceptError)
      })
      throw badRequestError(acceptError instanceof Error ? acceptError.message : String(acceptError))
    }

    return successResponse({
      message: 'Invitation accepted successfully',
      organizationId: invitation.organization_id,
    })
  }
)
