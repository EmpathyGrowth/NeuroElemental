/**
 * Quiz Stats API Route
 * GET /api/quizzes/[id]/stats - Get statistics for a quiz
 */

import { RouteContext } from '@/lib/types/api';
import {
  createAdminRoute,
  successResponse,
  notFoundError,
} from '@/lib/api';
import { quizRepository } from '@/lib/db';

type QuizParams = { id: string };

/**
 * GET /api/quizzes/[id]/stats
 * Get quiz statistics (admin only)
 */
export const GET = createAdminRoute<QuizParams>(
  async (_request, context: RouteContext<QuizParams>) => {
    const { id } = await context.params;

    // First verify the quiz exists
    const quiz = await quizRepository.findByIdOrNull(id);
    if (!quiz) {
      throw notFoundError('Quiz');
    }

    // Get the stats from the repository
    const stats = await quizRepository.getQuizStats(id);

    return successResponse({
      quiz_id: id,
      ...stats,
    });
  }
);
