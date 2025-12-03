import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { strategyRatingRepository } from "@/lib/db/strategy-ratings";
import { z } from "zod";

const rateStrategySchema = z.object({
  element: z.enum(["electric", "fiery", "aquatic", "earthly", "airy", "metallic"]),
  strategy_id: z.string().min(1),
  strategy_name: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  note: z.string().optional(),
});

/**
 * POST /api/tools/regeneration/rate
 * Save or update a strategy rating
 * Requirements: 4.1
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, rateStrategySchema);
  if (!validation.success) {
    throw validation.error;
  }

  const rating = await strategyRatingRepository.rateStrategy(user.id, {
    element: validation.data.element,
    strategy_id: validation.data.strategy_id,
    strategy_name: validation.data.strategy_name,
    rating: validation.data.rating,
    note: validation.data.note,
  });

  return successResponse({
    message: "Strategy rating saved successfully",
    success: true,
    rating,
  });
});
