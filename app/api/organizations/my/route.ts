import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

/**
 * GET /api/organizations/my
 * Get all organizations the current user belongs to
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  const supabase = getSupabaseServer();

  const { data: memberships, error } = await (supabase as any)
    .from('organization_members')
    .select(`
      id,
      role,
      organizations:organization_id (
        id,
        name
      )
    `)
    .eq('user_id', user.id) as { data: Array<{ id: string; role: string; organizations: { id: string; name: string } | null }> | null; error: unknown };

  if (error) {
    return successResponse({ organizations: [] });
  }

  // Transform to organization list with user's role
  const organizations = (memberships || [])
    .filter(m => m.organizations)
    .map(m => ({
      id: m.organizations!.id,
      name: m.organizations!.name,
      userRole: m.role,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return successResponse({
    organizations,
    count: organizations.length,
  });
});
