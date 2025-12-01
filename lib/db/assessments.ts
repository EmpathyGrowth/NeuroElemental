/**
 * Assessment Repository
 * Manages assessment data and assessment results
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for assessment management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";
import { getSupabaseServer } from "./index";

type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
type AssessmentInsert = Database["public"]["Tables"]["assessments"]["Insert"];
type _AssessmentUpdate = Database["public"]["Tables"]["assessments"]["Update"];
type AssessmentResult =
  Database["public"]["Tables"]["assessment_results"]["Row"];
type _AssessmentResultInsert =
  Database["public"]["Tables"]["assessment_results"]["Insert"];

/**
 * Assessment Repository
 * Extends BaseRepository with assessment-specific operations
 */
export class AssessmentRepository extends BaseRepository<"assessments"> {
  constructor() {
    super("assessments");
  }

  /**
   * Get the latest assessment for a specific user
   * @param userId The user's ID
   */
  async getLatestByUserId(userId: string): Promise<Assessment | null> {
    const { data, error } = await this.supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching latest assessment",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data as Assessment | null;
  }

  /**
   * Save a new assessment result
   * @param assessment The assessment data to insert
   */
  async createAssessment(
    assessment: AssessmentInsert
  ): Promise<Assessment | null> {
    return this.create(assessment);
  }

  /**
   * Get user's assessment history
   *
   * @param userId - User ID
   * @param limit - Maximum number of results (default: 10)
   * @returns Array of assessments ordered by completion date
   */
  async getUserHistory(
    userId: string,
    limit: number = 10
  ): Promise<Assessment[]> {
    const { data, error } = await this.supabase
      .from("assessments")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching assessment history",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch assessment history");
    }

    return data as Assessment[];
  }

  /**
   * Get organizational assessments
   *
   * @param organizationId - Organization ID
   * @param limit - Maximum number of results
   * @returns Array of organizational assessments
   */
  async getOrganizational(
    organizationId: string,
    limit?: number
  ): Promise<Assessment[]> {
    let query = this.supabase
      .from("assessments")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_organizational", true)
      .order("completed_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching organizational assessments",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch organizational assessments");
    }

    return data as Assessment[];
  }

  /**
   * Get assessment statistics for a user
   *
   * @param userId - User ID
   * @returns Assessment statistics
   */
  async getUserStats(userId: string): Promise<{
    totalAssessments: number;
    latestAssessment: Assessment | null;
    averageScores: Record<string, number>;
  }> {
    const assessments = await this.getUserHistory(userId, 100);

    if (assessments.length === 0) {
      return {
        totalAssessments: 0,
        latestAssessment: null,
        averageScores: {},
      };
    }

    // Calculate average scores across all assessments
    const scoresByElement: Record<string, number[]> = {};

    assessments.forEach((assessment) => {
      const scores = assessment.scores as Record<string, number>;
      Object.entries(scores).forEach(([element, score]) => {
        if (!scoresByElement[element]) {
          scoresByElement[element] = [];
        }
        scoresByElement[element].push(score);
      });
    });

    const averageScores: Record<string, number> = {};
    Object.entries(scoresByElement).forEach(([element, scores]) => {
      averageScores[element] =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });

    return {
      totalAssessments: assessments.length,
      latestAssessment: assessments[0],
      averageScores,
    };
  }

  /**
   * Get assessment results (from assessment_results table)
   *
   * @param userId - User ID
   * @param limit - Maximum number of results
   * @returns Array of assessment results
   */
  async getResults(
    userId: string,
    limit: number = 10
  ): Promise<AssessmentResult[]> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching assessment results",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch assessment results");
    }

    return data as AssessmentResult[];
  }

  /**
   * Get latest assessment result
   *
   * @param userId - User ID
   * @returns Latest assessment result or null
   */
  async getLatestResult(userId: string): Promise<AssessmentResult | null> {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching latest assessment result",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data as AssessmentResult | null;
  }
}

/**
 * Singleton instance of AssessmentRepository
 */
export const assessmentRepository = new AssessmentRepository();
