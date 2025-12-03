'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GraduationCap, Loader2, Shield, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StudentInsightsData {
  totalStudents: number;
  optedInStudents: number;
  checkInsThisWeek: number;
  participationRate: number;
  averageEnergy: number;
  energyTrend: 'up' | 'down' | 'stable';
}

interface InstructorInsightsWidgetProps {
  courseId?: string;
  className?: string;
}

/**
 * Instructor Student Insights Widget
 * Requirements: 17.1, 17.2, 17.3, 17.4
 *
 * Displays aggregate energy patterns of enrolled students
 * Only includes data from students who have opted in
 */
export function InstructorInsightsWidget({
  courseId,
  className,
}: InstructorInsightsWidgetProps) {
  const [data, setData] = useState<StudentInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = courseId
          ? `/api/instructor/student-insights?courseId=${courseId}`
          : '/api/instructor/student-insights';
        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch student insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <Card className={cn('glass-card', className)}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={cn('glass-card', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load student insights
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (data.energyTrend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <TrendingUp className="w-4 h-4 text-muted-foreground rotate-90" />;
    }
  };

  const getTrendLabel = () => {
    switch (data.energyTrend) {
      case 'up':
        return 'Improving';
      case 'down':
        return 'Declining';
      default:
        return 'Stable';
    }
  };

  return (
    <Card className={cn('glass-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Student Energy Insights
        </CardTitle>
        <CardDescription>
          {courseId
            ? 'Energy patterns for enrolled students in this course'
            : 'Energy patterns across all your students'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Students Sharing</span>
            </div>
            <div className="text-2xl font-bold">
              {data.optedInStudents}
              <span className="text-sm font-normal text-muted-foreground">
                /{data.totalStudents}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Check-ins This Week</span>
            </div>
            <div className="text-2xl font-bold">{data.checkInsThisWeek}</div>
            <div className="text-xs text-muted-foreground">
              {data.participationRate}% participation
            </div>
          </div>
        </div>

        {/* Average Energy with Trend */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Average Student Energy
              </div>
              <div className="text-3xl font-bold">
                {data.averageEnergy.toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground">/5</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <Badge
                variant="outline"
                className={cn(
                  data.energyTrend === 'up' && 'border-green-500/50 text-green-600',
                  data.energyTrend === 'down' && 'border-red-500/50 text-red-600'
                )}
              >
                {getTrendLabel()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Teaching Tips based on energy */}
        {data.averageEnergy < 3 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Tip:
              </span>{' '}
              Student energy is lower than usual. Consider incorporating more breaks
              or interactive activities in your next session.
            </p>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>Only aggregate data from opted-in students is shown</span>
        </div>
      </CardContent>
    </Card>
  );
}
