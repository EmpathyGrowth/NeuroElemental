/**
 * Admin Dashboard API Route
 * Fetch platform-wide statistics for admin dashboard
 */

import { createAdminRoute, successResponse } from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging/logger";

interface UserProfile {
  id: string;
  role: string | null;
  created_at: string | null;
  full_name: string | null;
  email: string | null;
}

interface TransactionRecord {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

/**
 * GET /api/dashboard/admin
 * Get platform statistics (admin only)
 */
export const GET = createAdminRoute(async (_request, _context, _admin) => {
  const supabase = getSupabaseServer();

  // Initialize counters
  let totalUsers = 0;
  let totalCourses = 0;
  let totalEnrollments = 0;
  let totalRevenue = 0;
  let roleCount: Record<string, number> = {};
  let recentUsers: UserProfile[] = [];
  let recentPayments: TransactionRecord[] = [];
  let userGrowthRate = 0;
  let enrollmentGrowthRate = 0;
  let activeCourses = 0;
  let pendingInstructors = 0;

  // Fetch total users
  try {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });
    totalUsers = count || 0;
  } catch (error) {
    logger.info("Profiles table not found or error:", { data: error });
  }

  // Fetch total courses
  try {
    const { count } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });
    totalCourses = count || 0;
  } catch (error) {
    logger.info("Courses table not found or error:", { data: error });
  }

  // Fetch total enrollments
  try {
    const { count } = await supabase
      .from("course_enrollments")
      .select("*", { count: "exact", head: true });
    totalEnrollments = count || 0;
  } catch (error) {
    logger.info("Course enrollments table not found or error:", {
      data: error,
    });
  }

  // Fetch total revenue from transactions table
  try {
    const { data: transactions } = await (supabase.from as any)("transactions")
      .select("amount")
      .eq("status", "succeeded");
    totalRevenue =
      (transactions as Array<{ amount: number }> | null)?.reduce(
        (sum: number, p: { amount: number }) => sum + (p.amount || 0),
        0
      ) || 0;
  } catch (error) {
    logger.info("Transactions table not found or error:", { data: error });
  }

  // Fetch users by role
  try {
    const { data: usersByRole } = await supabase
      .from("profiles")
      .select("role")
      .not("role", "is", null);

    roleCount =
      usersByRole?.reduce(
        (acc: Record<string, number>, user: { role: string | null }) => {
          if (user.role) {
            acc[user.role] = (acc[user.role] || 0) + 1;
          }
          return acc;
        },
        {}
      ) || {};
  } catch (error) {
    logger.info("Error fetching users by role:", { data: error });
  }

  // Fetch recent users
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    recentUsers = data || [];
  } catch (error) {
    logger.info("Error fetching recent users:", { data: error });
  }

  // Fetch recent transactions
  try {
    const { data } = await (supabase.from as any)("transactions")
      .select(
        `
        *,
        user:profiles!transactions_user_id_fkey(
          full_name,
          email
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);
    recentPayments = (data as any[]) || [];
  } catch (error) {
    logger.info("Error fetching recent transactions:", { data: error });
  }

  // Fetch growth data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    const { data: newUsersThisMonth } = await supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString());

    userGrowthRate = totalUsers
      ? Math.round(((newUsersThisMonth?.length || 0) / totalUsers) * 100)
      : 0;
  } catch (error) {
    logger.info("Error fetching user growth:", { data: error });
  }

  try {
    const { data: newEnrollmentsThisMonth } = await supabase
      .from("course_enrollments")
      .select("enrolled_at")
      .gte("enrolled_at", thirtyDaysAgo.toISOString());

    enrollmentGrowthRate = totalEnrollments
      ? Math.round(
          ((newEnrollmentsThisMonth?.length || 0) / totalEnrollments) * 100
        )
      : 0;
  } catch (error) {
    logger.info("Error fetching enrollment growth:", { data: error });
  }

  // Fetch platform health metrics
  try {
    const { count } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);
    activeCourses = count || 0;
  } catch (error) {
    logger.info("Error fetching active courses:", { data: error });
  }

  try {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("instructor_status", "pending");
    pendingInstructors = count || 0;
  } catch (error) {
    logger.info("Error fetching pending instructors:", { data: error });
  }

  return successResponse({
    stats: {
      total_users: totalUsers,
      total_courses: totalCourses,
      total_enrollments: totalEnrollments,
      total_revenue: totalRevenue,
      user_growth_rate: userGrowthRate,
      enrollment_growth_rate: enrollmentGrowthRate,
      active_courses: activeCourses,
      pending_instructors: pendingInstructors,
    },
    users_by_role: {
      students: roleCount?.student || 0,
      instructors: roleCount?.instructor || 0,
      therapists: roleCount?.therapist || 0,
      business: roleCount?.business || 0,
      admins: roleCount?.admin || 0,
    },
    recent_users: recentUsers,
    recent_payments: recentPayments,
    growth: {
      user_growth_rate: userGrowthRate,
      enrollment_growth_rate: enrollmentGrowthRate,
    },
  });
});
