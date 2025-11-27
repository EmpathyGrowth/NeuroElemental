/**
 * Quiz API Routes
 * GET /api/quizzes - List quizzes (admin)
 * POST /api/quizzes - Create a quiz (admin)
 */

import { createAdminRoute, successResponse, validateRequest, badRequestError } from '@/lib/api';
import { quizRepository, getSupabaseServer, type QuizQuestion } from '@/lib/db';
import { quizCreateSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

/** Quiz listing query schema */
const quizListQuerySchema = z.object({
  lesson_id: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * GET /api/quizzes
 * List all quizzes (admin only)
 */
export const GET = createAdminRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const query = quizListQuerySchema.parse({
    lesson_id: searchParams.get('lesson_id') || undefined,
    limit: searchParams.get('limit') || 20,
    offset: searchParams.get('offset') || 0,
  });

  const supabase = getSupabaseServer();

  let queryBuilder = supabase
    .from('quizzes')
    .select('*', { count: 'exact' });

  if (query.lesson_id) {
    queryBuilder = queryBuilder.eq('lesson_id', query.lesson_id);
  }

  const { data: quizzes, error, count } = await queryBuilder
    .range(query.offset, query.offset + query.limit - 1)
    .order('title');

  if (error) {
    throw badRequestError(error.message);
  }

  return successResponse({
    quizzes: quizzes || [],
    pagination: {
      total: count || 0,
      limit: query.limit,
      offset: query.offset,
    },
  });
});

/** Extended quiz create schema with lesson_id */
const createQuizRequestSchema = quizCreateSchema.extend({
  lesson_id: z.string().uuid('Invalid lesson ID'),
});

/**
 * POST /api/quizzes
 * Create a new quiz (admin only)
 */
export const POST = createAdminRoute(async (request) => {
  const validation = await validateRequest(request, createQuizRequestSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { lesson_id, title, passing_score, questions } = validation.data;

  // Add IDs to questions if not present
  const questionsWithIds: QuizQuestion[] = questions.map((q, index) => ({
    id: q.id || `q_${Date.now()}_${index}`,
    question: q.question,
    type: q.type,
    options: q.options,
    correct_answer: q.correct_answer,
    points: q.points ?? 1,
    explanation: q.explanation,
  }));

  const quiz = await quizRepository.createForLesson(
    lesson_id,
    title,
    questionsWithIds,
    passing_score
  );

  return successResponse({ quiz }, 201);
});
