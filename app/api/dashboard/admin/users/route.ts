/**
 * Admin Users API Route
 * Fetch all users for admin management
 */

import { createAdminRoute, successResponse } from "@/lib/api";
import { userRepository } from "@/lib/db";
import { logger } from "@/lib/logging";

/**
 * GET /api/dashboard/admin/users
 * Get all users with stats (admin only)
 */
export const GET = createAdminRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const roleFilter = searchParams.get("role") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    // 1. Fetch Paginated Users
    const {
      data: profiles,
      total,
      totalPages,
    } = await userRepository.getPaginated(page, limit, {
      search: search || undefined,
      role: roleFilter && roleFilter !== "all" ? roleFilter : undefined,
    });

    const userIds = profiles.map((p) => p.id);

    // 2. Fetch User Related Counts (Enrollments, Certifications)
    const { enrollments: enrollmentCounts, certificates: certificateCounts } =
      await userRepository.getUserRelatedCounts(userIds);

    // 3. Fetch Admin Stats
    const stats = await userRepository.getAdminStats();

    // 4. Transform to response format
    const users = profiles.map((profile) => ({
      id: profile.id,
      fullName: profile.full_name || "Unknown",
      email: profile.email || "",
      role: profile.role || "registered",
      instructorStatus: profile.instructor_status,
      enrolledCourses: enrollmentCounts[profile.id] || 0,
      certificates: certificateCounts[profile.id] || 0,
      createdAt: profile.created_at,
      lastActive: profile.updated_at,
    }));

    return successResponse({
      users,
      stats,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    logger.error("Error in admin users route:", error as Error);
    return successResponse({ users: [], stats: getDefaultStats(), total: 0 });
  }
});

function getDefaultStats() {
  return {
    totalUsers: 0,
    activeUsers: 0,
    instructors: 0,
    pendingInstructors: 0,
  };
}
