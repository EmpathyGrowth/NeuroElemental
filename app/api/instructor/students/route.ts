/**
 * Instructor Students API
 * Get list of students enrolled in instructor's courses
 */

import {
  createAuthenticatedRoute,
  successResponse,
  forbiddenError,
} from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { logger } from '@/lib/logging';

interface EnrollmentRecord {
  course_id: string | null;
  progress_percentage: number | null;
  enrolled_at: string | null;
  completed_at: string | null;
  course: {
    id: string;
    title: string;
  } | null;
}

interface _StudentRecord {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  last_sign_in_at: string | null;
  course_enrollments: EnrollmentRecord[];
}

/**
 * GET /api/instructor/students
 * Get all students enrolled in instructor's courses
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const role = await getUserRole();
  if (role !== 'instructor' && role !== 'admin') {
    throw forbiddenError('Instructor or admin access required');
  }

  const supabase = await getSupabaseServer();

  try {
    // Get instructor's course IDs
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title')
      .eq('instructor_id', user.id);

    const courseIds = courses?.map((c) => c.id) || [];

    if (courseIds.length === 0) {
      return successResponse({
        students: [],
        courses: [],
        total_students: 0,
      });
    }

    // Get all enrollments for instructor's courses
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select(`
        user_id,
        course_id,
        progress_percentage,
        enrolled_at,
        completed_at,
        course:courses(id, title)
      `)
      .in('course_id', courseIds);

    // Group enrollments by user
    const userEnrollmentsMap = new Map<string, EnrollmentRecord[]>();
    (enrollments || []).forEach((enrollment) => {
      const userId = enrollment.user_id;
      if (!userId) return; // Skip enrollments without user_id
      if (!userEnrollmentsMap.has(userId)) {
        userEnrollmentsMap.set(userId, []);
      }
      userEnrollmentsMap.get(userId)!.push({
        course_id: enrollment.course_id,
        progress_percentage: enrollment.progress_percentage,
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        course: enrollment.course as { id: string; title: string },
      });
    });

    // Get user profiles for enrolled students
    const userIds = Array.from(userEnrollmentsMap.keys());

    if (userIds.length === 0) {
      return successResponse({
        students: [],
        courses: courses || [],
        total_students: 0,
      });
    }

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .in('id', userIds);

    // Get last activity for users from lesson_completions
    const { data: lastActivities } = await supabase
      .from('lesson_completions')
      .select('user_id, completed_at')
      .in('user_id', userIds)
      .order('completed_at', { ascending: false });

    // Create a map of user_id to last activity
    const lastActivityMap = new Map<string, string>();
    (lastActivities || []).forEach((activity) => {
      if (!activity.user_id || !activity.completed_at) return; // Skip activities without user_id or completed_at
      if (!lastActivityMap.has(activity.user_id)) {
        lastActivityMap.set(activity.user_id, activity.completed_at);
      }
    });

    // Build student list with enrollments
    const students = (profiles || []).map((profile) => {
      const userEnrollments = userEnrollmentsMap.get(profile.id) || [];
      const completedCount = userEnrollments.filter((e) => e.completed_at).length;
      const totalProgress = userEnrollments.length > 0
        ? Math.round(
            userEnrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) /
              userEnrollments.length
          )
        : 0;

      return {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        avatar_url: profile.avatar_url,
        enrolled_courses: userEnrollments.length,
        completed_courses: completedCount,
        total_progress: totalProgress,
        last_active: lastActivityMap.get(profile.id) || null,
        enrollments: userEnrollments.map((e) => ({
          course_id: e.course_id,
          course_title: e.course?.title || 'Unknown',
          progress: e.progress_percentage || 0,
          enrolled_at: e.enrolled_at,
          completed_at: e.completed_at,
        })),
      };
    });

    // Sort by total progress descending
    students.sort((a, b) => b.total_progress - a.total_progress);

    return successResponse({
      students,
      courses: courses || [],
      total_students: students.length,
    });
  } catch (error) {
    logger.error('Error fetching instructor students:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
});
