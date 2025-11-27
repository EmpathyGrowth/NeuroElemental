/**
 * Lesson Quiz API Routes
 * GET /api/lessons/[id]/quiz - Get quiz for a lesson
 */

import { RouteContext } from '@/lib/types/api';
import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
} from '@/lib/api';
import { quizRepository } from '@/lib/db';

type LessonParams = { id: string };

/**
 * GET /api/lessons/[id]/quiz
 * Get the quiz associated with a lesson
 */
export const GET = createAuthenticatedRoute<LessonParams>(
  async (_request, context: RouteContext<LessonParams>, user) => {
    const { id } = await context.params;

    // Find quiz by lesson ID
    const quiz = await quizRepository.findByLessonId(id);
    if (!quiz) {
      throw notFoundError('Quiz');
    }

    // Check if user has previous attempts
    const attempts = await quizRepository.getUserAttempts(user.id, quiz.id);
    const bestAttempt = await quizRepository.getUserBestAttempt(user.id, quiz.id);
    const hasPassed = await quizRepository.hasUserPassed(user.id, quiz.id);

    // Remove correct answers from questions for quiz-taking
    const questionsForTaking = quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
      // Don't include correct_answer or explanation until submission
    }));

    return successResponse({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        passing_score: quiz.passing_score,
        questions: questionsForTaking,
      },
      user_progress: {
        attempts_count: attempts.length,
        best_score: bestAttempt?.score ?? null,
        has_passed: hasPassed,
        last_attempt: attempts[0]?.completed_at ?? null,
      },
    });
  }
);
