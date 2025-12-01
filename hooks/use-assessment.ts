'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AssessmentResult {
  id: string;
  user_id: string;
  element_scores: Record<string, number>;
  top_element: string | null;
  personality_traits: Record<string, number> | null;
  completed_at: string | null;
  created_at: string | null;
}

interface UseAssessmentReturn {
  latestAssessment: AssessmentResult | null;
  assessmentHistory: AssessmentResult[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAssessment(): UseAssessmentReturn {
  const [latestAssessment, setLatestAssessment] = useState<AssessmentResult | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assessment/history');

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated - this is not an error state
          setLatestAssessment(null);
          setAssessmentHistory([]);
          return;
        }
        throw new Error('Failed to fetch assessment history');
      }

      const data = await response.json();
      setLatestAssessment(data.latestAssessment);
      setAssessmentHistory(data.assessments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return {
    latestAssessment,
    assessmentHistory,
    isLoading,
    error,
    refetch: fetchAssessments,
  };
}

/**
 * Get element scores from URL search params (for non-authenticated users)
 */
export function useAssessmentFromUrl(): Record<string, number> | null {
  const [scores, setScores] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const elements = ['electric', 'fiery', 'aquatic', 'earthly', 'airy', 'metallic'];

    const urlScores: Record<string, number> = {};
    let hasScores = false;

    elements.forEach((element) => {
      const score = searchParams.get(element);
      if (score) {
        urlScores[element] = parseInt(score);
        hasScores = true;
      }
    });

    setScores(hasScores ? urlScores : null);
  }, []);

  return scores;
}
