import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

/**
 * GET /api/organizations/my
 * Get all organizations the current user belongs to
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  const supabase = getSupabaseServer();

  const { data: memberships, error } = await supabase
    .from('organization_members')
    .select(`
      id,
      role,
      organizations:organization_id (
        id,
        name
      )
    `)
    .eq('user_id', user.id);

  if (error) {
    return successResponse({ organizations: [] });
  }

  // Transform to organization list with user's role
  const organizations = (memberships || [])
    .filter(m => m.organizations)
    .map(m => ({
      id: (m.organizations as any).id,
      name: (m.organizations as any).name,
      userRole: m.role,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return successResponse({
    organizations,
    count: organizations.length,
  });
});
