/**
 * Assessment History API
 * GET - Get user's assessment history
 */

import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { assessmentRepository } from '@/lib/db/assessments';

export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const assessments = await assessmentRepository.getResults(user.id, 10);

  // Get the latest assessment for quick access
  const latestAssessment = assessments.length > 0 ? assessments[0] : null;

  return successResponse({
    assessments,
    latestAssessment,
    totalCount: assessments.length,
  });
});
