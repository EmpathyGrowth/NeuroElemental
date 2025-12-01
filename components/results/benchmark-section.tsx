'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, TrendingUp, Trophy, Users } from 'lucide-react';
import { logger } from '@/lib/logging';
import { ELEMENT_DEFINITIONS, type ElementType } from '@/lib/content/assessment-questions';
import { cn } from '@/lib/utils';

interface ElementPercentile {
  element: ElementType;
  score: number;
  percentile: number;
  isAboveAverage: boolean;
  isTopQuartile: boolean;
  isTopDecile: boolean;
}

interface AssessmentBenchmark {
  percentiles: ElementPercentile[];
  totalAssessments: number;
  avgElementScore: Record<ElementType, number>;
  blendRarity: number;
}

function getPercentileDescription(percentile: number): string {
  if (percentile >= 99) return 'Top 1%';
  if (percentile >= 95) return 'Top 5%';
  if (percentile >= 90) return 'Top 10%';
  if (percentile >= 75) return 'Top 25%';
  if (percentile >= 50) return 'Above Average';
  if (percentile >= 25) return 'Average';
  return 'Below Average';
}

function getPercentileColor(percentile: number): string {
  if (percentile >= 90) return 'text-purple-500';
  if (percentile >= 75) return 'text-blue-500';
  if (percentile >= 50) return 'text-green-500';
  if (percentile >= 25) return 'text-amber-500';
  return 'text-gray-500';
}

interface BenchmarkSectionProps {
  scores: Record<ElementType, number>;
}

/**
 * Display assessment benchmarks showing how user compares to others
 */
export function BenchmarkSection({ scores }: BenchmarkSectionProps) {
  const [benchmarks, setBenchmarks] = useState<AssessmentBenchmark | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBenchmarks = async () => {
      try {
        const params = new URLSearchParams();
        Object.entries(scores).forEach(([element, score]) => {
          params.append(element, score.toString());
        });

        const response = await fetch(`/api/assessment/benchmarks?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setBenchmarks(data);
        }
      } catch (error) {
        logger.error('Error fetching benchmarks:', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmarks();
  }, [scores]);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            How You Compare
          </CardTitle>
          <CardDescription>Loading benchmarks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!benchmarks || benchmarks.totalAssessments === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Be a Pioneer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You're among the first to take this assessment! As more people complete it, you'll be able to see how your element mix compares.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort percentiles by score (highest first) to show strengths
  const sortedPercentiles = [...benchmarks.percentiles].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            How You Compare
          </CardTitle>
          <CardDescription>
            Based on {benchmarks.totalAssessments.toLocaleString()} completed assessments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedPercentiles.map((p) => {
            const element = ELEMENT_DEFINITIONS[p.element];
            return (
              <div key={p.element} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{element.emoji}</span>
                    <div>
                      <div className="font-semibold">{element.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Score: {p.score} / 100
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-xl font-bold', getPercentileColor(p.percentile))}>
                      {p.percentile}th
                    </div>
                    <div className="text-xs text-muted-foreground">
                      percentile
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Progress value={p.percentile} className="h-2" />
                  <div className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-destructive" style={{ left: '50%' }} />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {getPercentileDescription(p.percentile)}
                  </Badge>
                  {p.isTopDecile && (
                    <Badge className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/20">
                      <Trophy className="w-3 h-3 mr-1" />
                      Top 10%
                    </Badge>
                  )}
                  {!p.isTopDecile && p.isTopQuartile && (
                    <Badge className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Top 25%
                    </Badge>
                  )}
                  {!p.isAboveAverage && p.percentile < 50 && (
                    <span className="text-xs text-muted-foreground">
                      Below average ({benchmarks.avgElementScore[p.element].toFixed(0)} avg)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Blend Rarity */}
      {benchmarks.blendRarity > 70 && (
        <Card className="glass-card border-purple-500/20 bg-purple-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Trophy className="w-5 h-5" />
              Unique Blend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Your elemental combination is <span className="font-semibold">quite rare</span> – only {100 - benchmarks.blendRarity}% of people share a similar dominant element profile. This makes your perspective particularly valuable in diverse teams and communities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
