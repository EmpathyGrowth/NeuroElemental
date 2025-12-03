'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logging';
import { cn } from '@/lib/utils';
import { Calendar, Flame, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_history?: { date: string; activity_count: number }[];
}

interface StreakDisplayProps {
  className?: string;
  variant?: 'card' | 'compact' | 'inline';
}

/**
 * Display user's learning streak with visual indicators
 */
export function StreakDisplay({ className, variant = 'card' }: StreakDisplayProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/users/me/streak');
        if (response.ok) {
          const data = await response.json();
          setStreak(data.streak || data); // Handle both response formats
        }
      } catch (error) {
        logger.error('Error fetching streak:', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (loading) {
    if (variant === 'inline') {
      return (
        <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
          <Flame className="w-4 h-4 animate-pulse" />
          <span className="text-sm">Loading...</span>
        </div>
      );
    }

    return (
      <Card className={cn('glass-card', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flame className="w-5 h-5 animate-pulse" />
            Learning Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-16 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading streak...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!streak) {
    return null;
  }

  const currentStreak = streak.current_streak || 0;
  const longestStreak = streak.longest_streak || 0;
  const isOnStreak = currentStreak > 0;
  // Requirements 9.2: Show prominently when streak >= 3
  const isProminentStreak = currentStreak >= 3;

  // Inline variant for compact display
  // Requirements 9.2: Show flame icon prominently when streak >= 3
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
          isProminentStreak
            ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-500'
            : isOnStreak
            ? 'bg-muted/50 text-muted-foreground'
            : 'bg-muted text-muted-foreground'
        )}>
          <Flame className={cn('w-4 h-4', isProminentStreak && 'animate-pulse')} />
          <span className={cn('text-sm', isProminentStreak ? 'font-bold' : 'font-semibold')}>{currentStreak}</span>
          <span className="text-xs">day{currentStreak !== 1 && 's'}</span>
        </div>
      </div>
    );
  }

  // Compact variant for smaller cards
  // Requirements 9.2: Show flame icon prominently when streak >= 3
  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center justify-between p-4 rounded-lg border',
        isProminentStreak
          ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20'
          : isOnStreak
          ? 'bg-muted/50 border-border'
          : 'bg-muted border-border',
        className
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2.5 rounded-full',
            isProminentStreak
              ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
              : isOnStreak
              ? 'bg-muted-foreground/30 text-muted-foreground'
              : 'bg-muted-foreground/20 text-muted-foreground'
          )}>
            <Flame className={cn('w-5 h-5', isProminentStreak && 'animate-pulse')} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={cn('text-2xl', isProminentStreak ? 'font-bold' : 'font-semibold')}>{currentStreak}</span>
              <span className="text-sm text-muted-foreground">day{currentStreak !== 1 && 's'}</span>
            </div>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </div>
        </div>
        {longestStreak > currentStreak && (
          <div className="text-right">
            <p className="text-sm font-medium">{longestStreak} days</p>
            <p className="text-xs text-muted-foreground">Personal best</p>
          </div>
        )}
      </div>
    );
  }

  // Full card variant
  // Requirements 9.2: Show flame icon prominently when streak >= 3
  return (
    <Card className={cn('glass-card', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className={cn('w-5 h-5', isProminentStreak && 'text-orange-500 animate-pulse')} />
          Learning Streak
        </CardTitle>
        <CardDescription>
          {isProminentStreak
            ? 'Amazing! Keep it up to maintain your streak.'
            : isOnStreak
            ? 'Keep it up! Complete a lesson today to maintain your streak.'
            : 'Start learning today to begin a streak.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Streak */}
          <div className={cn(
            'p-6 rounded-lg flex flex-col items-center justify-center',
            isProminentStreak
              ? 'bg-gradient-to-br from-orange-500/10 to-red-500/10'
              : isOnStreak
              ? 'bg-muted/50'
              : 'bg-muted'
          )}>
            <div className={cn(
              'mb-2 p-3 rounded-full',
              isProminentStreak
                ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
                : isOnStreak
                ? 'bg-muted-foreground/30 text-muted-foreground'
                : 'bg-muted-foreground/20 text-muted-foreground'
            )}>
              <Flame className={cn('w-8 h-8', isProminentStreak && 'animate-pulse')} />
            </div>
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className={cn('text-4xl', isProminentStreak ? 'font-bold' : 'font-semibold')}>{currentStreak}</span>
                <span className="text-lg text-muted-foreground">day{currentStreak !== 1 && 's'}</span>
              </div>
              <p className="text-sm text-muted-foreground">Current streak</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xl font-bold">{longestStreak}</span>
              </div>
              <p className="text-xs text-muted-foreground">Longest streak</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xl font-bold">
                  {streak.last_activity_date
                    ? new Date(streak.last_activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'Never'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Last active</p>
            </div>
          </div>

          {/* Streak motivation */}
          {isOnStreak && currentStreak >= 7 && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-center font-medium">
                {currentStreak >= 30
                  ? '🏆 Amazing! You\'re on fire! Keep this momentum going!'
                  : currentStreak >= 14
                  ? '⭐ Two weeks strong! You\'re building a solid habit!'
                  : '🔥 One week streak! You\'re on the right track!'}
              </p>
            </div>
          )}

          {/* Streak warning */}
          {isOnStreak && streak.last_activity_date && (
            (() => {
              const lastActivity = new Date(streak.last_activity_date);
              const now = new Date();
              const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

              if (hoursSinceActivity > 12 && hoursSinceActivity < 24) {
                return (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-sm text-center font-medium text-amber-600 dark:text-amber-400">
                      ⏰ Complete a lesson today to keep your {currentStreak}-day streak alive!
                    </p>
                  </div>
                );
              }
              return null;
            })()
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple streak badge for display in headers or nav
 * Requirements 9.2: Show flame icon prominently when streak >= 3
 */
export function StreakBadge({ className }: { className?: string }) {
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/users/me/streak');
        if (response.ok) {
          const data = await response.json();
          const streakData = data.streak || data; // Handle both response formats
          setCurrentStreak(streakData.current_streak || 0);
        }
      } catch (error) {
        logger.error('Error fetching streak for badge:', error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, []);

  // Don't show badge if loading or no streak
  if (loading || currentStreak === 0) {
    return null;
  }

  // Requirements 9.2: Show prominently when streak >= 3
  const isProminentStreak = currentStreak >= 3;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border',
        isProminentStreak
          ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20'
          : 'bg-muted/50 border-border',
        className
      )}
      title={`${currentStreak} day learning streak`}
    >
      <Flame className={cn(
        'w-3.5 h-3.5',
        isProminentStreak ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'
      )} />
      <span className={cn(
        'text-xs font-semibold',
        isProminentStreak ? 'text-orange-500' : 'text-muted-foreground'
      )}>{currentStreak}</span>
    </div>
  );
}
