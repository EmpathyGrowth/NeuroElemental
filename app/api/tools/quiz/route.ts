import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { quickQuizRepository, type ElementScores } from "@/lib/db/quick-quiz-results";
import { z } from "zod";

const quizResultSchema = z.object({
  scores: z.object({
    electric: z.number().min(0).max(100),
    fiery: z.number().min(0).max(100),
    aquatic: z.number().min(0).max(100),
    earthly: z.number().min(0).max(100),
    airy: z.number().min(0).max(100),
    metallic: z.number().min(0).max(100),
  }),
});

/**
 * POST /api/tools/quiz
 * Save quiz result
 * Requirements: 10.1
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, quizResultSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const result = await quickQuizRepository.saveResult(
    user.id,
    validation.data.scores as ElementScores
  );

  return successResponse({
    message: "Quiz result saved successfully",
    success: true,
    result,
  });
});
