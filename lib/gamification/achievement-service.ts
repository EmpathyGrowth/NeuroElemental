import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { TOOL_ACHIEVEMENTS } from "@/lib/constants/achievements";

/**
 * Server-side notification helper
 * Directly inserts into the notifications table
 */
async function sendServerNotification(notification: {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  read: boolean;
}) {
  const supabase = getSupabaseServer();
  const { error } = await (supabase as any)
    .from('notifications')
    .insert(notification);
  
  if (error) {
    logger.error('Error sending notification:', error as Error);
  }
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url: string | null;
  points: number;
  criteria: {
    type: string;
    value?: number;
    elements?: string[];
    is_special?: boolean;
  };
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

/**
 * Result of an achievement check
 */
export interface AchievementCheckResult {
  unlocked: boolean;
  achievement?: Achievement;
  isNew: boolean;
}

/**
 * Check and unlock achievement if criteria met
 */
async function checkAndUnlockAchievement(
  userId: string,
  achievementId: string,
  currentValue: number
): Promise<boolean> {
  const supabase = getSupabaseServer();

  try {
    // Check if already unlocked
    const { data: existing } = await (supabase as any)
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", achievementId)
      .single() as { data: { id: string } | null };

    if (existing) {
      return false; // Already unlocked
    }

    // Get achievement details
    const { data: achievement } = await (supabase as any)
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single() as { data: Achievement | null };

    if (!achievement) {
      return false;
    }

    // Check if requirement met
    const criteriaValue =
      typeof achievement.criteria === "object" && achievement.criteria !== null
        ? (achievement.criteria as any).value || 0
        : 0;

    if (currentValue >= criteriaValue) {
      // Unlock achievement
      const { error } = await (supabase as any).from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievementId,
      }) as { error: Error | null };

      if (error) {
        logger.error("Error unlocking achievement:", error as Error);
        return false;
      }

      // Send notification
      await sendServerNotification({
        user_id: userId,
        title: "🏆 Achievement Unlocked!",
        message: `You earned "${achievement.name}" (+${achievement.points} points)`,
        type: "success",
        action_url: "/dashboard/student/achievements",
        read: false,
      });

      logger.info(
        `Achievement unlocked: ${achievement.name} for user ${userId}`
      );
      return true;
    }

    return false;
  } catch (error) {
    logger.error("Error checking achievement:", error as Error);
    return false;
  }
}

/**
 * Check lesson completion achievements
 */
export async function checkLessonAchievements(userId: string): Promise<void> {
  const supabase = getSupabaseServer();

  // Get total completed lessons
  const { data: completions } = await (supabase as any)
    .from("lesson_completions")
    .select("id")
    .eq("user_id", userId) as { data: { id: string }[] | null };

  const completedCount = completions?.length || 0;

  // Check achievements
  await checkAndUnlockAchievement(userId, "first-steps", completedCount); // 1 lesson
  await checkAndUnlockAchievement(userId, "quick-learner", completedCount); // 5 lessons
  await checkAndUnlockAchievement(userId, "dedicated-student", completedCount); // 25 lessons
}

/**
 * Check course completion achievements
 */
export async function checkCourseAchievements(userId: string): Promise<void> {
  const supabase = getSupabaseServer();

  // Get completed courses (enrollments with 100% progress)
  const { data: completedCourses } = await (supabase as any)
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("progress_percentage", 100) as { data: { id: string }[] | null };

  const count = completedCourses?.length || 0;

  await checkAndUnlockAchievement(userId, "course-graduate", count); // 1 course
  await checkAndUnlockAchievement(userId, "multi-talented", count); // 3 courses
  await checkAndUnlockAchievement(userId, "knowledge-seeker", count); // 10 courses
}

/**
 * Check quiz achievements
 */
export async function checkQuizAchievements(userId: string): Promise<void> {
  const supabase = getSupabaseServer();

  // Get passed quizzes (score >= passing_score)
  const { data: quizzes } = await (supabase as any)
    .from("quiz_attempts")
    .select("id, score, quiz:quizzes(passing_score)")
    .eq("user_id", userId) as { data: { id: string; score: number; quiz: { passing_score: number } | null }[] | null };

  if (!quizzes) return;

  const passedCount = quizzes.filter(
    (q: any) => q.score >= (q.quiz?.passing_score || 70)
  ).length;

  await checkAndUnlockAchievement(userId, "quiz-master", passedCount); // 20 quizzes
}

/**
 * Check assessment achievement
 */
export async function checkAssessmentAchievement(
  userId: string
): Promise<void> {
  const supabase = getSupabaseServer();

  // Check if user has completed assessment
  const { data: assessments } = await (supabase as any)
    .from("assessment_results")
    .select("id")
    .eq("user_id", userId)
    .limit(1) as { data: { id: string }[] | null };

  if (assessments && assessments.length > 0) {
    await checkAndUnlockAchievement(userId, "element-explorer", 1);
  }
}

/**
 * Check community achievements
 */
export async function checkCommunityAchievements(
  userId: string
): Promise<void> {
  const supabase = getSupabaseServer();

  // Get review count
  const { data: reviews } = await (supabase as any)
    .from("course_reviews")
    .select("id")
    .eq("user_id", userId) as { data: { id: string }[] | null };

  const reviewCount = reviews?.length || 0;

  await checkAndUnlockAchievement(userId, "community-member", reviewCount); // 1 review
  await checkAndUnlockAchievement(userId, "helpful-reviewer", reviewCount); // 10 reviews
}

/**
 * Check all achievements for a user
 * Call this periodically or after significant user actions
 */
export async function checkAllAchievements(userId: string): Promise<void> {
  await Promise.allSettled([
    checkLessonAchievements(userId),
    checkCourseAchievements(userId),
    checkQuizAchievements(userId),
    checkAssessmentAchievement(userId),
    checkCommunityAchievements(userId),
    checkToolAchievements(userId),
  ]);
}

// ============================================
// TOOL ACHIEVEMENT FUNCTIONS
// Requirements: 18.1, 18.2, 18.3, 18.4
// ============================================

/**
 * Check and unlock achievement by criteria type
 * Looks up achievement in database by criteria type
 */
async function checkAndUnlockByType(
  userId: string,
  criteriaType: string,
  currentValue: number,
  completedElements?: string[]
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();
  const results: AchievementCheckResult[] = [];

  try {
    // Get all achievements with this criteria type
    const { data: achievements } = await (supabase as any)
      .from("achievements")
      .select("*")
      .eq("is_active", true) as { data: Achievement[] | null };

    if (!achievements) return results;

    // Filter achievements by criteria type
    const matchingAchievements = achievements.filter((a: Achievement) => {
      const criteria = a.criteria as { type?: string };
      return criteria?.type === criteriaType;
    });

    for (const achievement of matchingAchievements) {
      // Check if already unlocked
      const { data: existing } = await (supabase as any)
        .from("user_achievements")
        .select("id")
        .eq("user_id", userId)
        .eq("achievement_id", achievement.id)
        .single() as { data: { id: string } | null };

      if (existing) {
        results.push({ unlocked: true, achievement, isNew: false });
        continue;
      }

      // Check criteria
      const criteria = achievement.criteria as {
        type: string;
        value?: number;
        elements?: string[];
      };
      let meetsRequirement = false;

      if (criteriaType === "shadow_elements_completed" && criteria.elements && completedElements) {
        // For shadow master, check if all elements are completed
        meetsRequirement = criteria.elements.every((el) =>
          completedElements.includes(el)
        );
      } else {
        // For other achievements, compare value
        meetsRequirement = currentValue >= (criteria.value || 0);
      }

      if (meetsRequirement) {
        // Unlock achievement
        const { error } = await (supabase as any).from("user_achievements").insert({
          user_id: userId,
          achievement_id: achievement.id,
        }) as { error: Error | null };

        if (error) {
          logger.error("Error unlocking achievement:", error as Error);
          continue;
        }

        // Get celebration message from constants
        const achievementDef = TOOL_ACHIEVEMENTS.find(
          (a) => a.name === achievement.name
        );
        const celebrationMessage =
          achievementDef?.celebration_message ||
          `You earned "${achievement.name}"!`;

        // Send notification
        await sendServerNotification({
          user_id: userId,
          title: "🏆 Achievement Unlocked!",
          message: `${celebrationMessage} (+${achievement.points} points)`,
          type: "success",
          action_url: "/dashboard/student/achievements",
          read: false,
        });

        logger.info(
          `Achievement unlocked: ${achievement.name} for user ${userId}`
        );
        results.push({ unlocked: true, achievement, isNew: true });
      } else {
        results.push({ unlocked: false, achievement, isNew: false });
      }
    }

    return results;
  } catch (error) {
    logger.error("Error checking achievements by type:", error as Error);
    return results;
  }
}

/**
 * Check check-in related achievements
 * Requirements: 18.1 (First Reflection)
 */
export async function checkCheckInAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();

  // Get total check-ins from logs
  const { data: checkIns } = await (supabase as any)
    .from("logs")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "check_in") as { data: { id: string }[] | null };

  const checkInCount = checkIns?.length || 0;

  // Check first check-in achievement
  return checkAndUnlockByType(userId, "first_checkin", checkInCount);
}

/**
 * Check streak-related achievements
 * Requirements: 18.2 (Week of Awareness), 18.3 (Month of Mindfulness)
 */
export async function checkStreakAchievements(
  userId: string,
  currentStreak: number
): Promise<AchievementCheckResult[]> {
  return checkAndUnlockByType(userId, "checkin_streak", currentStreak);
}

/**
 * Check shadow work achievements
 * Requirements: 18.4 (Shadow Master)
 */
export async function checkShadowWorkAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();

  // Get completed shadow sessions by element
  const { data: sessions } = await (supabase as any)
    .from("shadow_sessions")
    .select("element")
    .eq("user_id", userId)
    .eq("status", "completed") as { data: { element: string }[] | null };

  if (!sessions) return [];

  // Get unique completed elements
  const completedElements = [...new Set(sessions.map((s) => s.element))];

  return checkAndUnlockByType(
    userId,
    "shadow_elements_completed",
    completedElements.length,
    completedElements
  );
}

/**
 * Check energy budget achievements
 */
export async function checkEnergyBudgetAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();

  const { data: budgets } = await (supabase as any)
    .from("energy_budgets")
    .select("id")
    .eq("user_id", userId) as { data: { id: string }[] | null };

  const budgetCount = budgets?.length || 0;

  return checkAndUnlockByType(userId, "energy_budgets_created", budgetCount);
}

/**
 * Check state tracker achievements
 */
export async function checkStateTrackerAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();

  const { data: logs } = await (supabase as any)
    .from("logs")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "state_log") as { data: { id: string }[] | null };

  const logCount = logs?.length || 0;

  return checkAndUnlockByType(userId, "state_logs", logCount);
}

/**
 * Check strategy rating achievements
 */
export async function checkStrategyRatingAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();

  const { data: ratings } = await (supabase as any)
    .from("strategy_ratings")
    .select("id")
    .eq("user_id", userId) as { data: { id: string }[] | null };

  const ratingCount = ratings?.length || 0;

  return checkAndUnlockByType(userId, "strategy_ratings", ratingCount);
}

/**
 * Check quick quiz achievements
 */
export async function checkQuickQuizAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();

  const { data: quizzes } = await (supabase as any)
    .from("quick_quiz_results")
    .select("id")
    .eq("user_id", userId) as { data: { id: string }[] | null };

  const quizCount = quizzes?.length || 0;

  return checkAndUnlockByType(userId, "quiz_completions", quizCount);
}

/**
 * Check protection mode exit achievements
 */
export async function checkProtectionModeExitAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const supabase = getSupabaseServer();

  // Count transitions from protection mode to other modes
  const { data: logs } = await (supabase as any)
    .from("logs")
    .select("data")
    .eq("user_id", userId)
    .eq("type", "check_in")
    .order("created_at", { ascending: true }) as { data: { data: any }[] | null };

  if (!logs || logs.length < 2) return [];

  let exitCount = 0;
  let wasInProtection = false;

  for (const log of logs) {
    const data = log.data as { state?: string } | null;
    const currentState = data?.state;

    if (wasInProtection && currentState && currentState !== "protection") {
      exitCount++;
    }
    wasInProtection = currentState === "protection";
  }

  return checkAndUnlockByType(userId, "protection_mode_exits", exitCount);
}

/**
 * Check all tool-related achievements
 * Call this after any tool interaction
 */
export async function checkToolAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  const results = await Promise.all([
    checkCheckInAchievements(userId),
    checkEnergyBudgetAchievements(userId),
    checkStateTrackerAchievements(userId),
    checkStrategyRatingAchievements(userId),
    checkQuickQuizAchievements(userId),
    checkShadowWorkAchievements(userId),
    checkProtectionModeExitAchievements(userId),
  ]);

  return results.flat();
}

/**
 * Check achievements after a specific tool action
 * More efficient than checking all achievements
 */
export async function checkAchievementsForAction(
  userId: string,
  action:
    | "check_in"
    | "energy_budget"
    | "state_log"
    | "strategy_rating"
    | "quick_quiz"
    | "shadow_work"
    | "protection_exit",
  additionalData?: { streak?: number }
): Promise<AchievementCheckResult[]> {
  switch (action) {
    case "check_in":
      const checkInResults = await checkCheckInAchievements(userId);
      if (additionalData?.streak) {
        const streakResults = await checkStreakAchievements(
          userId,
          additionalData.streak
        );
        return [...checkInResults, ...streakResults];
      }
      return checkInResults;

    case "energy_budget":
      return checkEnergyBudgetAchievements(userId);

    case "state_log":
      return checkStateTrackerAchievements(userId);

    case "strategy_rating":
      return checkStrategyRatingAchievements(userId);

    case "quick_quiz":
      return checkQuickQuizAchievements(userId);

    case "shadow_work":
      return checkShadowWorkAchievements(userId);

    case "protection_exit":
      return checkProtectionModeExitAchievements(userId);

    default:
      return [];
  }
}

/**
 * Get user's achievement progress
 */
export async function getUserAchievementProgress(userId: string) {
  const supabase = getSupabaseServer();

  // Get all achievements with unlock status
  const { data: achievements } = await (supabase as any)
    .from("achievements")
    .select(
      `
      *,
      user_achievements!left(
        unlocked_at
      )
    `
    )
    .eq("user_achievements.user_id", userId)
    .order("points", { ascending: false }) as { data: any[] | null };

  if (!achievements)
    return { achievements: [], totalPoints: 0, earnedPoints: 0 };

  const achievementsWithStatus = achievements.map((a: any) => ({
    ...a,
    unlocked: !!a.user_achievements?.[0]?.unlocked_at,
    unlocked_at: a.user_achievements?.[0]?.unlocked_at || null,
  }));

  const earnedPoints = achievementsWithStatus
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const totalPoints = achievements.reduce(
    (sum: number, a: any) => sum + a.points,
    0
  );

  return {
    achievements: achievementsWithStatus,
    totalPoints,
    earnedPoints,
  };
}
