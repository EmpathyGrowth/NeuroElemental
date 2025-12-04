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
    const { data: enrollment, error: enrollmentError } = await (supabase as any)
      .from('course_enrollments')
      .select('id, progress_percentage, completed_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single() as { data: Enrollment | null; error: { message: string } | null };

    if (enrollmentError || !enrollment) {
      throw notFoundError('Enrollment');
    }

    // Get all lessons for this course
    const { data: lessons } = await (supabase as any)
      .from('course_lessons')
      .select('id')
      .eq('course_id', courseId) as { data: Array<{ id: string }> | null };

    // Get lesson completions for this user
    const { data: completions } = await (supabase as any)
      .from('lesson_completions')
      .select('lesson_id, completed_at')
      .eq('user_id', user.id)
      .in('lesson_id', lessons?.map((l: { id: string }) => l.id) || []) as { data: LessonCompletion[] | null };

    return successResponse({
      enrollment: enrollment as Enrollment,
      completions: (completions || []) as LessonCompletion[],
    });
  }
);
