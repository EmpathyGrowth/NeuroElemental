/**
 * Resource Download Tracking API
 * Tracks downloads and returns download URL
 */

import { createAuthenticatedRoute, successResponse, notFoundError, forbiddenError } from '@/lib/api';
import { instructorResourceRepository } from '@/lib/db';
import { NextRequest } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

// POST - Track download and get URL
export const POST = createAuthenticatedRoute(async (request: NextRequest, context: RouteContext, user) => {
  const { id } = await context.params;

  // Check if user is an instructor
  const profile = await getProfile(user.id);
  if (!profile || (profile.role !== 'instructor' && profile.role !== 'admin' && profile.instructor_status !== 'approved')) {
    throw forbiddenError('Only instructors can download resources');
  }

  // Get resource
  const resource = await instructorResourceRepository.getResourceById(id);
  if (!resource) {
    throw notFoundError('Resource');
  }

  // Track download
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  await instructorResourceRepository.trackDownload(id, user.id, ip, userAgent);

  // Return file URL or external URL
  const downloadUrl = resource.file_url || resource.external_url;

  return successResponse({
    downloadUrl,
    resource: {
      id: resource.id,
      title: resource.title,
      type: resource.type,
    },
  });
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
