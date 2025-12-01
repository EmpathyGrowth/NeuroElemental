import {
  badRequestError,
  createOptionalAuthRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import {
  calculateAssessmentResult,
  validateAnswers,
} from "@/lib/content/assessment-questions";
import { getSupabaseServer } from "@/lib/db";
import { checkAssessmentAchievement } from "@/lib/gamification/achievement-service";
import { logger } from "@/lib/logging";
import { rateLimit } from "@/lib/rate-limit";
import { getCurrentTimestamp } from "@/lib/utils";
import { z } from "zod";

/**
 * Validation schema for assessment submission
 * Supports both old 30-question format and new 36-question format
 */
const assessmentSubmitSchema = z.object({
  answers: z
    .record(z.string().regex(/^\d+$/), z.number().int().min(1).max(5))
    .refine(
      (answers) => {
        const keys = Object.keys(answers).map(Number);
        // Must have at least 30 questions answered (backwards compatibility)
        return keys.length >= 30;
      },
      { message: `At least 30 questions must be answered` }
    ),
});

export const POST = createOptionalAuthRoute(async (request, _context, user) => {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(ip, { limit: 5, windowMs: 60 * 1000 });

  if (!success) {
    throw badRequestError("Too many requests. Please try again later.");
  }

  // Validate input
  const validation = await validateRequest(request, assessmentSubmitSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { answers: rawAnswers } = validation.data;

  // Convert string keys to numbers
  const answers: Record<number, number> = {};
  Object.entries(rawAnswers).forEach(([key, value]) => {
    answers[parseInt(key)] = value;
  });

  // Validate answers
  const answerValidation = validateAnswers(answers);

  // For backwards compatibility, allow 30-question submissions
  // but use the new system for 36-question submissions
  const isNewFormat = Object.keys(answers).some((k) => parseInt(k) > 30);

  if (isNewFormat && !answerValidation.valid) {
    logger.warn("Invalid assessment submission", {
      missingQuestions: answerValidation.missingQuestions,
      invalidAnswers: answerValidation.invalidAnswers,
    });
  }

  // Calculate comprehensive result
  const result = calculateAssessmentResult(answers);

  // Extract percentage scores for backwards compatibility
  const percentageScores: Record<string, number> = {};
  Object.entries(result.scores).forEach(([element, score]) => {
    percentageScores[element] = score.percentage;
  });

  // Save to database if user is authenticated
  if (user) {
    const supabase = getSupabaseServer();

    const assessmentData = {
      user_id: user.id,
      scores: percentageScores,
      answers: answers,
      version: isNewFormat ? "2.0" : "1.0",
      completed_at: getCurrentTimestamp(),
      // Extended data for v2
      ...(isNewFormat && {
        top_elements: result.topElements,
        energy_type: result.energyType,
        blend_type: result.patterns.blendType,
        validity_score: result.validity.responseConsistency,
        patterns: result.patterns,
        shadow_indicators: result.shadowIndicators,
      }),
    };

    const { error } = await supabase.from("assessments").insert(assessmentData);

    if (error) {
      logger.error("Error saving assessment", new Error(error.message));
    } else {
      // Check assessment achievement (async, don't block response)
      checkAssessmentAchievement(user.id).catch((err) => {
        logger.error("Error checking assessment achievement:", err as Error);
      });
    }
  }

  // Return comprehensive response
  return successResponse({
    success: true,
    // Legacy format (percentage numbers)
    scores: percentageScores,
    // New comprehensive format
    result: {
      scores: result.scores,
      topElements: result.topElements,
      energyType: result.energyType,
      patterns: result.patterns,
      validity: result.validity,
      shadowIndicators: result.shadowIndicators,
    },
    // Shortcuts for easy access
    patterns: result.patterns,
    validity: result.validity,
    topElements: result.topElements,
  });
});
