/**
 * Admin Analytics API Route
 * Fetch detailed analytics data for admin analytics dashboard
 */

import { createAdminRoute, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'
import { subDays, format } from 'date-fns'

/**
 * GET /api/dashboard/admin/analytics
 * Get detailed analytics data (admin only)
 */
export const GET = createAdminRoute(async (request) => {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const daysParam = searchParams.get('days') || '30'
  const days = Math.min(Math.max(parseInt(daysParam, 10) || 30, 7), 365)

  const now = new Date()
  const startDate = subDays(now, days)
  const previousStartDate = subDays(startDate, days)

  // Initialize response data
  const analytics = {
    overview: {
      totalUsers: 0,
      totalRevenue: 0,
      totalCourses: 0,
      totalEvents: 0,
      userGrowth: 0,
      revenueGrowth: 0,
      activeSubscriptions: 0,
      averageRating: 0,
    },
    revenueChart: [] as Array<{ date: string; revenue: number; subscriptions: number; oneTime: number }>,
    userChart: [] as Array<{ date: string; signups: number; active: number }>,
    courseStats: [] as Array<{ title: string; enrollments: number; revenue: number; completion: number; rating: number }>,
    eventStats: [] as Array<{ title: string; registrations: number; revenue: number; attendance: number }>,
    userDemographics: [] as Array<{ category: string; value: number }>,
    topInstructors: [] as Array<{ name: string; students: number; revenue: number; rating: number }>,
    topPages: [] as Array<{ path: string; views: number }>,
    revenueByCategory: [] as Array<{ name: string; value: number }>,
  }

  // Fetch total users
  try {
    const { count } = await (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true }) as { count: number | null }
    analytics.overview.totalUsers = count || 0
  } catch (error) {
    logger.error('Error fetching total users:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch user growth (compare current period to previous period)
  try {
    const { count: currentPeriodUsers } = await (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString()) as { count: number | null }

    const { count: previousPeriodUsers } = await (supabase as any)
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString()) as { count: number | null }

    const current = currentPeriodUsers || 0
    const previous = previousPeriodUsers || 0
    analytics.overview.userGrowth = previous > 0
      ? Math.round(((current - previous) / previous) * 100 * 10) / 10
      : current > 0 ? 100 : 0
  } catch (error) {
    logger.error('Error calculating user growth:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch total revenue from credit transactions
  try {
    const { data: transactions } = await (supabase as any)
      .from('credit_transactions')
      .select('metadata, created_at')
      .eq('transaction_type', 'add') as { data: { metadata: any; created_at: string }[] | null }

    const totalRevenue = transactions?.reduce((sum, t) => {
      const price = (t.metadata as { price?: number })?.price || 0
      return sum + price
    }, 0) || 0
    analytics.overview.totalRevenue = totalRevenue

    // Calculate revenue growth
    const currentPeriodRevenue = transactions?.reduce((sum, t) => {
      const createdAt = new Date(t.created_at)
      if (createdAt >= startDate) {
        return sum + ((t.metadata as { price?: number })?.price || 0)
      }
      return sum
    }, 0) || 0

    const previousPeriodRevenue = transactions?.reduce((sum, t) => {
      const createdAt = new Date(t.created_at)
      if (createdAt >= previousStartDate && createdAt < startDate) {
        return sum + ((t.metadata as { price?: number })?.price || 0)
      }
      return sum
    }, 0) || 0

    analytics.overview.revenueGrowth = previousPeriodRevenue > 0
      ? Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 * 10) / 10
      : currentPeriodRevenue > 0 ? 100 : 0
  } catch (error) {
    logger.error('Error fetching revenue:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch total courses
  try {
    const { count } = await (supabase as any)
      .from('courses')
      .select('*', { count: 'exact', head: true }) as { count: number | null }
    analytics.overview.totalCourses = count || 0
  } catch (error) {
    logger.error('Error fetching courses count:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch total events
  try {
    const { count } = await (supabase as any)
      .from('events')
      .select('*', { count: 'exact', head: true }) as { count: number | null }
    analytics.overview.totalEvents = count || 0
  } catch (error) {
    logger.error('Error fetching events count:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch active subscriptions (count enrollments as proxy for active subscriptions)
  try {
    const { count } = await (supabase as any)
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active') as { count: number | null }
    analytics.overview.activeSubscriptions = count || 0
  } catch (error) {
    logger.error('Error fetching active subscriptions:', error instanceof Error ? error : new Error(String(error)))
  }

  // Build daily charts for revenue and users
  try {
    // Get daily signups
    const { data: signupData } = await (supabase as any)
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true }) as { data: { created_at: string | null }[] | null }

    // Get daily transactions
    const { data: txData } = await (supabase as any)
      .from('credit_transactions')
      .select('created_at, metadata, transaction_type')
      .eq('transaction_type', 'add')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true }) as { data: { created_at: string | null; metadata: any; transaction_type: string }[] | null }

    // Group by day
    const dailyData: Record<string, { signups: number; revenue: number; subscriptions: number; oneTime: number }> = {}

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = format(subDays(now, days - 1 - i), 'yyyy-MM-dd')
      dailyData[date] = { signups: 0, revenue: 0, subscriptions: 0, oneTime: 0 }
    }

    // Count signups per day
    signupData?.forEach(profile => {
      if (!profile.created_at) return
      const date = format(new Date(profile.created_at), 'yyyy-MM-dd')
      if (dailyData[date]) {
        dailyData[date].signups++
      }
    })

    // Count revenue per day
    txData?.forEach(tx => {
      if (!tx.created_at) return
      const date = format(new Date(tx.created_at), 'yyyy-MM-dd')
      const price = (tx.metadata as { price?: number; type?: string })?.price || 0
      const type = (tx.metadata as { type?: string })?.type || 'oneTime'
      if (dailyData[date]) {
        dailyData[date].revenue += price
        if (type === 'subscription') {
          dailyData[date].subscriptions += price
        } else {
          dailyData[date].oneTime += price
        }
      }
    })

    // Convert to arrays
    Object.entries(dailyData).forEach(([date, values]) => {
      const formattedDate = format(new Date(date), 'MMM dd')
      analytics.revenueChart.push({
        date: formattedDate,
        revenue: values.revenue,
        subscriptions: values.subscriptions,
        oneTime: values.oneTime,
      })
      analytics.userChart.push({
        date: formattedDate,
        signups: values.signups,
        active: values.signups, // For now, use signups as a proxy
      })
    })
  } catch (error) {
    logger.error('Error building daily charts:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch course stats
  try {
    const { data: courses } = await (supabase as any)
      .from('courses')
      .select('id, title')
      .eq('is_published', true)
      .limit(10) as { data: { id: string; title: string }[] | null }

    if (courses) {
      // Get enrollment counts for each course
      const courseStatsWithEnrollments = await Promise.all(
        courses.map(async (course) => {
          const { count } = await (supabase as any)
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id) as { count: number | null }

          return {
            title: course.title,
            enrollments: count || 0,
            revenue: 0,
            completion: 0,
            rating: 0,
          }
        })
      )

      analytics.courseStats = courseStatsWithEnrollments
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5)
    }
  } catch (error) {
    logger.error('Error fetching course stats:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch event stats
  try {
    const { data: events } = await (supabase as any)
      .from('events')
      .select('id, title')
      .limit(10) as { data: { id: string; title: string }[] | null }

    if (events) {
      // Get registration counts for each event
      const eventStatsWithRegistrations = await Promise.all(
        events.map(async (event) => {
          const { count } = await (supabase as any)
            .from('event_registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id) as { count: number | null }

          return {
            title: event.title,
            registrations: count || 0,
            revenue: 0,
            attendance: 0,
          }
        })
      )

      analytics.eventStats = eventStatsWithRegistrations
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5)
    }
  } catch (error) {
    logger.error('Error fetching event stats:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch user demographics by role
  try {
    const { data: usersByRole } = await (supabase as any)
      .from('profiles')
      .select('role')
      .not('role', 'is', null) as { data: { role: string | null }[] | null }

    const roleCounts: Record<string, number> = {}
    usersByRole?.forEach(user => {
      const role = user.role || 'unknown'
      roleCounts[role] = (roleCounts[role] || 0) + 1
    })

    const roleMapping: Record<string, string> = {
      student: 'Students',
      instructor: 'Instructors',
      therapist: 'Therapists',
      business: 'Organizations',
      admin: 'Admins',
    }

    const totalUsers = Object.values(roleCounts).reduce((sum, count) => sum + count, 0)
    analytics.userDemographics = Object.entries(roleCounts)
      .map(([role, count]) => ({
        category: roleMapping[role] || role,
        value: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  } catch (error) {
    logger.error('Error fetching user demographics:', error instanceof Error ? error : new Error(String(error)))
  }

  // Fetch top instructors
  try {
    const { data: instructors } = await (supabase as any)
      .from('profiles')
      .select(`
        id,
        full_name,
        email
      `)
      .eq('role', 'instructor')
      .limit(10) as { data: { id: string; full_name: string | null; email: string | null }[] | null }

    if (instructors) {
      // For each instructor, get their courses and calculate stats
      const instructorStats = await Promise.all(
        instructors.map(async (instructor) => {
          // Get instructor's courses
          const { data: instructorCourses } = await (supabase as any)
            .from('courses')
            .select('id')
            .eq('created_by', instructor.id) as { data: { id: string }[] | null }

          const courseIds = instructorCourses?.map((c) => c.id) || []

          let studentCount = 0
          let revenue = 0
          let avgRating = 0

          if (courseIds.length > 0) {
            // Count students enrolled in instructor's courses
            const { count } = await (supabase as any)
              .from('course_enrollments')
              .select('*', { count: 'exact', head: true })
              .in('course_id', courseIds) as { count: number | null }

            studentCount = count || 0

            // Sum revenue from enrollments
            const { data: enrollments } = await (supabase as any)
              .from('course_enrollments')
              .select('amount_paid')
              .in('course_id', courseIds) as { data: { amount_paid: number | null }[] | null }

            revenue = enrollments?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0

            // Get average rating from course reviews
            const { data: reviews } = await (supabase as any)
              .from('course_reviews')
              .select('rating')
              .in('course_id', courseIds) as { data: { rating: number }[] | null }

            if (reviews?.length) {
              avgRating = Math.round(
                (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
              ) / 10
            }
          }

          return {
            name: instructor.full_name || instructor.email || 'Unknown',
            students: studentCount,
            revenue: revenue / 100, // Convert cents to dollars
            rating: avgRating,
          }
        })
      )

      analytics.topInstructors = instructorStats
        .sort((a, b) => b.students - a.students)
        .slice(0, 5)
    }
  } catch (error) {
    logger.error('Error fetching top instructors:', error instanceof Error ? error : new Error(String(error)))
  }

  // Top pages - requires page view tracking integration (e.g., Vercel Analytics, Google Analytics)
  // Returns empty array until analytics tracking is implemented
  // analytics.topPages is already initialized as empty array

  // Calculate revenue by category based on transaction metadata
  try {
    const { data: allTransactions } = await (supabase as any)
      .from('credit_transactions')
      .select('metadata')
      .eq('transaction_type', 'add') as { data: { metadata: any }[] | null }

    const categoryRevenue: Record<string, number> = {
      'Courses': 0,
      'Events': 0,
      'Subscriptions': 0,
      'Other': 0,
    }

    allTransactions?.forEach(tx => {
      const metadata = tx.metadata as { price?: number; category?: string; type?: string } | null
      const price = metadata?.price || 0
      const category = metadata?.category || metadata?.type || 'other'

      if (category === 'course' || category === 'courses') {
        categoryRevenue['Courses'] += price
      } else if (category === 'event' || category === 'events') {
        categoryRevenue['Events'] += price
      } else if (category === 'subscription' || category === 'subscriptions') {
        categoryRevenue['Subscriptions'] += price
      } else {
        categoryRevenue['Other'] += price
      }
    })

    const totalCategoryRevenue = Object.values(categoryRevenue).reduce((sum, val) => sum + val, 0)

    analytics.revenueByCategory = Object.entries(categoryRevenue)
      .map(([name, revenue]) => ({
        name,
        value: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0,
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value)

    // If no transaction data, return empty array rather than fake placeholders
    // The frontend should handle empty state appropriately
  } catch (error) {
    logger.error('Error calculating revenue by category:', error instanceof Error ? error : new Error(String(error)))
  }

  return successResponse(analytics)
})
