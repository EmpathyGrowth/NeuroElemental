import confetti from 'canvas-confetti';

/**
 * Celebration animations for achievements, completions, and milestones
 */

/**
 * Default confetti celebration
 */
export function celebrate() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#A78BFA', '#F472B6', '#38BDF8', '#34D399', '#818CF8'],
  });
}

/**
 * Achievement unlocked celebration
 * Fires from multiple directions
 */
export function celebrateAchievement() {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#A78BFA', '#F472B6', '#38BDF8', '#34D399', '#818CF8', '#FBBF24'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });

  fire(0.2, {
    spread: 60,
  });

  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });

  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

/**
 * Course completion celebration
 * Fires continuous confetti for a few seconds
 */
export function celebrateCourseCompletion() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    colors: ['#A78BFA', '#F472B6', '#38BDF8', '#34D399', '#818CF8'],
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

/**
 * Assessment completion celebration
 * Celebratory burst from center
 */
export function celebrateAssessmentComplete() {
  const count = 200;
  const defaults = {
    origin: { y: 0.5 },
    colors: ['#A78BFA', '#F472B6', '#38BDF8', '#34D399', '#818CF8', '#94A3B8'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Center burst
  fire(0.4, {
    spread: 60,
    startVelocity: 60,
    scalar: 1.2,
  });

  // Wide spread
  fire(0.3, {
    spread: 120,
    decay: 0.91,
  });

  // Slow floaters
  fire(0.3, {
    spread: 180,
    startVelocity: 20,
    decay: 0.95,
    scalar: 0.8,
  });
}

/**
 * Streak milestone celebration
 * Quick burst with streak-themed colors
 */
export function celebrateStreak(streakDays: number) {
  const count = Math.min(streakDays * 5, 150);

  confetti({
    particleCount: count,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#FBBF24', '#F59E0B', '#F472B6', '#A78BFA'],
    startVelocity: 40,
    scalar: 1,
  });
}

/**
 * Level up celebration
 * Upward burst
 */
export function celebrateLevelUp() {
  confetti({
    particleCount: 100,
    spread: 50,
    origin: { y: 0.8 },
    angle: 90,
    startVelocity: 60,
    colors: ['#A78BFA', '#818CF8', '#38BDF8'],
    shapes: ['star'],
    scalar: 1.2,
  });
}

/**
 * Quick success celebration
 * Small burst for micro-achievements
 */
export function celebrateSuccess() {
  confetti({
    particleCount: 30,
    spread: 40,
    origin: { y: 0.65 },
    colors: ['#34D399', '#38BDF8'],
    startVelocity: 30,
    scalar: 0.8,
  });
}

/**
 * Check if user has reduced motion preference
 * Returns true if animations should be disabled
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;

  // Check CSS class
  if (document.documentElement.classList.contains('reduce-motion')) {
    return true;
  }

  // Check system preference
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Wrapper that respects reduced motion preference
 * Only runs celebration if animations are enabled
 */
export function celebrateWithMotionCheck(celebrationFn: () => void) {
  if (!shouldReduceMotion()) {
    celebrationFn();
  }
}
