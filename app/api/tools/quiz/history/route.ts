import {
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { quickQuizRepository } from "@/lib/db/quick-quiz-results";

/**
 * GET /api/tools/quiz/history
 * Return quiz history with assessment comparison
 * Requirements: 10.2, 10.3
 */
export const GET = createAuthenticatedRoute(async (req, _context, user) => {
  // Parse query params for limit
  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 10;

  // Get quiz history
  const history = await quickQuizRepository.getHistory(user.id, limit);

  // Get comparison for most recent quiz if available
  let comparison = null;
  if (history.length > 0) {
    comparison = await quickQuizRepository.compareWithAssessment(
      user.id,
      history[0].id
    );
  }

  // Get total quiz count
  const totalCount = await quickQuizRepository.getQuizCount(user.id);

  return successResponse({
    history,
    count: history.length,
    totalCount,
    comparison,
    hasEnoughData: history.length >= 2, // For showing history chart
  });
});
