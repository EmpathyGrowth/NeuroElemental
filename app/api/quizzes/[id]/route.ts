/**
 * Quiz Detail API Routes
 * GET /api/quizzes/[id] - Get quiz details
 * PUT /api/quizzes/[id] - Update a quiz (admin)
 * DELETE /api/quizzes/[id] - Delete a quiz (admin)
 */

import { RouteContext } from '@/lib/types/api';
import {
  createAuthenticatedRoute,
  createAdminRoute,
  successResponse,
  notFoundError,
  validateRequest,
} from '@/lib/api';
import { quizRepository } from '@/lib/db';
import { quizCreateSchema } from '@/lib/validation/schemas';

type QuizParams = { id: string };

/**
 * GET /api/quizzes/[id]
 * Get quiz details (authenticated users)
 */
export const GET = createAuthenticatedRoute<QuizParams>(
  async (_request, context: RouteContext<QuizParams>) => {
    const { id } = await context.params;

    const quiz = await quizRepository.findByIdWithQuestions(id);
    if (!quiz) {
      throw notFoundError('Quiz');
    }

    return successResponse({ quiz });
  }
);

/**
 * PUT /api/quizzes/[id]
 * Update a quiz (admin only)
 */
export const PUT = createAdminRoute<QuizParams>(
  async (request, context: RouteContext<QuizParams>) => {
    const { id } = await context.params;

    const existingQuiz = await quizRepository.findByIdOrNull(id);
    if (!existingQuiz) {
      throw notFoundError('Quiz');
    }

    const validation = await validateRequest(request, quizCreateSchema.partial());
    if (!validation.success) {
      throw validation.error;
    }

    const { title, passing_score, questions } = validation.data;

    // Update with provided fields
    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (passing_score !== undefined) updateData.passing_score = passing_score;
    if (questions) {
      // Add IDs to new questions if not present
      updateData.questions = questions.map((q, index) => ({
        ...q,
        id: `q_${Date.now()}_${index}`,
      }));
    }

    const quiz = await quizRepository.update(id, updateData);

    return successResponse({ quiz });
  }
);

/**
 * DELETE /api/quizzes/[id]
 * Delete a quiz (admin only)
 */
export const DELETE = createAdminRoute<QuizParams>(
  async (_request, context: RouteContext<QuizParams>) => {
    const { id } = await context.params;

    const existingQuiz = await quizRepository.findByIdOrNull(id);
    if (!existingQuiz) {
      throw notFoundError('Quiz');
    }

    await quizRepository.delete(id);

    return successResponse({ success: true, message: 'Quiz deleted' });
  }
);
