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

import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { cacheKeys, cacheManager } from '@/lib/cache/cache-manager';
import {
    certificationRepository,
    createRepository,
    enrollmentRepository,
    getSupabaseServer,
    userRepository
} from '@/lib/db';
import { getUpdateTimestamp } from '@/lib/utils';
import { profileUpdateSchema, validateRequest } from '@/lib/validation';

// Cache profile data for 2 minutes (short TTL as it's user-specific)
const PROFILE_CACHE_TTL = 120;

/** Profile with related data from complex select */
interface _ProfileWithRelations {
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
interface _QuerySingleResult<T> {
  data: T | null;
  error: unknown;
}

// GET - Fetch user profile with stats
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  // Try to get from cache first
  const cachedData = await cacheManager.memoize(
    cacheKeys.userProfile(user.id),
    async () => {
      // Initialize ad-hoc repositories
      const progressRepo = createRepository('course_progress');

      // Get full profile with related data
      const profile = await userRepository.getProfileWithRelations(user.id);

      // Get stats
      const [
        totalCourses,
        completedCourses,
        progressData,
        totalCertifications
      ] = await Promise.all([
        enrollmentRepository.getUserEnrollmentCount(user.id),
        enrollmentRepository.getUserCompletedCount(user.id),
        progressRepo.findAll({ user_id: user.id }),
        certificationRepository.getUserApplicationCount(user.id)
      ]);

      // Calculate average progress across all courses (as percentage)
      const avgProgress = progressData?.length
        ? progressData.reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0) / progressData.length
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

  // Update profile using repository
  const profile = await userRepository.updateProfile(user.id, profileUpdate);

  // Invalidate profile cache
  await cacheManager.clear('profiles');

  return successResponse({ profile });
});

// DELETE - Soft delete user account
export const DELETE = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer();

  // Soft delete using repository
  await userRepository.softDelete(user.id);

  // Invalidate profile cache
  await cacheManager.clear('profiles');

  // Sign out the user
  await supabase.auth.signOut();

  return successResponse({ success: true });
});

