import { badRequestError, createAuthenticatedRoute, internalError, requireOrganizationAccess, successResponse } from '@/lib/api';
import { createOrganizationInvite, getOrganizationInvites, cancelInvitation } from '@/lib/db';
import type { OrganizationRole } from '@/lib/types/supabase';

/** Request body for creating invitation */
interface CreateInvitationBody {
  email: string;
  role: OrganizationRole;
  organizationId: string;
}

/**
 * GET /api/invitations
 * Get pending invitations for an organization
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');

  if (!organizationId) {
    throw badRequestError('Organization ID is required');
  }

  // Verify admin access
  await requireOrganizationAccess(user.id, organizationId, true);

  const { data: invitations, error } = await getOrganizationInvites(organizationId);

  if (error) {
    throw internalError('Failed to fetch invitations');
  }

  return successResponse({ invitations });
});

/**
 * POST /api/invitations
 * Create a new invitation
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const body: CreateInvitationBody = await request.json();
  const { email, role, organizationId } = body;

  // Verify admin access
  await requireOrganizationAccess(user.id, organizationId, true);

  const { data: invitation, error } = await createOrganizationInvite({
    email,
    role,
    organization_id: organizationId,
    invited_by: user.id,
    expires_in_days: 7,
  });

  if (error) {
    throw internalError('Failed to create invitation');
  }

  return successResponse({ invitation }, 201);
});

/**
 * DELETE /api/invitations
 * Revoke an invitation
 */
export const DELETE = createAuthenticatedRoute(async (request, _context, _user) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    throw badRequestError('Invitation ID is required');
  }

  const { error } = await cancelInvitation(id);

  if (error) {
    throw internalError('Failed to revoke invitation');
  }

  return successResponse({ message: 'Invitation revoked' });
});
