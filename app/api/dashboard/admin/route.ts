/**
 * Admin Dashboard API Route
 * Fetch platform-wide statistics for admin dashboard
 */

import { createAdminRoute, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'

/** Credit transaction metadata */
interface TransactionMetadata {
  price?: number;
  [key: string]: unknown;
}

/** Credit transaction record */
interface CreditTransactionRecord {
  id: string;
  metadata?: TransactionMetadata | null;
}

/** User role record */
interface UserRoleRecord {
  role: string;
}

/** Profile record */
interface ProfileRecord {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * GET /api/dashboard/admin
 * Get platform statistics (admin only)
 */
export const GET = createAdminRoute(async (_request, _context, _admin) => {
  const supabase = getSupabaseServer()

  // Initialize counters
  let totalUsers = 0
  let totalCourses = 0
  let totalEnrollments = 0
  let totalRevenue = 0
  let roleCount: Record<string, number> = {}
  let recentUsers: ProfileRecord[] = []
  let recentPayments: CreditTransactionRecord[] = []
  let userGrowthRate = 0
  let enrollmentGrowthRate = 0
  let activeCourses = 0
  let pendingInstructors = 0
  let totalEvents = 0
  let upcomingEvents = 0
  let totalBlogPosts = 0
  let publishedBlogPosts = 0
  let totalResources = 0

  // Fetch total users
  try {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    totalUsers = count || 0
  } catch (error) {
    logger.info('Profiles table not found or error:', { data: error })
  }

  // Fetch total courses
  try {
    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
    totalCourses = count || 0
  } catch (error) {
    logger.info('Courses table not found or error:', { data: error })
  }

  // Fetch total enrollments
  try {
    const { count } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
    totalEnrollments = count || 0
  } catch (error) {
    logger.info('Enrollments table not found or error:', { data: error })
  }

  // Fetch total revenue from credit transactions with price metadata
  try {
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('metadata')
      .eq('transaction_type', 'add')
    totalRevenue = (transactions as CreditTransactionRecord[] | null)?.reduce((sum, t) => {
      const price = t.metadata?.price || 0
      return sum + price
    }, 0) || 0
  } catch (error) {
    logger.info('Credit transactions table not found or error:', { data: error })
  }

  // Fetch users by role
  try {
    const { data: usersByRole } = await supabase
      .from('profiles')
      .select('role')
      .not('role', 'is', null)

    roleCount = (usersByRole as UserRoleRecord[] | null)?.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {}) || {}
  } catch (error) {
    logger.info('Error fetching users by role:', { data: error })
  }

  // Fetch recent users
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    recentUsers = data || []
  } catch (error) {
    logger.info('Error fetching recent users:', { data: error })
  }

  // Fetch recent credit transactions (as proxy for payments)
  try {
    const { data } = await supabase
      .from('credit_transactions')
      .select('id, metadata')
      .eq('transaction_type', 'add')
      .order('created_at', { ascending: false })
      .limit(10)
    recentPayments = (data as CreditTransactionRecord[] | null) || []
  } catch (error) {
    logger.info('Error fetching recent transactions:', { data: error })
  }

  // Fetch growth data (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    const { data: newUsersThisMonth } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())

    userGrowthRate = totalUsers ? Math.round((newUsersThisMonth?.length || 0) / totalUsers * 100) : 0
  } catch (error) {
    logger.info('Error fetching user growth:', { data: error })
  }

  try {
    const { data: newEnrollmentsThisMonth } = await supabase
      .from('course_enrollments')
      .select('enrolled_at')
      .gte('enrolled_at', thirtyDaysAgo.toISOString())

    enrollmentGrowthRate = totalEnrollments ? Math.round((newEnrollmentsThisMonth?.length || 0) / totalEnrollments * 100) : 0
  } catch (error) {
    logger.info('Error fetching enrollment growth:', { data: error })
  }

  // Fetch platform health metrics
  try {
    const { count } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
    activeCourses = count || 0
  } catch (error) {
    logger.info('Error fetching active courses:', { data: error })
  }

  try {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_status', 'pending')
    pendingInstructors = count || 0
  } catch (error) {
    logger.info('Error fetching pending instructors:', { data: error })
  }

  // Fetch total events
  try {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
    totalEvents = count || 0
  } catch (error) {
    logger.info('Events table not found or error:', { data: error })
  }

  // Fetch upcoming events
  try {
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('start_date', new Date().toISOString())
    upcomingEvents = count || 0
  } catch (error) {
    logger.info('Error fetching upcoming events:', { data: error })
  }

  // Fetch total blog posts
  try {
    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
    totalBlogPosts = count || 0
  } catch (error) {
    logger.info('Blog posts table not found or error:', { data: error })
  }

  // Fetch published blog posts
  try {
    const { count } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
    publishedBlogPosts = count || 0
  } catch (error) {
    logger.info('Error fetching published blog posts:', { data: error })
  }

  // Fetch instructor resources count
  try {
    const { count } = await supabase
      .from('instructor_resources')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
    totalResources = count || 0
  } catch (error) {
    logger.info('Instructor resources table not found or error:', { data: error })
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
      total_events: totalEvents,
      upcoming_events: upcomingEvents,
      total_blog_posts: totalBlogPosts,
      published_blog_posts: publishedBlogPosts,
      total_resources: totalResources,
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
  })
})
