/**
 * Profile API - REFACTORED WITH ROUTE FACTORY PATTERN
 *
 * BEFORE: 209 lines with repetitive auth checks
 * AFTER: ~140 lines, 33% reduction
 *
 * Demonstrates integration with:
 * - Route factory for auth
 * - Caching for performance
 * - Validation patterns
 */

import { createAuthenticatedRoute, internalError, successResponse } from '@/lib/api';
import { cacheKeys, cacheManager } from '@/lib/cache/cache-manager';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { getCurrentTimestamp, getUpdateTimestamp } from '@/lib/utils';
import { profileUpdateSchema, validateRequest } from '@/lib/validation';

// Cache profile data for 2 minutes (short TTL as it's user-specific)
const PROFILE_CACHE_TTL = 120;

/** Course progress record from course_progress table */
interface CourseProgressRecord {
  progress_percentage: number;
  last_activity_at: string | null;
}

/** Query result for array data */
interface QueryArrayResult<T> {
  data: T[] | null;
  error: unknown;
}

/** Profile with related data from complex select */
interface ProfileWithRelations {
  id: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string;
  enrollments: {
    course: {
      id: string;
      title: string;
      slug: string;
      thumbnail_url: string | null;
    };
    progress: number | null;
    completed_at: string | null;
  }[];
  certifications: {
    id: string;
    course: { title: string };
    issued_at: string;
    certificate_url: string | null;
  }[];
  reviews: {
    id: string;
    course: { title: string };
    rating: number;
    content: string | null;
    created_at: string;
  }[];
  organization: {
    organization: {
      id: string;
      name: string;
      logo_url: string | null;
    };
    role: string;
  }[];
}

/** Type helper for Supabase query results */
interface QuerySingleResult<T> {
  data: T | null;
  error: unknown;
}

// GET - Fetch user profile with stats
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  // Try to get from cache first
  const cachedData = await cacheManager.memoize(
    cacheKeys.userProfile(user.id),
    async () => {
      const supabase = getSupabaseServer();

      // Get full profile with related data
      // Type assertion needed: TS2589 - type instantiation too deep with nested joins
       
      const profileQuery = supabase.from('profiles') as any;
      const { data: profile, error } = await profileQuery
        .select(`
          *,
          enrollments:course_enrollments(
            course:courses(
              id,
              title,
              slug,
              thumbnail_url
            ),
            progress,
            completed_at
          ),
          certifications:certifications(
            id,
            course:courses(title),
            issued_at,
            certificate_url
          ),
          reviews:reviews(
            id,
            course:courses(title),
            rating,
            content,
            created_at
          ),
          organization:organization_members!inner(
            organization:organizations(
              id,
              name,
              logo_url
            ),
            role
          )
        `)
        .eq('id', user.id)
        .single() as QuerySingleResult<ProfileWithRelations>;

      if (error) {
        logger.error('Error fetching profile', error instanceof Error ? error : new Error(String(error)));
        throw internalError('Failed to fetch profile');
      }

      // Get stats
      const [
        { count: totalCourses },
        { count: completedCourses },
        { data: progressData },
        { count: totalCertifications }
      ] = await Promise.all([
        supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .not('completed_at', 'is', null),
        supabase
          .from('course_progress')
          .select('progress_percentage, last_activity_at')
          .eq('user_id', user.id) as unknown as QueryArrayResult<CourseProgressRecord>,
        supabase
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      // Calculate average progress across all courses (as percentage)
      const avgProgress = progressData?.length
        ? progressData.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progressData.length
        : 0;

      return {
        profile,
        stats: {
          totalCourses: totalCourses || 0,
          completedCourses: completedCourses || 0,
          averageProgress: Math.round(avgProgress),
          totalCertifications: totalCertifications || 0
        }
      };
    },
    { ttl: PROFILE_CACHE_TTL, namespace: 'profiles' }
  );

  return successResponse(cachedData);
});

// PUT - Update user profile
export const PUT = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, profileUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const body = validation.data;
  const { full_name, bio, avatar_url } = body;

  // Update profile with validated data
  const profileUpdate = {
    full_name,
    bio,
    avatar_url,
    ...getUpdateTimestamp()
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    logger.error('Error updating profile', error instanceof Error ? error : new Error(String(error)));
    throw internalError('Failed to update profile');
  }

  // Invalidate profile cache
  await cacheManager.clear('profiles');

  return successResponse({ profile });
});

// DELETE - Soft delete user account
export const DELETE = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer();

  // Soft delete - mark account as deleted
  const { error } = await supabase
    .from('profiles')
    .update({
      deleted_at: getCurrentTimestamp(),
      email: `deleted_${user.id}@example.com`,
      full_name: 'Deleted User'
    })
    .eq('id', user.id);

  if (error) {
    logger.error('Error deleting profile', error instanceof Error ? error : new Error(String(error)));
    throw internalError('Failed to delete profile');
  }

  // Invalidate profile cache
  await cacheManager.clear('profiles');

  // Sign out the user
  await supabase.auth.signOut();

  return successResponse({ success: true });
});

