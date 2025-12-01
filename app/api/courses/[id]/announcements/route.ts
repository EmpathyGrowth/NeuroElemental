/**
 * Course Announcements API
 * GET - Get announcements for a course
 * POST - Create announcement (instructor only)
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  createPublicRoute,
  forbiddenError,
  successResponse,
} from "@/lib/api";
import { courseAnnouncementsRepository } from "@/lib/db/course-announcements";
import { courseRepository } from "@/lib/db/courses";
import { getUserRole } from "@/lib/middleware";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(10000),
  is_pinned: z.boolean().optional().default(false),
});

/**
 * GET /api/courses/[id]/announcements
 * Get all announcements for a course (public for enrolled users)
 */
export const GET = createPublicRoute<{ id: string }>(
  async (_request, context) => {
    const { id: courseId } = await context.params;

    const announcements =
      await courseAnnouncementsRepository.getCourseAnnouncements(courseId);

    return successResponse({ announcements });
  }
);

/**
 * POST /api/courses/[id]/announcements
 * Create a new announcement (instructor/admin only)
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id: courseId } = await context.params;

    // Check if user is instructor or admin
    const role = await getUserRole();
    if (role !== "admin" && role !== "instructor") {
      throw forbiddenError("Only instructors can create announcements");
    }

    // Verify user is the course creator or admin
    const course = await courseRepository.getCourseWithInstructor(courseId);
    if (!course) {
      throw badRequestError("Course not found");
    }

    if (role !== "admin" && course.created_by !== user.id) {
      throw forbiddenError(
        "You can only create announcements for your own courses"
      );
    }

    const body = await request.json();
    const parsed = announcementSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.errors[0]?.message || "Invalid announcement"
      );
    }

    const announcement = await courseAnnouncementsRepository.createAnnouncement(
      courseId,
      user.id,
      parsed.data.title,
      parsed.data.content,
      parsed.data.is_pinned
    );

    return successResponse(
      { announcement, message: "Announcement created" },
      201
    );
  }
);
