import {
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { logsRepository, type CheckInLog } from "@/lib/db/logs";

/**
 * Check if a check-in was made today
 */
function isToday(dateString: string): boolean {
  const checkInDate = new Date(dateString);
  const today = new Date();
  
  return (
    checkInDate.getFullYear() === today.getFullYear() &&
    checkInDate.getMonth() === today.getMonth() &&
    checkInDate.getDate() === today.getDate()
  );
}

/**
 * GET /api/tools/check-in/today
 * Return whether user has checked in today
 * Requirements: 9.4, 12.2
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  // Get most recent check-ins (limit to 1 for efficiency)
  const checkIns = await logsRepository.getUserCheckIns(user.id, 1);
  
  // Check if the most recent check-in was today
  const todayCheckIn = checkIns.length > 0 && isToday(checkIns[0].created_at)
    ? checkIns[0]
    : null;

  return successResponse({
    hasCheckedIn: todayCheckIn !== null,
    checkIn: todayCheckIn,
  });
});
