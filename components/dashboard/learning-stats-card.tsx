'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, Calendar, Target } from 'lucide-react';
import { logger } from '@/lib/logging';

interface LearningStats {
  totalTimeHours: number;
  thisWeekHours: number;
  thisMonthHours: number;
  averageSessionMinutes: number;
  totalLessons: number;
}

/**
 * Display user's learning time statistics
 */
export function LearningStatsCard() {
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/learning-stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        logger.error('Error fetching learning stats:', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Learning Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalTimeHours === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Learning Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start learning to track your time investment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Learning Time
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Time */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalTimeHours}h</div>
              <p className="text-xs text-muted-foreground">Total learning time</p>
            </div>
          </div>
        </div>

        {/* This Week */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-sm">This week</span>
          </div>
          <span className="font-semibold">{stats.thisWeekHours}h</span>
        </div>

        {/* This Month */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm">This month</span>
          </div>
          <span className="font-semibold">{stats.thisMonthHours}h</span>
        </div>

        {/* Average Session */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-500" />
            <span className="text-sm">Avg. session</span>
          </div>
          <span className="font-semibold">{stats.averageSessionMinutes}min</span>
        </div>

        {/* Motivation message */}
        {stats.thisWeekHours >= 5 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-center font-medium text-green-600 dark:text-green-400">
              🎯 Great consistency! You're building a strong learning habit.
            </p>
          </div>
        )}

        {stats.thisWeekHours < 1 && stats.totalTimeHours > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-center font-medium text-amber-600 dark:text-amber-400">
              💪 Let's get back on track! Even 15 minutes makes a difference.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
