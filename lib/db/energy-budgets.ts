/**
 * Energy Budget Repository
 * Manages energy budget data for the Energy Budget Calculator tool
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for energy budget management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { getUpdateTimestamp } from "@/lib/utils";
import { BaseRepository } from "./base-repository";

type EnergyBudgetRow = Database["public"]["Tables"]["energy_budgets"]["Row"];
// Insert and Update types available for future use
type _EnergyBudgetInsert = Database["public"]["Tables"]["energy_budgets"]["Insert"];
type _EnergyBudgetUpdate = Database["public"]["Tables"]["energy_budgets"]["Update"];

/**
 * Energy activity structure (stored in activities JSONB)
 */
export interface EnergyActivity {
  id: string;
  name: string;
  cost: number; // positive = drain, negative = regenerate
  category: "work" | "social" | "chore" | "regeneration";
}

/**
 * Energy budget with typed activities
 */
export interface EnergyBudget {
  id: string;
  user_id: string | null;
  date: string; // YYYY-MM-DD
  total_budget: number;
  activities: EnergyActivity[];
  remaining_budget: number;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Energy Budget Repository
 * Extends BaseRepository with energy budget-specific operations
 */
export class EnergyBudgetRepository extends BaseRepository<"energy_budgets"> {
  constructor() {
    super("energy_budgets");
  }

  /**
   * Convert database row to typed EnergyBudget
   */
  private toEnergyBudget(row: EnergyBudgetRow): EnergyBudget {
    return {
      id: row.id,
      user_id: row.user_id,
      date: row.date,
      total_budget: row.total_budget,
      activities: (row.activities as unknown as EnergyActivity[]) || [],
      remaining_budget: row.remaining_budget,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Get energy budget for a specific user and date
   *
   * @param userId - User ID
   * @param date - Date in YYYY-MM-DD format
   * @returns Energy budget or null if not found
   */
  async getByUserAndDate(
    userId: string,
    date: string
  ): Promise<EnergyBudget | null> {
    const { data, error } = await this.supabase
      .from("energy_budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching energy budget",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data ? this.toEnergyBudget(data) : null;
  }

  /**
   * Create or update energy budget for a user and date
   *
   * @param userId - User ID
   * @param date - Date in YYYY-MM-DD format
   * @param data - Budget data to upsert
   * @returns Created or updated energy budget
   */
  async upsert(
    userId: string,
    date: string,
    data: {
      total_budget?: number;
      activities?: EnergyActivity[];
      remaining_budget?: number;
    }
  ): Promise<EnergyBudget> {
    // Check if budget exists for this date
    const existing = await this.getByUserAndDate(userId, date);

    if (existing) {
      // Update existing budget
      const updatePayload: Record<string, unknown> = {
        ...getUpdateTimestamp(),
      };

      if (data.total_budget !== undefined) {
        updatePayload.total_budget = data.total_budget;
      }
      if (data.activities !== undefined) {
        updatePayload.activities = data.activities;
      }
      if (data.remaining_budget !== undefined) {
        updatePayload.remaining_budget = data.remaining_budget;
      }

      const { data: updated, error } = await (this.supabase as any)
        .from("energy_budgets")
        .update(updatePayload)
        .eq("id", existing.id)
        .select()
        .single() as { data: EnergyBudgetRow | null; error: Error | null };

      if (error || !updated) {
        logger.error(
          "Error updating energy budget",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to update energy budget");
      }

      return this.toEnergyBudget(updated);
    } else {
      // Create new budget
      const insertPayload = {
        user_id: userId,
        date,
        total_budget: data.total_budget ?? 100,
        activities: data.activities ?? [],
        remaining_budget: data.remaining_budget ?? data.total_budget ?? 100,
      };

      const { data: created, error } = await (this.supabase as any)
        .from("energy_budgets")
        .insert(insertPayload)
        .select()
        .single() as { data: EnergyBudgetRow | null; error: Error | null };

      if (error || !created) {
        logger.error(
          "Error creating energy budget",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to create energy budget");
      }

      return this.toEnergyBudget(created);
    }
  }

  /**
   * Get energy budget history for a user
   *
   * @param userId - User ID
   * @param limit - Maximum number of budgets to return (default: 30)
   * @returns Array of energy budgets ordered by date descending
   */
  async getHistory(userId: string, limit: number = 30): Promise<EnergyBudget[]> {
    const { data, error } = await this.supabase
      .from("energy_budgets")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching energy budget history",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch energy budget history");
    }

    return (data || []).map((row) => this.toEnergyBudget(row));
  }

  /**
   * Get energy budgets for a date range
   *
   * @param userId - User ID
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @returns Array of energy budgets in the date range
   */
  async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<EnergyBudget[]> {
    const { data, error } = await this.supabase
      .from("energy_budgets")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      logger.error(
        "Error fetching energy budgets by date range",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch energy budgets");
    }

    return (data || []).map((row) => this.toEnergyBudget(row));
  }
}

/**
 * Singleton instance of EnergyBudgetRepository
 */
export const energyBudgetRepository = new EnergyBudgetRepository();
