/**
 * User Announcements API
 * GET - Get all announcements from enrolled courses
 */

import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { courseAnnouncementsRepository } from "@/lib/db/course-announcements";

/**
 * GET /api/user/announcements
 * Get all announcements from courses the user is enrolled in
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const url = new URL(request.url);
  const recent = url.searchParams.get("recent") === "true";

  let announcements;

  if (recent) {
    announcements = await courseAnnouncementsRepository.getRecentAnnouncements(
      user.id
    );
  } else {
    announcements =
      await courseAnnouncementsRepository.getUserCourseAnnouncements(user.id);
  }

  return successResponse({ announcements });
});
