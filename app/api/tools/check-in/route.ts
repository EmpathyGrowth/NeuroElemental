import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { logsRepository, type CheckInLog } from "@/lib/db/logs";
import { learningStreaksRepository } from "@/lib/db/learning-streaks";
import { z } from "zod";

const checkInSchema = z.object({
  element: z.string().min(1),
  energy_level: z.number().int().min(1).max(5),
  current_state: z.enum(["biological", "societal", "passion", "protection"]),
  reflection: z.string().optional(),
  gratitude: z.string().optional(),
  intention: z.string().optional(),
});

/**
 * Check-in statistics interface
 */
interface CheckInStats {
  totalCheckIns: number;
  averageEnergyLevel: number;
  modeDistribution: Record<string, number>;
  currentStreak: number;
}

/**
 * Calculate statistics from check-in history
 */
function calculateCheckInStats(checkIns: CheckInLog[]): CheckInStats {
  if (checkIns.length === 0) {
    return {
      totalCheckIns: 0,
      averageEnergyLevel: 0,
      modeDistribution: {},
      currentStreak: 0,
    };
  }

  // Calculate average energy level
  const totalEnergy = checkIns.reduce((sum, c) => sum + c.energy_level, 0);
  const averageEnergyLevel = Math.round((totalEnergy / checkIns.length) * 10) / 10;

  // Calculate mode distribution
  const modeCounts: Record<string, number> = {};
  checkIns.forEach((c) => {
    const mode = c.current_state;
    modeCounts[mode] = (modeCounts[mode] || 0) + 1;
  });

  // Convert to percentages
  const modeDistribution: Record<string, number> = {};
  Object.entries(modeCounts).forEach(([mode, count]) => {
    modeDistribution[mode] = Math.round((count / checkIns.length) * 100);
  });

  return {
    totalCheckIns: checkIns.length,
    averageEnergyLevel,
    modeDistribution,
    currentStreak: 0, // Will be populated from streak repository
  };
}

/**
 * POST /api/tools/check-in
 * Save daily energy check-in
 * Requirements: 1.1, 1.3
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, checkInSchema);
  if (!validation.success) {
    throw validation.error;
  }

  // Save check-in using repository
  const checkIn = await logsRepository.saveCheckIn(user.id, validation.data);

  // Record activity for streak tracking (Requirements 1.3)
  const streak = await learningStreaksRepository.recordActivity(
    user.id,
    "login", // Using 'login' as the closest activity type for daily check-in
    "daily_check_in"
  );

  return successResponse({
    message: "Check-in saved successfully",
    saved: true,
    checkIn: {
      id: checkIn.id,
      created_at: checkIn.timestamp,
      element: validation.data.element,
      energy_level: validation.data.energy_level,
      current_state: validation.data.current_state,
      reflection: validation.data.reflection,
      gratitude: validation.data.gratitude,
      intention: validation.data.intention,
    },
    streak: streak.current_streak,
  });
});

/**
 * GET /api/tools/check-in
 * Get user's check-in history with stats
 * Requirements: 1.2
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  // Get check-in history
  const checkIns = await logsRepository.getUserCheckIns(user.id, 30);

  // Calculate statistics
  const stats = calculateCheckInStats(checkIns);

  // Get current streak
  const streakStats = await learningStreaksRepository.getStreakStats(user.id);
  stats.currentStreak = streakStats.currentStreak;

  return successResponse({
    checkIns,
    count: checkIns.length,
    stats,
  });
});
