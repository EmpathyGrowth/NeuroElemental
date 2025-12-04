/**
 * Instructor Resources API
 * Provides CRUD operations for instructor teaching materials
 */

import { createAuthenticatedRoute, successResponse, forbiddenError } from '@/lib/api';
import { instructorResourceRepository, type InstructorResourceCategory, type InstructorResourceType } from '@/lib/db';

// GET - List instructor resources
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  // Check if user is an instructor or admin
  const profile = await getProfile(user.id);
  if (!profile || (profile.role !== 'instructor' && profile.role !== 'admin' && profile.instructor_status !== 'approved')) {
    throw forbiddenError('Only instructors can access resources');
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as InstructorResourceCategory | null;
  const type = searchParams.get('type') as InstructorResourceType | null;
  const search = searchParams.get('search') || undefined;
  const featured = searchParams.get('featured');

  const resources = await instructorResourceRepository.getResources({
    category: category || undefined,
    type: type || undefined,
    search,
    isActive: true,
    isFeatured: featured === 'true' ? true : undefined,
  });

  return successResponse({ resources });
});

// Helper to get profile
async function getProfile(userId: string) {
  const { getSupabaseServer } = await import('@/lib/db');
  const supabase = getSupabaseServer();

  const { data } = await (supabase as any)
    .from('profiles')
    .select('role, instructor_status')
    .eq('id', userId)
    .single() as { data: { role: string; instructor_status: string } | null };

  return data;
}
