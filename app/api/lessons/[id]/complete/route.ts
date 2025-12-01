import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { certificateRepository } from "@/lib/db/certificates";
import { enrollmentRepository } from "@/lib/db/enrollments";
import { learningStreaksRepository } from "@/lib/db/learning-streaks";
import { lessonCompletionsRepository } from "@/lib/db/lesson-completions";
import {
  checkCourseAchievements,
  checkLessonAchievements,
} from "@/lib/gamification/achievement-service";
import { logger } from "@/lib/logging";
import { RouteContext } from "@/lib/types/api";
import { NextRequest } from "next/server";

/** Completion response */
interface CompletionResponse {
  completed: boolean;
  courseCompleted?: boolean;
  certificateNumber?: string;
}

export const POST = createAuthenticatedRoute<{ id: string }>(
  async (
    _request: NextRequest,
    context: RouteContext<{ id: string }>,
    user
  ) => {
    const { id } = await context.params;

    // Mark lesson as complete using repository
    await lessonCompletionsRepository.markCompleted(user.id, id);

    // Update learning streak (async, don't block response)
    learningStreaksRepository
      .recordActivity(user.id, "lesson_complete", `Lesson ${id}`)
      .catch((err) => {
        logger.error("Error updating learning streak:", err as Error);
      });

    // Check lesson achievements (async, don't block response)
    checkLessonAchievements(user.id).catch((err) => {
      logger.error("Error checking lesson achievements:", err as Error);
    });

    // Get course ID for this lesson
    const courseId = await lessonCompletionsRepository.getCourseIdForLesson(id);

    if (!courseId) {
      return successResponse({ completed: true });
    }

    // Check course completion and get statistics
    const completion = await lessonCompletionsRepository.checkCourseCompletion(
      user.id,
      courseId
    );

    // Update enrollment progress
    await enrollmentRepository.updateProgress(
      user.id,
      courseId,
      completion.progressPercentage
    );

    // Check if all lessons are complete
    if (completion.isComplete) {
      // Check if certificate already exists
      const existingCertificate =
        await certificateRepository.getByUserAndCourse(user.id, courseId);

      if (!existingCertificate) {
        // Generate certificate
        const { generateCertificateNumber } = await import(
          "@/lib/certificate/generator"
        );
        const certificateNumber = generateCertificateNumber();

        // Create certificate record using repository
        await certificateRepository.createCertificate({
          user_id: user.id,
          course_id: courseId,
          verification_code: certificateNumber,
          issued_at: new Date().toISOString(),
        });

        // Check course achievements (async, don't block response)
        checkCourseAchievements(user.id).catch((err) => {
          logger.error("Error checking course achievements:", err as Error);
        });

        const response: CompletionResponse = {
          completed: true,
          courseCompleted: true,
          certificateNumber,
        };
        return successResponse(response);
      }

      // Certificate already exists
      const response: CompletionResponse = {
        completed: true,
        courseCompleted: true,
        certificateNumber: existingCertificate.verification_code,
      };
      return successResponse(response);
    }

    return successResponse({ completed: true });
  }
);
