/**
 * Lesson Progress API
 * GET - Get video position and progress for a lesson
 * POST - Save video position
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { enrollmentRepository } from "@/lib/db/enrollments";
import { lessonCompletionsRepository } from "@/lib/db/lesson-completions";
import { lessonProgressRepository } from "@/lib/db/lesson-progress";
import { z } from "zod";

const videoPositionSchema = z.object({
  positionSeconds: z.number().min(0),
  durationSeconds: z.number().min(0).optional(),
});

/**
 * Get enrollment ID for a user and lesson's course
 */
async function getEnrollmentId(
  userId: string,
  lessonId: string
): Promise<string | null> {
  const supabase = getSupabaseServer();

  // Get the course ID from the lesson through module
  const { data: lesson } = await supabase
    .from("course_lessons")
    .select("module_id, course_modules!inner(course_id)")
    .eq("id", lessonId)
    .single();

  if (!lesson) return null;

  const courseId = (lesson.course_modules as { course_id?: string })?.course_id;
  if (!courseId) return null;

  // Get the enrollment
  const enrollment = await enrollmentRepository.findByUserAndCourse(
    userId,
    courseId
  );
  return enrollment?.id || null;
}

/**
 * GET /api/lessons/[id]/progress
 * Get video position and progress for a lesson
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id: lessonId } = await context.params;

    const enrollmentId = await getEnrollmentId(user.id, lessonId);
    if (!enrollmentId) {
      throw notFoundError("Enrollment");
    }

    const videoPosition = await lessonProgressRepository.getVideoPosition(
      enrollmentId,
      lessonId
    );
    const isCompleted = await lessonCompletionsRepository.isCompleted(
      user.id,
      lessonId
    );

    return successResponse({
      videoPosition,
      isCompleted,
    });
  }
);

/**
 * POST /api/lessons/[id]/progress
 * Save video position for a lesson
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id: lessonId } = await context.params;
    const body = await request.json();

    const parsed = videoPositionSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.errors[0]?.message || "Invalid position"
      );
    }

    const enrollmentId = await getEnrollmentId(user.id, lessonId);
    if (!enrollmentId) {
      throw notFoundError("Enrollment");
    }

    await lessonProgressRepository.saveVideoPosition(
      enrollmentId,
      lessonId,
      parsed.data.positionSeconds,
      parsed.data.durationSeconds
    );

    return successResponse({ message: "Position saved" });
  }
);
