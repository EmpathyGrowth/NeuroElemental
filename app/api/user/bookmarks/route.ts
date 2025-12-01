/**
 * User Bookmarks API
 * GET - Get all bookmarks for the current user
 */

import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { lessonBookmarksRepository } from "@/lib/db/lesson-bookmarks";

/**
 * GET /api/user/bookmarks
 * Get all bookmarks for the current user with full context
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");

  let bookmarks;

  if (courseId) {
    bookmarks = await lessonBookmarksRepository.getUserBookmarksForCourse(
      user.id,
      courseId
    );
  } else {
    bookmarks = await lessonBookmarksRepository.getUserBookmarksWithContext(
      user.id
    );
  }

  const count = await lessonBookmarksRepository.getUserBookmarkCount(user.id);

  return successResponse({ bookmarks, count });
});
