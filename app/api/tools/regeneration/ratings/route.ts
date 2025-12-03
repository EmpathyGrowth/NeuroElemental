import {
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { strategyRatingRepository, type ElementType } from "@/lib/db/strategy-ratings";

/**
 * GET /api/tools/regeneration/ratings
 * Return user ratings and top strategies
 * Requirements: 4.2, 4.3, 4.4
 */
export const GET = createAuthenticatedRoute(async (req, _context, user) => {
  // Parse query params for optional element filter
  const url = new URL(req.url);
  const elementParam = url.searchParams.get("element");
  const element = elementParam as ElementType | undefined;

  // Get all user ratings (optionally filtered by element)
  const ratings = await strategyRatingRepository.getUserRatings(user.id, element);

  // Get top strategies (rating >= 4)
  const topStrategies = await strategyRatingRepository.getTopStrategies(user.id, 4);

  // Get rating statistics
  const stats = await strategyRatingRepository.getStats(user.id);

  return successResponse({
    ratings,
    topStrategies,
    stats,
    hasTopStrategies: topStrategies.length >= 3, // For showing "Your Top Strategies" section
  });
});
