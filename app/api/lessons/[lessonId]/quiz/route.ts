import { RouteContext } from '@/lib/types/api';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/db';
import { createAuthenticatedRoute, notFoundError, successResponse } from '@/lib/api';

interface Quiz {
  id: string;
  title: string;
  passing_score: number | null;
  questions: unknown[];
}

/**
 * GET /api/lessons/[lessonId]/quiz
 * Get quiz associated with a lesson
 */
export const GET = createAuthenticatedRoute<{ lessonId: string }>(
  async (_request: NextRequest, context: RouteContext<{ lessonId: string }>, _user) => {
    const { lessonId } = await context.params;
    const supabase = await getSupabaseServer();

    // Get quiz for this lesson
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('id, title, passing_score, questions')
      .eq('lesson_id', lessonId)
      .single();

    if (error || !quiz) {
      throw notFoundError('Quiz');
    }

    // Strip correct answers from questions for student view
    const sanitizedQuestions = (quiz.questions as Array<{
      id: string;
      question: string;
      type: string;
      options?: string[];
      points: number;
    }>).map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
      // Don't include correct_answer or explanation
    }));

    return successResponse({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        passing_score: quiz.passing_score || 70,
        questions: sanitizedQuestions,
      } as Quiz,
    });
  }
);
