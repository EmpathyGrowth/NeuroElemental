/**
 * Instructor Analytics API
 * Get detailed analytics for the instructor's courses
 */

import {
  createAuthenticatedRoute,
  successResponse,
  forbiddenError,
} from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { logger } from '@/lib/logging';

/**
 * GET /api/instructor/analytics
 * Get analytics data for the instructor
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const role = await getUserRole();
  if (role !== 'instructor' && role !== 'admin') {
    throw forbiddenError('Instructor or admin access required');
  }

  const supabase = await getSupabaseServer();
  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '30d';

  // Calculate date range
  let startDate: Date;
  switch (range) {
    case '7d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '90d':
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'all':
      startDate = new Date('2020-01-01');
      break;
    default: // 30d
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
  }

  try {
    // Get instructor's courses
    const { data: courses } = await (supabase as any)
      .from('courses')
      .select('id, title')
      .eq('created_by', user.id) as { data: { id: string; title: string }[] | null };

    const courseIds = courses?.map((c) => c.id) || [];

    if (courseIds.length === 0) {
      return successResponse({
        overview: {
          total_students: 0,
          total_revenue: 0,
          total_courses: 0,
          average_rating: 0,
          completion_rate: 0,
          new_enrollments_30d: 0,
        },
        courses: [],
        recent_enrollments: [],
        engagement: {
          lessons_completed_30d: 0,
          average_time_per_lesson: 0,
          quiz_pass_rate: 0,
        },
      });
    }

    // Get total enrollments
    const { count: totalStudents } = await (supabase as any)
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds) as { count: number | null };

    // Get new enrollments in date range
    const { count: newEnrollments } = await (supabase as any)
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .gte('enrolled_at', startDate.toISOString()) as { count: number | null };

    // Get completed enrollments
    const { count: completedEnrollments } = await (supabase as any)
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .not('completed_at', 'is', null) as { count: number | null };

    // Get course reviews for rating
    const { data: reviews } = await (supabase as any)
      .from('course_reviews')
      .select('rating')
      .in('course_id', courseIds) as { data: { rating: number }[] | null };

    const averageRating = reviews?.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Calculate completion rate
    const completionRate =
      totalStudents && totalStudents > 0
        ? Math.round(((completedEnrollments || 0) / totalStudents) * 100)
        : 0;

    // Get per-course analytics
    const courseAnalytics = await Promise.all(
      (courses || []).map(async (course) => {
        const { count: studentCount } = await (supabase as any)
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id) as { count: number | null };

        const { count: completedCount } = await (supabase as any)
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .not('completed_at', 'is', null) as { count: number | null };

        const { data: courseReviews } = await (supabase as any)
          .from('course_reviews')
          .select('rating')
          .eq('course_id', course.id) as { data: { rating: number }[] | null };

        const courseRating = courseReviews?.length
          ? courseReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / courseReviews.length
          : 0;

        // Get course price for revenue calculation
        const { data: courseData } = await (supabase as any)
          .from('courses')
          .select('price_usd')
          .eq('id', course.id)
          .single() as { data: { price_usd: number | null } | null };

        const revenue = (studentCount || 0) * ((courseData?.price_usd || 0) * 100);

        return {
          id: course.id,
          title: course.title,
          student_count: studentCount || 0,
          completion_rate:
            studentCount && studentCount > 0
              ? Math.round(((completedCount || 0) / studentCount) * 100)
              : 0,
          revenue,
          average_rating: courseRating,
          total_reviews: courseReviews?.length || 0,
        };
      })
    );

    // Get recent enrollments
    const { data: recentEnrollments } = await (supabase as any)
      .from('course_enrollments')
      .select(`
        id,
        enrolled_at,
        user:profiles!course_enrollments_user_id_fkey(full_name),
        course:courses(title)
      `)
      .in('course_id', courseIds)
      .order('enrolled_at', { ascending: false })
      .limit(10) as { data: { id: string; enrolled_at: string; user: { full_name: string | null } | null; course: { title: string } | null }[] | null };

    // Calculate total revenue
    const totalRevenue = courseAnalytics.reduce((sum, c) => sum + c.revenue, 0);

    // Get lesson completions in date range for instructor's courses
    // First get all lessons from instructor's courses
    const { data: courseLessonsData } = await (supabase as any)
      .from('course_modules')
      .select('id')
      .in('course_id', courseIds) as { data: { id: string }[] | null };

    const moduleIds = courseLessonsData?.map((m) => m.id) || [];

    const { data: lessonsData } = moduleIds.length > 0
      ? await (supabase as any)
          .from('course_lessons')
          .select('id, duration_minutes')
          .in('module_id', moduleIds) as { data: { id: string; duration_minutes: number | null }[] | null }
      : { data: [] as { id: string; duration_minutes: number | null }[] };

    const lessonIds = lessonsData?.map((l) => l.id) || [];

    // Count lesson completions in date range
    const { count: lessonsCompleted } = lessonIds.length > 0
      ? await (supabase as any)
          .from('lesson_completions')
          .select('*', { count: 'exact', head: true })
          .in('lesson_id', lessonIds)
          .gte('completed_at', startDate.toISOString()) as { count: number | null }
      : { count: 0 };

    // Calculate average lesson duration from course_lessons.duration_minutes
    const avgLessonDuration = lessonsData?.length
      ? Math.round(
          lessonsData.reduce((sum, l) => sum + (l.duration_minutes || 0), 0) /
            lessonsData.length
        )
      : 0;

    // Get quiz pass rate from quiz_attempts table
    // First get quiz IDs for instructor's lessons
    const { data: quizzesData } = lessonIds.length > 0
      ? await (supabase as any)
          .from('quizzes')
          .select('id')
          .in('lesson_id', lessonIds) as { data: { id: string }[] | null }
      : { data: [] as { id: string }[] };

    const quizIds = quizzesData?.map((q) => q.id) || [];

    let quizPassRate = 0;
    if (quizIds.length > 0) {
      const { data: quizAttempts } = await (supabase as any)
        .from('quiz_attempts')
        .select('passed')
        .in('quiz_id', quizIds) as { data: { passed: boolean }[] | null };

      if (quizAttempts?.length) {
        const passedCount = quizAttempts.filter((a) => a.passed).length;
        quizPassRate = Math.round((passedCount / quizAttempts.length) * 100);
      }
    }

    return successResponse({
      overview: {
        total_students: totalStudents || 0,
        total_revenue: totalRevenue,
        total_courses: courses?.length || 0,
        average_rating: averageRating,
        completion_rate: completionRate,
        new_enrollments_30d: newEnrollments || 0,
      },
      courses: courseAnalytics,
      recent_enrollments: (recentEnrollments || []).map((e) => ({
        id: e.id,
        user_name: (e.user as { full_name: string | null })?.full_name || 'Anonymous',
        course_title: (e.course as { title: string })?.title || 'Unknown',
        enrolled_at: e.enrolled_at,
      })),
      engagement: {
        lessons_completed_30d: lessonsCompleted || 0,
        average_time_per_lesson: avgLessonDuration,
        quiz_pass_rate: quizPassRate,
      },
    });
  } catch (error) {
    logger.error('Error fetching instructor analytics:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});
