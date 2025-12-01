import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { lessonProgressRepository } from '@/lib/db/lesson-progress';

/**
 * GET /api/user/learning-stats
 * Get user's learning time statistics
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  const stats = await lessonProgressRepository.getUserLearningStats(user.id);
  return successResponse(stats);
});
