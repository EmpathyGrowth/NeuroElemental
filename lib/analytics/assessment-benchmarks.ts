import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import type { ElementType } from '@/lib/content/assessment-questions';

export interface ElementPercentile {
  element: ElementType;
  score: number;
  percentile: number;
  isAboveAverage: boolean;
  isTopQuartile: boolean;
  isTopDecile: boolean;
}

export interface AssessmentBenchmark {
  percentiles: ElementPercentile[];
  totalAssessments: number;
  avgElementScore: Record<ElementType, number>;
  blendRarity: number; // How rare is this blend type (0-100, lower = more rare)
}

/**
 * Calculate percentile for a score given a sorted array of all scores
 */
function calculatePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 50;

  const below = allScores.filter(s => s < score).length;
  const equal = allScores.filter(s => s === score).length;

  // Use midpoint method for ties
  const percentile = ((below + equal / 2) / allScores.length) * 100;

  return Math.round(percentile);
}

/**
 * Get assessment benchmarks for a user's scores
 * Compares their scores against all historical assessments
 */
export async function getAssessmentBenchmarks(
  userScores: Record<ElementType, number>
): Promise<AssessmentBenchmark> {
  const supabase = getSupabaseServer();

  try {
    // Fetch all assessment scores from database
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('scores')
      .limit(10000); // Limit to prevent performance issues

    if (error) {
      logger.error('Error fetching assessment benchmarks:', error as Error);
      return getDefaultBenchmarks(userScores);
    }

    if (!assessments || assessments.length === 0) {
      return getDefaultBenchmarks(userScores);
    }

    // Extract scores for each element
    const elementScores: Record<ElementType, number[]> = {
      electric: [],
      fiery: [],
      aquatic: [],
      earthly: [],
      airy: [],
      metallic: [],
    };

    const avgScores: Record<ElementType, number> = {
      electric: 0,
      fiery: 0,
      aquatic: 0,
      earthly: 0,
      airy: 0,
      metallic: 0,
    };

    // Collect all scores
    assessments.forEach((assessment) => {
      const scores = assessment.scores as Record<string, number>;
      Object.entries(scores).forEach(([element, score]) => {
        if (element in elementScores) {
          elementScores[element as ElementType].push(score);
        }
      });
    });

    // Calculate averages
    Object.entries(elementScores).forEach(([element, scores]) => {
      if (scores.length > 0) {
        avgScores[element as ElementType] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });

    // Calculate percentiles for user's scores
    const percentiles: ElementPercentile[] = Object.entries(userScores).map(([element, score]) => {
      const el = element as ElementType;
      const allScores = elementScores[el];
      const percentile = calculatePercentile(score, allScores);

      return {
        element: el,
        score,
        percentile,
        isAboveAverage: score > avgScores[el],
        isTopQuartile: percentile >= 75,
        isTopDecile: percentile >= 90,
      };
    });

    // Calculate blend rarity (simplified - based on dominant element frequency)
    const dominantElement = Object.entries(userScores)
      .sort(([, a], [, b]) => b - a)[0][0] as ElementType;

    const dominantElementCount = assessments.filter((a) => {
      const scores = a.scores as Record<string, number>;
      const topElement = Object.entries(scores)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
      return topElement === dominantElement;
    }).length;

    const blendRarity = 100 - Math.round((dominantElementCount / assessments.length) * 100);

    return {
      percentiles,
      totalAssessments: assessments.length,
      avgElementScore: avgScores,
      blendRarity,
    };
  } catch (error) {
    logger.error('Error calculating benchmarks:', error as Error);
    return getDefaultBenchmarks(userScores);
  }
}

/**
 * Get default benchmarks when no data available
 */
function getDefaultBenchmarks(userScores: Record<ElementType, number>): AssessmentBenchmark {
  const percentiles: ElementPercentile[] = Object.entries(userScores).map(([element, score]) => ({
    element: element as ElementType,
    score,
    percentile: 50, // Default to median
    isAboveAverage: false,
    isTopQuartile: false,
    isTopDecile: false,
  }));

  return {
    percentiles,
    totalAssessments: 0,
    avgElementScore: {
      electric: 50,
      fiery: 50,
      aquatic: 50,
      earthly: 50,
      airy: 50,
      metallic: 50,
    },
    blendRarity: 50,
  };
}

/**
 * Get user-friendly percentile description
 */
export function getPercentileDescription(percentile: number): string {
  if (percentile >= 99) return 'Top 1%';
  if (percentile >= 95) return 'Top 5%';
  if (percentile >= 90) return 'Top 10%';
  if (percentile >= 75) return 'Top 25%';
  if (percentile >= 50) return 'Above Average';
  if (percentile >= 25) return 'Average';
  return 'Below Average';
}

/**
 * Get percentile color for visualization
 */
export function getPercentileColor(percentile: number): string {
  if (percentile >= 90) return 'text-purple-500';
  if (percentile >= 75) return 'text-blue-500';
  if (percentile >= 50) return 'text-green-500';
  if (percentile >= 25) return 'text-amber-500';
  return 'text-gray-500';
}
