/**
 * Quick Quiz Results Repository
 * Manages quick quiz result data for the Quick Quiz tool
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for quick quiz result management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database, Json } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type QuickQuizResultRow = Database["public"]["Tables"]["quick_quiz_results"]["Row"];
type QuickQuizResultInsert = Database["public"]["Tables"]["quick_quiz_results"]["Insert"];

/**
 * Element types
 */
export type ElementType =
  | "electric"
  | "fiery"
  | "aquatic"
  | "earthly"
  | "airy"
  | "metallic";

/**
 * Element scores structure
 */
export interface ElementScores {
  electric: number;
  fiery: number;
  aquatic: number;
  earthly: number;
  airy: number;
  metallic: number;
}

/**
 * Quick quiz result with typed fields
 */
export interface QuickQuizResult {
  id: string;
  user_id: string | null;
  scores: ElementScores;
  primary_element: ElementType;
  created_at: string | null;
}

/**
 * Comparison between quiz and assessment results
 */
export interface QuizAssessmentComparison {
  quizResult: QuickQuizResult;
  assessmentScores: ElementScores | null;
  differences: Record<ElementType, number>;
  primaryElementMatch: boolean;
}

/**
 * Quick Quiz Results Repository
 * Extends BaseRepository with quick quiz-specific operations
 */
export class QuickQuizRepository extends BaseRepository<"quick_quiz_results"> {
  constructor() {
    super("quick_quiz_results");
  }

  /**
   * Convert database row to typed QuickQuizResult
   */
  private toQuickQuizResult(row: QuickQuizResultRow): QuickQuizResult {
    return {
      id: row.id,
      user_id: row.user_id,
      scores: row.scores as ElementScores,
      primary_element: row.primary_element as ElementType,
      created_at: row.created_at,
    };
  }

  /**
   * Save a quiz result
   *
   * @param userId - User ID
   * @param scores - Element scores from the quiz
   * @returns Created quiz result
   */
  async saveResult(
    userId: string,
    scores: ElementScores
  ): Promise<QuickQuizResult> {
    // Calculate primary element (highest score)
    const primaryElement = this.calculatePrimaryElement(scores);

    const insertData: QuickQuizResultInsert = {
      user_id: userId,
      scores: scores as unknown as Json,
      primary_element: primaryElement,
    };

    const { data, error } = await this.supabase
      .from("quick_quiz_results")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error saving quick quiz result",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to save quiz result");
    }

    return this.toQuickQuizResult(data);
  }

  /**
   * Get quiz result history for a user
   *
   * @param userId - User ID
   * @param limit - Maximum number of results to return
   * @returns Array of quiz results ordered by date descending
   */
  async getHistory(
    userId: string,
    limit: number = 10
  ): Promise<QuickQuizResult[]> {
    const { data, error } = await this.supabase
      .from("quick_quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching quick quiz history",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch quiz history");
    }

    return (data || []).map((row) => this.toQuickQuizResult(row));
  }

  /**
   * Compare quiz result with full assessment
   *
   * @param userId - User ID
   * @param quizResultId - Quiz result ID to compare
   * @returns Comparison data or null if no assessment exists
   */
  async compareWithAssessment(
    userId: string,
    quizResultId: string
  ): Promise<QuizAssessmentComparison | null> {
    // Get the quiz result
    const { data: quizData, error: quizError } = await this.supabase
      .from("quick_quiz_results")
      .select("*")
      .eq("id", quizResultId)
      .eq("user_id", userId)
      .single();

    if (quizError || !quizData) {
      logger.error(
        "Error fetching quiz result for comparison",
        quizError instanceof Error ? quizError : new Error(String(quizError))
      );
      return null;
    }

    const quizResult = this.toQuickQuizResult(quizData);

    // Get the user's most recent assessment result
    const { data: assessmentData, error: assessmentError } = await this.supabase
      .from("assessment_results")
      .select("element_scores, top_element")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (assessmentError) {
      logger.error(
        "Error fetching assessment for comparison",
        assessmentError instanceof Error
          ? assessmentError
          : new Error(String(assessmentError))
      );
    }

    const assessmentScores = assessmentData?.element_scores as ElementScores | null;

    // Calculate differences
    const differences: Record<ElementType, number> = {
      electric: 0,
      fiery: 0,
      aquatic: 0,
      earthly: 0,
      airy: 0,
      metallic: 0,
    };

    if (assessmentScores) {
      const elements: ElementType[] = [
        "electric",
        "fiery",
        "aquatic",
        "earthly",
        "airy",
        "metallic",
      ];

      for (const element of elements) {
        differences[element] =
          quizResult.scores[element] - (assessmentScores[element] || 0);
      }
    }

    const primaryElementMatch =
      assessmentData?.top_element === quizResult.primary_element;

    return {
      quizResult,
      assessmentScores,
      differences,
      primaryElementMatch,
    };
  }

  /**
   * Get the most recent quiz result for a user
   *
   * @param userId - User ID
   * @returns Most recent quiz result or null
   */
  async getMostRecent(userId: string): Promise<QuickQuizResult | null> {
    const { data, error } = await this.supabase
      .from("quick_quiz_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching most recent quiz result",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data ? this.toQuickQuizResult(data) : null;
  }

  /**
   * Calculate primary element from scores
   */
  private calculatePrimaryElement(scores: ElementScores): ElementType {
    const elements: ElementType[] = [
      "electric",
      "fiery",
      "aquatic",
      "earthly",
      "airy",
      "metallic",
    ];

    let maxElement: ElementType = "electric";
    let maxScore = scores.electric;

    for (const element of elements) {
      if (scores[element] > maxScore) {
        maxScore = scores[element];
        maxElement = element;
      }
    }

    return maxElement;
  }

  /**
   * Get quiz count for a user
   *
   * @param userId - User ID
   * @returns Number of quizzes taken
   */
  async getQuizCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("quick_quiz_results")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      logger.error(
        "Error counting quiz results",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    return count || 0;
  }
}

/**
 * Singleton instance of QuickQuizRepository
 */
export const quickQuizRepository = new QuickQuizRepository();
