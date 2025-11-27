import { RouteContext } from '@/lib/types/api';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/db';
import { badRequestError, createAuthenticatedRoute, successResponse } from '@/lib/api';
import { getCompletionTimestamp, getCurrentTimestamp, getUpdateTimestamp } from '@/lib/utils';

/** Lesson record with course_id */
interface LessonRecord {
  id: string;
  course_id: string;
}

/** Lesson ID result */
interface LessonIdResult {
  id: string;
}

/** Lesson completion record */
interface LessonCompletionResult {
  lesson_id: string;
}

/** Course title result */
interface CourseTitleResult {
  title: string;
}

/** Lesson completion upsert data */
interface LessonCompletionInsert {
  user_id: string;
  lesson_id: string;
  completed_at: string;
}

/** Certificate insert data */
interface CertificateInsert {
  user_id: string;
  course_id: string;
  verification_code: string;
  issued_at: string;
}

/** Completion response */
interface CompletionResponse {
  completed: boolean;
  courseCompleted?: boolean;
  certificateNumber?: string;
}

export const POST = createAuthenticatedRoute<{ lessonId: string }>(
  async (request: NextRequest, context: RouteContext<{ lessonId: string }>, user) => {
    const { lessonId } = await context.params;
    const supabase = await getSupabaseServer();

    // Mark lesson as complete
    const completionData: LessonCompletionInsert = {
      user_id: user.id,
      lesson_id: lessonId,
      ...getCompletionTimestamp(),
    };
    const { error } = await supabase
      .from('lesson_completions')
      .upsert(completionData, {
        onConflict: 'user_id,lesson_id',
      });

    if (error) {
      throw badRequestError(error.message);
    }

    // Check if this completes the course
    const { data: lesson } = await supabase
      .from('course_lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single() as { data: LessonRecord | null; error: unknown };

    if (lesson) {
      // Get all lessons for this course
      const { data: allLessons } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', lesson.course_id) as { data: LessonIdResult[] | null; error: unknown };

      // Get all completions for this user and course
      const { data: completions } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_id', user.id)
        .in('lesson_id', allLessons?.map((l) => l.id) || []) as { data: LessonCompletionResult[] | null; error: unknown };

      // Calculate and update enrollment progress
      if (allLessons && allLessons.length > 0) {
        const completedCount = completions?.length || 0;
        const progressPercentage = Math.round((completedCount / allLessons.length) * 100);

        await supabase
          .from('course_enrollments')
          .update({
            progress_percentage: progressPercentage,
            last_accessed_at: new Date().toISOString(),
            ...getUpdateTimestamp(),
          })
          .eq('user_id', user.id)
          .eq('course_id', lesson.course_id);
      }

      // Check if all lessons are complete
      if (allLessons && completions && completions.length === allLessons.length) {
        // Generate certificate
        const { generateCertificateNumber } = await import('@/lib/certificate/generator');
        const certificateNumber = generateCertificateNumber();

        // Get course details (query needed for future course title in certificates)
        const { data: _course } = await supabase
          .from('courses')
          .select('title')
          .eq('id', lesson.course_id)
          .single() as { data: CourseTitleResult | null; error: unknown };

        // Create certificate record
        const certData: CertificateInsert = {
          user_id: user.id,
          course_id: lesson.course_id,
          verification_code: certificateNumber,
          issued_at: getCurrentTimestamp(),
        };
        await supabase
          .from('certificates')
          .insert(certData);

        const response: CompletionResponse = {
          completed: true,
          courseCompleted: true,
          certificateNumber,
        };
        return successResponse(response);
      }
    }

    return successResponse({ completed: true });
  }
);
