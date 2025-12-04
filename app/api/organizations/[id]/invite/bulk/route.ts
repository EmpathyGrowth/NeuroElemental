/**
 * Bulk Organization Invitations API
 * Invite multiple members to an organization at once
 */

import { createAuthenticatedRoute, notFoundError, requireOrganizationAccess, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { sendOrganizationInvitation } from '@/lib/email';
import { logger, log } from '@/lib/logging';
import { organizationBulkInviteSchema } from '@/lib/validation/schemas';

interface InviteResult {
  email: string
  status: 'success' | 'error' | 'duplicate'
  message: string
}

/** Organization name result */
interface OrganizationNameResult {
  name: string
}

/** Profile full name result */
interface ProfileNameResult {
  full_name: string | null
}

/** Profile ID result */
interface ProfileIdResult {
  id: string
}

/** Existing invitation result */
interface InvitationResult {
  id: string
  expires_at: string
}

/** Invitation insert data */
interface InvitationInsert {
  organization_id: string
  email: string
  role: string
  invited_by: string
  expires_at: string
}

/** Created invitation record */
interface CreatedInvitation {
  id: string
  organization_id: string
  email: string
  role: string
  invited_by: string
  expires_at: string
}

/**
 * POST /api/organizations/[id]/invite/bulk
 * Send invitations to multiple email addresses
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is an admin
  await requireOrganizationAccess(user.id, id, true)

  // Validate request body
  const validation = await validateRequest(request, organizationBulkInviteSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { emails, role } = validation.data
  const supabase = getSupabaseServer()

  // Get organization details
  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', id)
    .single() as { data: OrganizationNameResult | null; error: unknown }

  if (!organization) throw notFoundError('Organization')

  // Get user's full name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single() as { data: ProfileNameResult | null; error: unknown }

  const inviterName = profile?.full_name || user.email || 'A team member'

  // Process each email
  const results: InviteResult[] = []

  for (const email of emails) {
    const trimmedEmail = email.trim().toLowerCase()

    try {
      // Check if user is already a member
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', trimmedEmail)
        .single() as { data: ProfileIdResult | null; error: unknown };

      const userId = userProfile?.id || '';

      const { data: existingMember } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        results.push({
          email: trimmedEmail,
          status: 'duplicate',
          message: 'Already a member',
        })
        continue
      }

      // Check for existing pending invitation
      const { data: existingInvite } = await supabase
        .from('organization_invitations')
        .select('id, expires_at')
        .eq('organization_id', id)
        .eq('email', trimmedEmail)
        .gte('expires_at', new Date().toISOString())
        .single() as { data: InvitationResult | null; error: unknown }

      if (existingInvite) {
        results.push({
          email: trimmedEmail,
          status: 'duplicate',
          message: 'Invitation already sent',
        })
        continue
      }

      // Create invitation
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const invitationInsert: InvitationInsert = {
        organization_id: id,
        email: trimmedEmail,
        role,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      }
      const { data: invitation, error: inviteError } = await (supabase as any)
        .from('organization_invitations')
        .insert(invitationInsert)
        .select()
        .single() as { data: CreatedInvitation | null; error: { message: string } | null }

      if (inviteError || !invitation) {
        logger.error('Error creating invitation:', inviteError ? new Error(inviteError.message) : new Error('Unknown error'))
        results.push({
          email: trimmedEmail,
          status: 'error',
          message: 'Failed to create invitation',
        })
        continue
      }

      // Send email
      try {
        await sendOrganizationInvitation({
          to: trimmedEmail,
          organizationName: organization.name,
          inviterName,
          role,
          inviteId: invitation.id,
        })

        results.push({
          email: trimmedEmail,
          status: 'success',
          message: 'Invitation sent successfully',
        })
      } catch (emailError) {
        log.error('Error sending invitation email', emailError, { email: trimmedEmail, organizationId: id })
        // Delete the invitation if email fails
        await supabase
          .from('organization_invitations')
          .delete()
          .eq('id', invitation.id)

        results.push({
          email: trimmedEmail,
          status: 'error',
          message: 'Failed to send invitation email',
        })
      }
    } catch (error) {
      log.error('Error processing invitation', error, { email: trimmedEmail, organizationId: id })
      results.push({
        email: trimmedEmail,
        status: 'error',
        message: 'An unexpected error occurred',
      })
    }
  }

  // Calculate summary
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length
  const duplicateCount = results.filter(r => r.status === 'duplicate').length

  return successResponse({
    success: true,
    results,
    summary: {
      total: emails.length,
      successful: successCount,
      failed: errorCount,
      duplicates: duplicateCount,
    },
  })
})
