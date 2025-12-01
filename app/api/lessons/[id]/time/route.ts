import { RouteContext } from '@/lib/types/api';
import { NextRequest } from 'next/server';
import { badRequestError, createAuthenticatedRoute, successResponse, validateRequest } from '@/lib/api';
import { lessonProgressRepository } from '@/lib/db/lesson-progress';
import { enrollmentRepository } from '@/lib/db/enrollments';
import { lessonCompletionsRepository } from '@/lib/db/lesson-completions';
import { z } from 'zod';

const timeUpdateSchema = z.object({
  timeSpent: z.number().int().min(0).max(86400), // Max 24 hours in seconds
});

/**
 * POST /api/lessons/[id]/time
 * Update time spent on a lesson
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const { id } = await context.params;

    // Validate request body
    const validation = await validateRequest(request, timeUpdateSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const { timeSpent } = validation.data;

    // Get course ID for this lesson using repository
    const courseId = await lessonCompletionsRepository.getCourseIdForLesson(id);

    if (!courseId) {
      throw badRequestError('Lesson not found');
    }

    // Get user's enrollment for this course
    const enrollment = await enrollmentRepository.findByUserAndCourse(user.id, courseId);

    if (!enrollment) {
      throw badRequestError('Not enrolled in this course');
    }

    // Add time to lesson progress using repository
    const progress = await lessonProgressRepository.addTime(enrollment.id, id, timeSpent);

    return successResponse({
      timeSpent: progress.time_spent_seconds || 0,
      updated: true,
    });
  }
);
