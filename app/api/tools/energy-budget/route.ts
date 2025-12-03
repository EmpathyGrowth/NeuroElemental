/**
 * Energy Budget API Routes
 * Manages energy budget data for the Energy Budget Calculator tool
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
  badRequestError,
} from "@/lib/api";
import { energyBudgetRepository, type EnergyActivity } from "@/lib/db/energy-budgets";
import { z } from "zod";

/**
 * Schema for energy activity
 */
const energyActivitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number(), // positive = drain, negative = regenerate
  category: z.enum(["work", "social", "chore", "regeneration"]),
});

/**
 * Schema for creating/updating energy budget
 */
const energyBudgetSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  total_budget: z.number().int().min(1).max(200).optional(),
  activities: z.array(energyActivitySchema).optional(),
  remaining_budget: z.number().int().min(0).optional(),
});

/**
 * GET /api/tools/energy-budget
 * Get energy budget for a specified date
 * Requirements: 3.2
 * 
 * Query params:
 * - date: YYYY-MM-DD format (required)
 */
export const GET = createAuthenticatedRoute(async (req, _context, user) => {
  const url = new URL(req.url);
  const date = url.searchParams.get("date");

  if (!date) {
    throw badRequestError("Date parameter is required (YYYY-MM-DD format)");
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw badRequestError("Date must be in YYYY-MM-DD format");
  }

  const budget = await energyBudgetRepository.getByUserAndDate(user.id, date);

  return successResponse({
    budget,
    date,
  });
});

/**
 * POST /api/tools/energy-budget
 * Create or update energy budget for a date
 * Requirements: 3.1
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, energyBudgetSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { date, total_budget, activities, remaining_budget } = validation.data;

  const budget = await energyBudgetRepository.upsert(user.id, date, {
    total_budget,
    activities: activities as EnergyActivity[],
    remaining_budget,
  });

  return successResponse({
    message: "Energy budget saved successfully",
    budget,
  });
});
