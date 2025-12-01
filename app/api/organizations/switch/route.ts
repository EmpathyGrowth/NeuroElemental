import { createAuthenticatedRoute, successResponse, badRequestError } from '@/lib/api';
import { z } from 'zod';

const switchOrgSchema = z.object({
  organizationId: z.string().uuid(),
});

/**
 * POST /api/organizations/switch
 * Switch current organization context
 *
 * Note: In a full implementation, this would use iron-session to persist
 * organization context server-side. For now, client handles routing.
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const body = await req.json();
  const validation = switchOrgSchema.safeParse(body);

  if (!validation.success) {
    throw badRequestError('Invalid organization ID');
  }

  const { organizationId } = validation.data;

  // Verify user is member of organization
  const supabase = (await import('@/lib/db')).getSupabaseServer();

  const { data: membership } = await supabase
    .from('organization_members')
    .select('id, role')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .single();

  if (!membership) {
    throw badRequestError('You are not a member of this organization');
  }

  // In future: Save to session cookie
  // const session = await getSession();
  // session.currentOrganizationId = organizationId;
  // await session.save();

  return successResponse({
    success: true,
    organizationId,
    role: membership.role,
  });
});
