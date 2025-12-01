import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";

/**
 * GET /api/users/me/progress
 * Get user's learning progress statistics
 */
export const GET = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const supabase = getSupabaseServer();

    try {
      // Get enrolled courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("course_enrollments")
        .select(
          `
        id,
        enrolled_at,
        courses (
          id,
          title,
          slug
        )
      `
        )
        .eq("user_id", user.userId)
        .order("enrolled_at", { ascending: false });

      if (enrollmentsError) {
        logger.error("Error fetching enrollments:", enrollmentsError);
      }

      // Get certificates count
      const { count: certificatesCount, error: certError } = await supabase
        .from("certificates")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.userId);

      if (certError) {
        logger.error("Error fetching certificates:", certError);
      }

      // Build course progress array from enrollments
      const enrollmentList = enrollments || [];
      interface Enrollment {
        id: string;
        enrolled_at: string;
        courses: { id: string; title: string; slug: string } | null;
      }

      const courses = (enrollmentList as Enrollment[])
        .filter((e) => e.courses)
        .slice(0, 10)
        .map((enrollment) => {
          const course = enrollment.courses;
          return {
            id: course?.id || "",
            title: course?.title || "Unknown Course",
            progress: 0, // Would need lesson_progress table to calculate
            completed_lessons: 0,
            total_lessons: 0,
            last_accessed: enrollment.enrolled_at,
          };
        });

      return successResponse({
        courses,
        totalCoursesEnrolled: enrollmentList.length,
        totalCoursesCompleted: certificatesCount || 0, // Approximation
        totalLessonsCompleted: 0, // Would need lesson_progress table
        totalQuizzesPassed: 0, // Would need quiz_attempts table
        certificatesEarned: certificatesCount || 0,
      });
    } catch (error) {
      logger.error("Error fetching user progress:", error as Error);
      // Return empty data on error
      return successResponse({
        courses: [],
        totalCoursesEnrolled: 0,
        totalCoursesCompleted: 0,
        totalLessonsCompleted: 0,
        totalQuizzesPassed: 0,
        certificatesEarned: 0,
      });
    }
  }
);
