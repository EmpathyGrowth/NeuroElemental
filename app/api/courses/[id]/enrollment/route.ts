import { RouteContext } from '@/lib/types/api';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/db';
import { createAuthenticatedRoute, notFoundError, successResponse } from '@/lib/api';

interface Enrollment {
  id: string;
  progress_percentage: number | null;
  completed_at: string | null;
}

interface LessonCompletion {
  lesson_id: string;
  completed_at: string;
}

/**
 * GET /api/courses/[id]/enrollment
 * Get current user's enrollment and lesson completions for a course
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const { id: courseId } = await context.params;
    const supabase = await getSupabaseServer();

    // Get enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('id, progress_percentage, completed_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (enrollmentError || !enrollment) {
      throw notFoundError('Enrollment');
    }

    // Get all lessons for this course
    const { data: lessons } = await supabase
      .from('course_lessons')
      .select('id')
      .eq('course_id', courseId);

    // Get lesson completions for this user
    const { data: completions } = await supabase
      .from('lesson_completions')
      .select('lesson_id, completed_at')
      .eq('user_id', user.id)
      .in('lesson_id', lessons?.map(l => l.id) || []);

    return successResponse({
      enrollment: enrollment as Enrollment,
      completions: (completions || []) as LessonCompletion[],
    });
  }
);
