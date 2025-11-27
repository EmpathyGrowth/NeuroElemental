import { badRequestError, createOptionalAuthRoute, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { rateLimit } from '@/lib/rate-limit';
import { getCompletionTimestamp } from '@/lib/utils';
import { assessmentAnswersSchema } from '@/lib/validation/schemas';

/** Assessment result insert data */
interface AssessmentInsert {
  user_id: string;
  element_scores: Record<string, number>;
  top_element: string;
  personality_traits: Record<string, number>;
  completed_at: string;
}

// Element mapping (must match the frontend)
const questionsMap: Record<number, string> = {
  1: "electric", 7: "electric", 13: "electric", 19: "electric", 25: "electric",
  2: "fiery", 8: "fiery", 14: "fiery", 20: "fiery", 26: "fiery",
  3: "aquatic", 9: "aquatic", 15: "aquatic", 21: "aquatic", 27: "aquatic",
  4: "earthly", 10: "earthly", 16: "earthly", 22: "earthly", 28: "earthly",
  5: "airy", 11: "airy", 17: "airy", 23: "airy", 29: "airy",
  6: "metallic", 12: "metallic", 18: "metallic", 24: "metallic", 30: "metallic",
};

export const POST = createOptionalAuthRoute(async (request, _context, user) => {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = rateLimit(ip, { limit: 5, windowMs: 60 * 1000 }); // 5 requests per minute

  if (!success) {
    throw badRequestError('Too many requests. Please try again later.');
  }

  // Validate input
  const validation = await validateRequest(request, assessmentAnswersSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { answers } = validation.data;

  // Calculate scores
  const scores: Record<string, number> = {
    electric: 0,
    fiery: 0,
    aquatic: 0,
    earthly: 0,
    airy: 0,
    metallic: 0,
  };

  Object.entries(answers).forEach(([questionId, rating]) => {
    const element = questionsMap[parseInt(questionId)];
    if (element) {
      scores[element] += rating;
    }
  });

  // Convert to percentages
  const percentages: Record<string, number> = {};
  Object.entries(scores).forEach(([element, score]) => {
    // Max score per element is 5 questions * 5 points = 25
    percentages[element] = Math.round((score / 25) * 100);
  });

  // Save to database if user is authenticated
  if (user) {
    const supabase = getSupabaseServer();
    // Determine the top element
    const topElement = Object.entries(percentages).reduce(
      (a, b) => (percentages[a[0]] > percentages[b[0]] ? a : b)
    )[0];

    const assessmentData: AssessmentInsert = {
      user_id: user.id,
      element_scores: percentages,
      top_element: topElement,
      personality_traits: answers,
      ...getCompletionTimestamp(),
    };

    const { error } = await supabase
      .from('assessment_results')
      .insert(assessmentData) as { error: { message: string } | null };

    if (error) {
      logger.error('Error saving assessment', new Error(error.message));
    }
  }

  return successResponse({
    success: true,
    scores: percentages,
  });
});

