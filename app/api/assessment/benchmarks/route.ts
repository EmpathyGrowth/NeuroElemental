import { createPublicRoute, successResponse, badRequestError } from '@/lib/api';
import { getAssessmentBenchmarks } from '@/lib/analytics/assessment-benchmarks';
import type { ElementType } from '@/lib/content/assessment-questions';

/**
 * GET /api/assessment/benchmarks?electric=45&fiery=67&...
 * Get percentile benchmarks for assessment scores
 */
export const GET = createPublicRoute(async (req) => {
  const { searchParams } = new URL(req.url);

  // Parse scores from query params
  const scores: Record<ElementType, number> = {
    electric: parseInt(searchParams.get('electric') || '0'),
    fiery: parseInt(searchParams.get('fiery') || '0'),
    aquatic: parseInt(searchParams.get('aquatic') || '0'),
    earthly: parseInt(searchParams.get('earthly') || '0'),
    airy: parseInt(searchParams.get('airy') || '0'),
    metallic: parseInt(searchParams.get('metallic') || '0'),
  };

  // Validate scores
  const hasValidScores = Object.values(scores).some(s => s > 0 && s <= 100);
  if (!hasValidScores) {
    throw badRequestError('Invalid scores provided');
  }

  const benchmarks = await getAssessmentBenchmarks(scores);

  return successResponse(benchmarks);
});
