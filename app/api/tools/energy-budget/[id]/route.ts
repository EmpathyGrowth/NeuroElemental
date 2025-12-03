/**
 * Energy Budget API Routes - Individual Budget Operations
 * Update energy budget by ID
 * 
 * Requirements: 3.3
 */

import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
  notFoundError,
  forbiddenError,
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
 * Schema for updating energy budget
 */
const energyBudgetUpdateSchema = z.object({
  total_budget: z.number().int().min(1).max(200).optional(),
  activities: z.array(energyActivitySchema).optional(),
  remaining_budget: z.number().int().min(0).optional(),
});

/**
 * PATCH /api/tools/energy-budget/[id]
 * Update activities and remaining budget for an existing energy budget
 * Requirements: 3.3
 */
export const PATCH = createAuthenticatedRoute<{ id: string }>(
  async (req, context, user) => {
    const { id } = await context.params;

    // First, verify the budget exists and belongs to the user
    const existingBudget = await energyBudgetRepository.findByIdOrNull(id);

    if (!existingBudget) {
      throw notFoundError("Energy budget");
    }

    // Verify ownership
    if (existingBudget.user_id !== user.id) {
      throw forbiddenError("You can only update your own energy budgets");
    }

    const validation = await validateRequest(req, energyBudgetUpdateSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const { total_budget, activities, remaining_budget } = validation.data;

    // Use the repository's upsert method with the existing date
    const updatedBudget = await energyBudgetRepository.upsert(
      user.id,
      existingBudget.date,
      {
        total_budget,
        activities: activities as EnergyActivity[],
        remaining_budget,
      }
    );

    return successResponse({
      message: "Energy budget updated successfully",
      budget: updatedBudget,
    });
  }
);

/**
 * GET /api/tools/energy-budget/[id]
 * Get a specific energy budget by ID
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_req, context, user) => {
    const { id } = await context.params;

    const budget = await energyBudgetRepository.findByIdOrNull(id);

    if (!budget) {
      throw notFoundError("Energy budget");
    }

    // Verify ownership
    if (budget.user_id !== user.id) {
      throw forbiddenError("You can only view your own energy budgets");
    }

    return successResponse({
      budget,
    });
  }
);
