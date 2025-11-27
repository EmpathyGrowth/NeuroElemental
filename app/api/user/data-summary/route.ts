/**
 * User Data Summary API - Refactored with Factory Pattern
 * Provides GDPR-compliant data summary for users
 */

import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer();

  // Fetch user's data summary across all tables
  const [
    { data: profile },
    { data: enrollments },
    { data: courseProgress },
    { data: reviews },
    { data: certifications },
    { count: notificationCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('course_enrollments').select('*').eq('user_id', user.id),
    supabase.from('course_progress').select('*').eq('user_id', user.id),
    supabase.from('course_reviews').select('*').eq('user_id', user.id),
    supabase.from('certificates').select('*').eq('user_id', user.id),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
  ]);

  return successResponse({
    profile,
    enrollments: enrollments || [],
    courseProgress: courseProgress || [],
    reviews: reviews || [],
    certifications: certifications || [],
    notificationCount: notificationCount || 0,
    summary: {
      totalEnrollments: enrollments?.length || 0,
      totalCourseProgress: courseProgress?.length || 0,
      totalReviews: reviews?.length || 0,
      totalCertifications: certifications?.length || 0,
      totalNotifications: notificationCount || 0
    }
  });
});

