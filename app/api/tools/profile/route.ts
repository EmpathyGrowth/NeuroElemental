import {
  createOptionalAuthRoute,
  successResponse,
} from "@/lib/api";
import { assessmentRepository } from "@/lib/db/assessments";
import { logsRepository } from "@/lib/db/logs";

/**
 * GET /api/tools/profile
 * Get user's element profile and current state for tool recommendations
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 15.1
 */
export const GET = createOptionalAuthRoute(async (_req, _context, user) => {
  // If no user, return empty profile
  if (!user) {
    return successResponse({
      hasAssessment: false,
      primaryElement: null,
      assessmentDate: null,
      currentState: null,
      isInProtectionMode: false,
    });
  }

  // Get latest assessment result
  const assessmentResult = await assessmentRepository.getLatestResult(user.id);
  
  // Get most recent check-in to determine current state
  const checkIns = await logsRepository.getUserCheckIns(user.id, 1);
  const latestCheckIn = checkIns.length > 0 ? checkIns[0] : null;
  
  // Determine if user is in Protection Mode
  const isInProtectionMode = latestCheckIn?.current_state === "protection";

  return successResponse({
    hasAssessment: assessmentResult !== null,
    primaryElement: assessmentResult?.top_element || null,
    elementScores: assessmentResult?.element_scores || null,
    assessmentDate: assessmentResult?.completed_at || null,
    currentState: latestCheckIn?.current_state || null,
    isInProtectionMode,
    latestCheckIn: latestCheckIn ? {
      element: latestCheckIn.element,
      energyLevel: latestCheckIn.energy_level,
      state: latestCheckIn.current_state,
      date: latestCheckIn.created_at,
    } : null,
  });
});
