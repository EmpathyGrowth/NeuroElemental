'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Flame, Heart, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface StreakLossProps {
  lostStreak: number;
  longestStreak: number;
  onStartNew?: () => void;
  className?: string;
}

/**
 * Get encouraging message based on lost streak
 * Requirements: 19.4 - Display encouraging message when streak is lost
 */
function getEncouragingMessage(lostStreak: number): string {
  if (lostStreak >= 100) {
    return "100+ days is legendary! That's an incredible achievement. Every master has setbacks - your next streak will be even stronger.";
  }
  if (lostStreak >= 30) {
    return "A month-long streak shows real dedication! Life happens, but your commitment to self-awareness is still there. Ready to start again?";
  }
  if (lostStreak >= 14) {
    return "Two weeks of consistency is something to be proud of! Take a breath, and when you're ready, let's build an even longer streak.";
  }
  if (lostStreak >= 7) {
    return "A week of daily check-ins is a great foundation! Don't be discouraged - every streak starts with day one.";
  }
  if (lostStreak >= 3) {
    return "You were building momentum! A few days of consistency is still progress. Ready to try again?";
  }
  return "Every journey begins with a single step. Your next streak starts now!";
}

/**
 * Streak Loss Card Component
 * Requirements: 19.4 - Display encouraging message and longest streak record
 */
export function StreakLossCard({
  lostStreak,
  longestStreak,
  onStartNew,
  className,
}: StreakLossProps) {
  const message = getEncouragingMessage(lostStreak);

  return (
    <Card className={cn('glass-card border-muted', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-muted">
            <Flame className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg">Streak Ended</CardTitle>
            <CardDescription>But your journey continues</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lost streak info */}
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground mb-1">Previous streak</p>
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-2xl font-bold">{lostStreak}</span>
            <span className="text-muted-foreground">day{lostStreak !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Longest streak record */}
        {longestStreak > 0 && (
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Personal Best</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{longestStreak}</span>
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
        )}

        {/* Encouraging message */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <div className="flex gap-3">
            <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm">{message}</p>
          </div>
        </div>

        {/* Start new streak button */}
        {onStartNew && (
          <Button onClick={onStartNew} className="w-full" variant="default">
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Streak
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline streak loss message
 * Requirements: 19.4
 */
export function StreakLossMessage({
  lostStreak,
  longestStreak,
  className,
}: Omit<StreakLossProps, 'onStartNew'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border',
        className
      )}
    >
      <div className="p-2 rounded-full bg-muted">
        <Flame className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          Your {lostStreak}-day streak ended
        </p>
        <p className="text-xs text-muted-foreground">
          {longestStreak > lostStreak
            ? `Personal best: ${longestStreak} days`
            : "Start a new streak today!"}
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Show streak loss toast notification
 * Requirements: 19.4
 */
export function showStreakLossToast(lostStreak: number, longestStreak: number) {
  const message = getEncouragingMessage(lostStreak);

  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className="relative overflow-hidden rounded-lg border border-border shadow-lg p-4 min-w-[320px] max-w-[400px] bg-background"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-full bg-muted">
            <Flame className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">Streak Ended</span>
              <span className="text-sm text-muted-foreground">
                ({lostStreak} day{lostStreak !== 1 ? 's' : ''})
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{message}</p>
            {longestStreak > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span>Personal best: {longestStreak} days</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 6000,
      position: 'bottom-right',
    }
  );
}

/**
 * Hook to handle streak loss detection and display
 */
export function useStreakLoss() {
  const handleStreakLoss = (lostStreak: number, longestStreak: number) => {
    showStreakLossToast(lostStreak, longestStreak);
  };

  return {
    handleStreakLoss,
    showStreakLossToast,
    getEncouragingMessage,
  };
}
