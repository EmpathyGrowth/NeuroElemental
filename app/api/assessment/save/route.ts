import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { assessmentRepository } from "@/lib/db";
import { getCurrentTimestamp } from "@/lib/utils";
import { z } from "zod";

const saveResultsSchema = z.object({
  scores: z.record(z.string(), z.number()),
  answers: z.record(z.string(), z.number()),
});

export const POST = createAuthenticatedRoute(
  async (request, _context, user) => {
    const validation = await validateRequest(request, saveResultsSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const { scores, answers } = validation.data;

    // Save assessment to user's profile
    await assessmentRepository.createAssessment({
      user_id: user.id,
      scores,
      answers,
      version: "1.0",
      completed_at: getCurrentTimestamp(),
    });

    return successResponse({ success: true });
  }
);
