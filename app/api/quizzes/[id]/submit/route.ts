/**
 * Quiz Submission API
 * POST /api/quizzes/[id]/submit - Submit quiz answers
 */

import { RouteContext } from '@/lib/types/api';
import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
  validateRequest,
} from '@/lib/api';
import { quizRepository, type QuizQuestion } from '@/lib/db';
import { z } from 'zod';

type QuizParams = { id: string };

/** Quiz submission request schema */
const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.boolean()])),
});

/**
 * POST /api/quizzes/[id]/submit
 * Submit quiz answers and get results
 */
export const POST = createAuthenticatedRoute<QuizParams>(
  async (request, context: RouteContext<QuizParams>, user) => {
    const { id } = await context.params;

    const quiz = await quizRepository.findByIdWithQuestions(id);
    if (!quiz) {
      throw notFoundError('Quiz');
    }

    const validation = await validateRequest(request, submitQuizSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const { answers } = validation.data;

    // Submit attempt and get graded result
    const { attempt, result } = await quizRepository.submitAttempt(
      user.id,
      id,
      answers
    );

    // Get correct answers for feedback (only after submission)
    const feedback = quiz.questions.map((q: QuizQuestion) => ({
      question_id: q.id,
      question: q.question,
      user_answer: answers[q.id],
      correct_answer: q.correct_answer,
      is_correct: answers[q.id]?.toString().toLowerCase() === q.correct_answer.toString().toLowerCase(),
      explanation: q.explanation,
      points: q.points,
    }));

    return successResponse({
      attempt_id: attempt.id,
      score: result.score,
      passed: result.passed,
      passing_score: quiz.passing_score || 70,
      total_questions: result.total_questions,
      correct_count: result.correct_count,
      total_points: result.total_points,
      earned_points: result.earned_points,
      feedback,
    });
  }
);
