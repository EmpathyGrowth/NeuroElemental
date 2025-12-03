'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, PartyPopper, Sparkles, Star, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Streak milestone thresholds
 * Requirements: 19.2 - Confetti animation at 7, 14, 30, 100 days
 */
export const STREAK_MILESTONES = [7, 14, 30, 100] as const;
export type StreakMilestone = (typeof STREAK_MILESTONES)[number];

/**
 * Check if a streak count is a milestone
 */
export function isStreakMilestone(streak: number): streak is StreakMilestone {
  return STREAK_MILESTONES.includes(streak as StreakMilestone);
}

/**
 * Get the next milestone for a given streak
 */
export function getNextMilestone(currentStreak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak < milestone) {
      return milestone;
    }
  }
  return null;
}

/**
 * Get milestone message based on streak count
 */
export function getMilestoneMessage(streak: number): string {
  switch (streak) {
    case 7:
      return "🔥 One week streak! You're building a powerful habit!";
    case 14:
      return "⭐ Two weeks strong! Your consistency is inspiring!";
    case 30:
      return "🏆 A full month! You're a true champion of self-awareness!";
    case 100:
      return "👑 100 DAYS! You've achieved legendary status!";
    default:
      return `🎉 Amazing! ${streak} day streak!`;
  }
}

/**
 * Get milestone icon based on streak count
 */
export function getMilestoneIcon(streak: number) {
  switch (streak) {
    case 7:
      return <Flame className="w-8 h-8" />;
    case 14:
      return <Star className="w-8 h-8" />;
    case 30:
      return <Trophy className="w-8 h-8" />;
    case 100:
      return <PartyPopper className="w-8 h-8" />;
    default:
      return <Sparkles className="w-8 h-8" />;
  }
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
}

/**
 * Confetti animation component
 * Requirements: 19.2 - Confetti animation at milestones
 */
function Confetti({ count = 50 }: { count?: number }) {
  const colors = [
    'bg-amber-400',
    'bg-yellow-400',
    'bg-orange-400',
    'bg-red-400',
    'bg-purple-400',
    'bg-pink-400',
    'bg-blue-400',
    'bg-green-400',
  ];

  const pieces: ConfettiPiece[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: piece.delay,
            ease: 'linear',
          }}
          className={cn('absolute rounded-sm', piece.color)}
          style={{
            width: piece.size,
            height: piece.size,
          }}
        />
      ))}
    </div>
  );
}

interface StreakMilestoneCelebrationProps {
  streak: number;
  onComplete?: () => void;
}

/**
 * Full-screen milestone celebration component
 * Requirements: 19.2 - Confetti animation at 7, 14, 30, 100 days
 */
export function StreakMilestoneCelebration({
  streak,
  onComplete,
}: StreakMilestoneCelebrationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        onClick={() => {
          setVisible(false);
          onComplete?.();
        }}
      >
        <Confetti count={streak >= 100 ? 100 : streak >= 30 ? 75 : 50} />

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative z-10 text-center p-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={cn(
              'mx-auto mb-6 w-24 h-24 rounded-full flex items-center justify-center',
              streak >= 100
                ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white'
                : streak >= 30
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                : streak >= 14
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                : 'bg-gradient-to-br from-orange-500 to-red-500 text-white'
            )}
          >
            {getMilestoneIcon(streak)}
          </motion.div>

          {/* Streak count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-6xl font-bold">{streak}</span>
              <span className="text-2xl text-muted-foreground">days</span>
            </div>
          </motion.div>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl font-medium mt-4"
          >
            {getMilestoneMessage(streak)}
          </motion.p>

          {/* Tap to dismiss */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-sm text-muted-foreground mt-8"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Show streak milestone toast
 * Requirements: 19.2
 */
export function showStreakMilestoneToast(streak: number) {
  toast.custom(
    (t) => (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        className={cn(
          'relative overflow-hidden rounded-lg border shadow-lg p-4 min-w-[320px]',
          streak >= 100
            ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30'
            : streak >= 30
            ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30'
            : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30'
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'p-3 rounded-full',
              streak >= 100
                ? 'bg-amber-500/20 text-amber-500'
                : streak >= 30
                ? 'bg-purple-500/20 text-purple-500'
                : 'bg-orange-500/20 text-orange-500'
            )}
          >
            {getMilestoneIcon(streak)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold">{streak}</span>
              <span className="text-sm text-muted-foreground">day streak!</span>
            </div>
            <p className="text-sm">{getMilestoneMessage(streak)}</p>
          </div>
        </div>
      </motion.div>
    ),
    {
      duration: 6000,
      position: 'top-center',
    }
  );
}

/**
 * Hook to check and celebrate streak milestones
 */
export function useStreakMilestone() {
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null);

  const checkMilestone = useCallback((currentStreak: number, previousStreak: number) => {
    // Check if we just hit a milestone
    for (const milestone of STREAK_MILESTONES) {
      if (currentStreak >= milestone && previousStreak < milestone) {
        setCelebratingMilestone(milestone);
        return true;
      }
    }
    return false;
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebratingMilestone(null);
  }, []);

  return {
    celebratingMilestone,
    checkMilestone,
    dismissCelebration,
    isStreakMilestone,
    getNextMilestone,
  };
}
