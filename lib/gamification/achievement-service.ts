import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { notificationManager } from "@/lib/notifications";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url: string | null;
  points: number;
  criteria: {
    type: string;
    value: number;
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
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", achievementId)
      .single();

    if (existing) {
      return false; // Already unlocked
    }

    // Get achievement details
    const { data: achievement } = await supabase
      .from("achievements")
      .select("*")
      .eq("id", achievementId)
      .single();

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
      const { error } = await supabase.from("user_achievements").insert({
        user_id: userId,
        achievement_id: achievementId,
      });

      if (error) {
        logger.error("Error unlocking achievement:", error as Error);
        return false;
      }

      // Send notification
      await notificationManager.sendNotification({
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
  const { data: completions } = await supabase
    .from("lesson_completions")
    .select("id")
    .eq("user_id", userId);

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
  const { data: completedCourses } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("progress_percentage", 100);

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
  const { data: quizzes } = await supabase
    .from("quiz_attempts")
    .select("id, score, quiz:quizzes(passing_score)")
    .eq("user_id", userId);

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
  const { data: assessments } = await supabase
    .from("assessment_results")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

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
  const { data: reviews } = await supabase
    .from("course_reviews")
    .select("id")
    .eq("user_id", userId);

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
  ]);
}

/**
 * Get user's achievement progress
 */
export async function getUserAchievementProgress(userId: string) {
  const supabase = getSupabaseServer();

  // Get all achievements with unlock status
  const { data: achievements } = await supabase
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
    .order("points", { ascending: false });

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
