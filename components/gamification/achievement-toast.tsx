'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, PartyPopper, Sparkles, Star, Trophy, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Achievement data structure for toast display
 */
export interface AchievementToastData {
  id: string;
  name: string;
  description: string;
  points: number;
  icon?: string;
  badge_color?: string;
  celebration_message?: string;
  is_special?: boolean;
}

interface AchievementToastProps {
  achievement: AchievementToastData;
  onDismiss?: () => void;
}

/**
 * Achievement Toast Component
 * Displays a celebratory toast when an achievement is unlocked
 * Requirements: 18.5
 */
export function AchievementToast({ achievement, onDismiss }: AchievementToastProps) {
  const [showConfetti, setShowConfetti] = useState(achievement.is_special);

  useEffect(() => {
    // Auto-dismiss confetti after animation
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const getIcon = () => {
    // Map emoji icons to Lucide icons
    switch (achievement.icon) {
      case '🪞':
        return <Sparkles className="w-6 h-6" />;
      case '🔥':
        return <Star className="w-6 h-6" />;
      case '🧘':
        return <Award className="w-6 h-6" />;
      case '🌑':
        return <Trophy className="w-6 h-6" />;
      case '💯':
        return <PartyPopper className="w-6 h-6" />;
      default:
        return <Trophy className="w-6 h-6" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={cn(
        'relative overflow-hidden rounded-lg border shadow-lg p-4 min-w-[320px] max-w-[400px]',
        achievement.is_special
          ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 border-amber-500/30'
          : 'bg-background border-border'
      )}
    >
      {/* Confetti effect for special achievements */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
                className={cn(
                  'absolute w-2 h-2 rounded-full',
                  ['bg-amber-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-purple-400'][
                    Math.floor(Math.random() * 5)
                  ]
                )}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className={cn(
            'flex-shrink-0 p-3 rounded-full',
            achievement.badge_color || 'bg-primary/10 text-primary',
            achievement.is_special && 'ring-2 ring-amber-400/50 ring-offset-2 ring-offset-background'
          )}
        >
          {getIcon()}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-medium text-muted-foreground">Achievement Unlocked!</span>
            </div>
            <h4 className="font-bold text-lg leading-tight">{achievement.name}</h4>
            <p className="text-sm text-muted-foreground mt-0.5">{achievement.description}</p>
          </motion.div>

          {/* Points badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 flex items-center gap-2"
          >
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
              achievement.is_special
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-primary/10 text-primary'
            )}>
              <Star className="w-3 h-3" />
              +{achievement.points} points
            </span>
            {achievement.is_special && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-3 h-3" />
                Special
              </span>
            )}
          </motion.div>

          {/* Celebration message */}
          {achievement.celebration_message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-2 text-sm italic text-muted-foreground"
            >
              {achievement.celebration_message}
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Show achievement toast using sonner
 * Requirements: 18.5
 */
export function showAchievementToast(achievement: AchievementToastData) {
  toast.custom(
    (t) => (
      <AchievementToast
        achievement={achievement}
        onDismiss={() => toast.dismiss(t)}
      />
    ),
    {
      duration: achievement.is_special ? 8000 : 5000,
      position: 'bottom-right',
    }
  );
}

/**
 * Hook to listen for achievement unlocks and show toasts
 */
export function useAchievementToasts() {
  const showToast = useCallback((achievement: AchievementToastData) => {
    showAchievementToast(achievement);
  }, []);

  return { showAchievementToast: showToast };
}
