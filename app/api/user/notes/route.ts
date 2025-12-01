/**
 * User Notes API
 * GET - Get all notes for the current user
 */

import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { lessonNotesRepository } from "@/lib/db/lesson-notes";

/**
 * GET /api/user/notes
 * Get all notes for the current user with full context
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const url = new URL(request.url);
  const courseId = url.searchParams.get("courseId");
  const search = url.searchParams.get("search");

  let notes;

  if (search) {
    notes = await lessonNotesRepository.searchUserNotes(user.id, search);
  } else if (courseId) {
    notes = await lessonNotesRepository.getUserNotesForCourse(
      user.id,
      courseId
    );
  } else {
    notes = await lessonNotesRepository.getUserNotesWithContext(user.id);
  }

  const count = await lessonNotesRepository.getUserNoteCount(user.id);

  return successResponse({ notes, count });
});
