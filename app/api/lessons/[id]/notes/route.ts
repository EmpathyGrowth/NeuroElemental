/**
 * Lesson Notes API
 * GET - Get note for a lesson
 * POST - Create/update note for a lesson
 * DELETE - Delete note for a lesson
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { lessonNotesRepository } from "@/lib/db/lesson-notes";
import { z } from "zod";

const noteSchema = z.object({
  content: z
    .string()
    .min(1, "Note content is required")
    .max(50000, "Note too long"),
});

/**
 * GET /api/lessons/[id]/notes
 * Get the current user's note for this lesson
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id: lessonId } = await context.params;

    const note = await lessonNotesRepository.findByUserAndLesson(
      user.id,
      lessonId
    );

    return successResponse({ note });
  }
);

/**
 * POST /api/lessons/[id]/notes
 * Create or update a note for this lesson
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id: lessonId } = await context.params;
    const body = await request.json();

    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(parsed.error.issues[0]?.message || "Invalid note");
    }

    const note = await lessonNotesRepository.upsertNote(
      user.id,
      lessonId,
      parsed.data.content
    );

    return successResponse({ note, message: "Note saved" });
  }
);

/**
 * DELETE /api/lessons/[id]/notes
 * Delete the note for this lesson
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id: lessonId } = await context.params;

    const note = await lessonNotesRepository.findByUserAndLesson(
      user.id,
      lessonId
    );
    if (note) {
      await lessonNotesRepository.deleteNote(note.id, user.id);
    }

    return successResponse({ message: "Note deleted" });
  }
);
