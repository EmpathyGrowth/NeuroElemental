/**
 * Lesson Bookmark API
 * GET - Check if lesson is bookmarked
 * POST - Toggle bookmark (add/remove)
 * DELETE - Remove bookmark
 */

import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { lessonBookmarksRepository } from "@/lib/db/lesson-bookmarks";
import { z } from "zod";

const bookmarkSchema = z.object({
  note: z.string().max(500).optional(),
});

/**
 * GET /api/lessons/[id]/bookmark
 * Check if lesson is bookmarked
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id: lessonId } = await context.params;

    const bookmark = await lessonBookmarksRepository.findByUserAndLesson(
      user.id,
      lessonId
    );

    return successResponse({
      bookmarked: !!bookmark,
      bookmark,
    });
  }
);

/**
 * POST /api/lessons/[id]/bookmark
 * Toggle bookmark for this lesson
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id: lessonId } = await context.params;

    let note: string | undefined;
    try {
      const body = await request.json();
      const parsed = bookmarkSchema.safeParse(body);
      if (parsed.success) {
        note = parsed.data.note;
      }
    } catch {
      // No body is fine
    }

    const result = await lessonBookmarksRepository.toggleBookmark(
      user.id,
      lessonId,
      note
    );

    return successResponse({
      ...result,
      message: result.bookmarked ? "Bookmark added" : "Bookmark removed",
    });
  }
);

/**
 * DELETE /api/lessons/[id]/bookmark
 * Remove bookmark for this lesson
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id: lessonId } = await context.params;

    await lessonBookmarksRepository.removeBookmark(user.id, lessonId);

    return successResponse({ message: "Bookmark removed" });
  }
);
