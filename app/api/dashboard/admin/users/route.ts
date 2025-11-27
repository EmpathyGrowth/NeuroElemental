/**
 * Admin Users API Route
 * Fetch all users for admin management
 */

import { createAdminRoute, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'
import { subDays } from 'date-fns'

/**
 * GET /api/dashboard/admin/users
 * Get all users with stats (admin only)
 */
export const GET = createAdminRoute(async (request) => {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const roleFilter = searchParams.get('role') || 'all'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = (page - 1) * limit

  try {
    // Build the query for profiles
    let query = supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at, updated_at, instructor_status', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply role filter
    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter)
    }

    // Apply pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: profiles, count, error } = await query

    if (error) {
      logger.error('Error fetching users:', error)
      return successResponse({ users: [], stats: getDefaultStats(), total: 0 })
    }

    const userIds = profiles?.map(p => p.id) || []

    // Get enrollment counts for these users
    const enrollmentCounts: Record<string, number> = {}
    if (userIds.length > 0) {
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('user_id')
        .in('user_id', userIds) as { data: Array<{ user_id: string }> | null; error: unknown }

      if (enrollments) {
        enrollments.forEach(e => {
          enrollmentCounts[e.user_id] = (enrollmentCounts[e.user_id] || 0) + 1
        })
      }
    }

    // Get certificate counts for these users
    const certificateCounts: Record<string, number> = {}
    if (userIds.length > 0) {
      const { data: certificates } = await supabase
        .from('certificates')
        .select('user_id')
        .in('user_id', userIds) as { data: Array<{ user_id: string }> | null; error: unknown }

      if (certificates) {
        certificates.forEach(c => {
          certificateCounts[c.user_id] = (certificateCounts[c.user_id] || 0) + 1
        })
      }
    }

    // Transform to response format
    const users = profiles?.map(profile => ({
      id: profile.id,
      fullName: profile.full_name || 'Unknown',
      email: profile.email || '',
      role: profile.role || 'registered',
      instructorStatus: profile.instructor_status,
      enrolledCourses: enrollmentCounts[profile.id] || 0,
      certificates: certificateCounts[profile.id] || 0,
      createdAt: profile.created_at,
      lastActive: profile.updated_at,
    })) || []

    // Calculate stats
    const weekAgo = subDays(new Date(), 7)

    // Total users count
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Active users (last 7 days) - using updated_at as proxy for activity
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', weekAgo.toISOString())

    // Instructors count
    const { count: instructors } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'instructor')

    // Pending instructor approvals
    const { count: pendingInstructors } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('instructor_status', 'pending')

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      instructors: instructors || 0,
      pendingInstructors: pendingInstructors || 0,
    }

    return successResponse({
      users,
      stats,
      total: count || 0,
      page,
      limit,
    })
  } catch (error) {
    logger.error('Error in admin users route:', error as Error)
    return successResponse({ users: [], stats: getDefaultStats(), total: 0 })
  }
})

function getDefaultStats() {
  return {
    totalUsers: 0,
    activeUsers: 0,
    instructors: 0,
    pendingInstructors: 0,
  }
}
