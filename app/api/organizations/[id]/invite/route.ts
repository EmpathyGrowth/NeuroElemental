/**
 * Organization Single Invitation API
 * Invite a single member to an organization
 */

import { createAuthenticatedRoute, badRequestError, notFoundError, requireOrganizationAccess, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { sendOrganizationInvitation } from '@/lib/email';
import { logger, log } from '@/lib/logging';
import { z } from 'zod';

const organizationSingleInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'member']).default('member'),
});

/**
 * POST /api/organizations/[id]/invite
 * Send an invitation to a single email address
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;

  // Check if user is an admin
  await requireOrganizationAccess(user.id, id, true);

  // Validate request body
  const validation = await validateRequest(request, organizationSingleInviteSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { email, role = 'member' } = validation.data;
  const trimmedEmail = email.trim().toLowerCase();
  const supabase = getSupabaseServer();

  // Get organization details
  const { data: organization } = await (supabase as any)
    .from('organizations')
    .select('name')
    .eq('id', id)
    .single() as { data: { name: string } | null };

  if (!organization) {
    throw notFoundError('Organization');
  }

  // Get user's full name
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single() as { data: { full_name: string } | null };

  const inviterName: string = profile?.full_name || user.email || 'A team member';

  // Check if user is already a member
  const { data: userProfile } = await (supabase as any)
    .from('profiles')
    .select('id')
    .eq('email', trimmedEmail)
    .maybeSingle() as { data: { id: string } | null };

  if (userProfile) {
    const { data: existingMember } = await (supabase as any)
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', id)
      .eq('user_id', userProfile.id)
      .maybeSingle() as { data: { user_id: string } | null };

    if (existingMember) {
      throw badRequestError('This person is already a member of the organization');
    }
  }

  // Check for existing pending invitation
  const { data: existingInvite } = await (supabase as any)
    .from('organization_invitations')
    .select('id, expires_at')
    .eq('organization_id', id)
    .eq('email', trimmedEmail)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle() as { data: { id: string; expires_at: string } | null };

  if (existingInvite) {
    throw badRequestError('An invitation has already been sent to this email');
  }

  // Create invitation (expires in 7 days)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data: invitation, error: inviteError } = await (supabase as any)
    .from('organization_invitations')
    .insert({
      organization_id: id,
      email: trimmedEmail,
      role,
      invited_by: user.id,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single() as { data: { id: string } | null; error: { message: string } | null };

  if (inviteError || !invitation) {
    logger.error('Error creating invitation:', inviteError ? new Error(inviteError.message) : new Error('Unknown error'));
    throw badRequestError('Failed to create invitation');
  }

  // Send email
  try {
    await sendOrganizationInvitation({
      to: trimmedEmail,
      organizationName: organization.name,
      inviterName,
      role,
      inviteId: invitation.id,
    });
  } catch (emailError) {
    log.error('Error sending invitation email', emailError, { email: trimmedEmail, organizationId: id });
    // Delete the invitation if email fails
    await supabase
      .from('organization_invitations')
      .delete()
      .eq('id', invitation.id);

    throw badRequestError('Failed to send invitation email');
  }

  return successResponse({
    success: true,
    invitation: {
      id: invitation.id,
      email: trimmedEmail,
      role,
      expiresAt: expiresAt.toISOString(),
    },
    message: 'Invitation sent successfully',
  }, 201);
});
