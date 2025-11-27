/**
 * Enrollment Repository
 *
 * Centralizes all course enrollment operations following the Repository Pattern.
 * Eliminates N+1 queries and direct Supabase calls scattered across the codebase.
 */

import { BaseRepository, type PaginatedResult } from './base-repository'
import { logger } from '@/lib/logging'
import { internalError, notFoundError } from '@/lib/api'
import { toError, getUpdateTimestamp } from '@/lib/utils'
import type { Database } from '@/lib/types/supabase'

/** Course enrollment record from database */
export type CourseEnrollment = Database['public']['Tables']['course_enrollments']['Row']
export type CourseEnrollmentInsert = Database['public']['Tables']['course_enrollments']['Insert']
export type CourseEnrollmentUpdate = Database['public']['Tables']['course_enrollments']['Update']

/** Enrollment status values */
export type EnrollmentPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

/** Enrollment with user profile */
export interface EnrollmentWithUser extends CourseEnrollment {
  user: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

/** Enrollment with course details */
export interface EnrollmentWithCourse extends CourseEnrollment {
  course: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    category: string | null
    duration_hours: number | null
  } | null
}

/** Full enrollment with both user and course */
export interface EnrollmentFull extends CourseEnrollment {
  user: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
  course: {
    id: string
    title: string
    slug: string
    thumbnail_url: string | null
    category: string | null
    duration_hours: number | null
  } | null
}

/** Enrollment statistics */
export interface EnrollmentStats {
  total: number
  completed: number
  active: number
  averageProgress: number
}

/** User enrollment summary */
export interface UserEnrollmentSummary {
  totalEnrolled: number
  completedCourses: number
  inProgressCourses: number
  totalHoursLearned: number
  averageProgress: number
}

/**
 * Enrollment Repository
 * Provides all enrollment-related database operations
 */
export class EnrollmentRepository extends BaseRepository<'course_enrollments'> {
  constructor() {
    super('course_enrollments')
  }

  /**
   * Find enrollment by user and course
   */
  async findByUserAndCourse(userId: string, courseId: string): Promise<CourseEnrollment | null> {
    return this.findOne({ user_id: userId, course_id: courseId })
  }

  /**
   * Check if user is enrolled in a course
   */
  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.findByUserAndCourse(userId, courseId)
    return !!enrollment
  }

  /**
   * Get all enrollments for a user with course details
   */
  async getUserEnrollments(userId: string): Promise<EnrollmentWithCourse[]> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select(`
        *,
        course:courses(
          id,
          title,
          slug,
          thumbnail_url,
          category,
          duration_hours
        )
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      logger.error('Error fetching user enrollments', toError(error))
      throw internalError('Failed to fetch enrollments')
    }

    return (data as EnrollmentWithCourse[]) || []
  }

  /**
   * Get all enrollments for a course with user details
   */
  async getCourseEnrollments(courseId: string): Promise<EnrollmentWithUser[]> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select(`
        *,
        user:profiles(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })

    if (error) {
      logger.error('Error fetching course enrollments', toError(error))
      throw internalError('Failed to fetch enrollments')
    }

    return (data as EnrollmentWithUser[]) || []
  }

  /**
   * Get enrollment count for a user
   */
  async getUserEnrollmentCount(userId: string): Promise<number> {
    return this.count({ user_id: userId })
  }

  /**
   * Get enrollment count for a course
   */
  async getCourseEnrollmentCount(courseId: string): Promise<number> {
    return this.count({ course_id: courseId })
  }

  /**
   * Get completed enrollment count for a user
   */
  async getUserCompletedCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .not('completed_at', 'is', null)

    if (error) {
      logger.error('Error counting completed enrollments', toError(error))
      return 0
    }

    return count || 0
  }

  /**
   * Get user enrollment summary with stats
   */
  async getUserEnrollmentSummary(userId: string): Promise<UserEnrollmentSummary> {
    const enrollments = await this.getUserEnrollments(userId)

    const completed = enrollments.filter(e => e.completed_at !== null)
    const inProgress = enrollments.filter(e => e.completed_at === null)

    const totalProgress = enrollments.reduce(
      (sum, e) => sum + (e.progress_percentage || 0),
      0
    )

    const totalHours = enrollments.reduce((sum, e) => {
      const hours = e.course?.duration_hours || 0
      const progress = (e.progress_percentage || 0) / 100
      return sum + hours * progress
    }, 0)

    return {
      totalEnrolled: enrollments.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      totalHoursLearned: Math.round(totalHours * 10) / 10,
      averageProgress: enrollments.length > 0
        ? Math.round(totalProgress / enrollments.length)
        : 0
    }
  }

  /**
   * Enroll a user in a course
   */
  async enrollUser(
    userId: string,
    courseId: string,
    paymentStatus: EnrollmentPaymentStatus = 'pending',
    stripeSessionId?: string,
    amountPaid?: number
  ): Promise<CourseEnrollment> {
    // Check if already enrolled
    const existing = await this.findByUserAndCourse(userId, courseId)
    if (existing) {
      return existing
    }

    return this.create({
      user_id: userId,
      course_id: courseId,
      payment_status: paymentStatus,
      stripe_session_id: stripeSessionId,
      amount_paid: amountPaid,
      progress_percentage: 0
    })
  }

  /**
   * Update enrollment progress
   */
  async updateProgress(
    userId: string,
    courseId: string,
    progressPercentage: number
  ): Promise<CourseEnrollment> {
    const enrollment = await this.findByUserAndCourse(userId, courseId)
    if (!enrollment) {
      throw notFoundError('Enrollment')
    }

    const updateData: CourseEnrollmentUpdate = {
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      last_accessed_at: new Date().toISOString(),
      ...getUpdateTimestamp()
    }

    // Mark as completed if progress is 100%
    if (progressPercentage >= 100 && !enrollment.completed_at) {
      updateData.completed_at = new Date().toISOString()
    }

    return this.update(enrollment.id, updateData)
  }

  /**
   * Mark enrollment as completed
   */
  async markCompleted(userId: string, courseId: string): Promise<CourseEnrollment> {
    const enrollment = await this.findByUserAndCourse(userId, courseId)
    if (!enrollment) {
      throw notFoundError('Enrollment')
    }

    return this.update(enrollment.id, {
      completed_at: new Date().toISOString(),
      progress_percentage: 100,
      ...getUpdateTimestamp()
    })
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    userId: string,
    courseId: string,
    paymentStatus: EnrollmentPaymentStatus,
    stripeSessionId?: string
  ): Promise<CourseEnrollment> {
    const enrollment = await this.findByUserAndCourse(userId, courseId)
    if (!enrollment) {
      throw notFoundError('Enrollment')
    }

    const updateData: CourseEnrollmentUpdate = {
      payment_status: paymentStatus,
      ...getUpdateTimestamp()
    }

    if (stripeSessionId) {
      updateData.stripe_session_id = stripeSessionId
    }

    return this.update(enrollment.id, updateData)
  }

  /**
   * Get recent enrollments (for admin dashboard)
   */
  async getRecentEnrollments(limit: number = 10): Promise<EnrollmentFull[]> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select(`
        *,
        user:profiles(
          id,
          full_name,
          email,
          avatar_url
        ),
        course:courses(
          id,
          title,
          slug,
          thumbnail_url,
          category,
          duration_hours
        )
      `)
      .order('enrolled_at', { ascending: false })
      .limit(limit)

    if (error) {
      logger.error('Error fetching recent enrollments', toError(error))
      throw internalError('Failed to fetch recent enrollments')
    }

    return (data as EnrollmentFull[]) || []
  }

  /**
   * Get enrollment statistics for a time period
   */
  async getEnrollmentStats(fromDate?: string, toDate?: string): Promise<EnrollmentStats> {
    let query = this.supabase
      .from('course_enrollments')
      .select('progress_percentage, completed_at')

    if (fromDate) {
      query = query.gte('enrolled_at', fromDate)
    }
    if (toDate) {
      query = query.lte('enrolled_at', toDate)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching enrollment stats', toError(error))
      return { total: 0, completed: 0, active: 0, averageProgress: 0 }
    }

    const enrollments = data || []
    const completed = enrollments.filter(e => e.completed_at !== null).length
    const totalProgress = enrollments.reduce(
      (sum, e) => sum + (e.progress_percentage || 0),
      0
    )

    return {
      total: enrollments.length,
      completed,
      active: enrollments.length - completed,
      averageProgress: enrollments.length > 0
        ? Math.round(totalProgress / enrollments.length)
        : 0
    }
  }

  /**
   * Get enrollments in a date range with pagination
   */
  async getEnrollmentsInRange(
    fromDate: string,
    toDate: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<EnrollmentFull>> {
    const offset = (page - 1) * limit

    // Get count
    const { count, error: countError } = await this.supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .gte('enrolled_at', fromDate)
      .lte('enrolled_at', toDate)

    if (countError) {
      logger.error('Error counting enrollments', toError(countError))
      throw internalError('Failed to count enrollments')
    }

    // Get data
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select(`
        *,
        user:profiles(
          id,
          full_name,
          email,
          avatar_url
        ),
        course:courses(
          id,
          title,
          slug,
          thumbnail_url,
          category,
          duration_hours
        )
      `)
      .gte('enrolled_at', fromDate)
      .lte('enrolled_at', toDate)
      .order('enrolled_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('Error fetching enrollments in range', toError(error))
      throw internalError('Failed to fetch enrollments')
    }

    const total = count || 0

    return {
      data: (data as EnrollmentFull[]) || [],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Bulk get enrollment counts for multiple users (optimized for N+1)
   */
  async getBulkUserEnrollmentCounts(userIds: string[]): Promise<Map<string, number>> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select('user_id')
      .in('user_id', userIds)

    if (error) {
      logger.error('Error fetching bulk enrollment counts', toError(error))
      return new Map()
    }

    const counts = new Map<string, number>()
    userIds.forEach(id => counts.set(id, 0))

    data?.forEach(enrollment => {
      if (enrollment.user_id) {
        const current = counts.get(enrollment.user_id) || 0
        counts.set(enrollment.user_id, current + 1)
      }
    })

    return counts
  }

  /**
   * Bulk get enrollment counts for multiple courses (optimized for N+1)
   */
  async getBulkCourseEnrollmentCounts(courseIds: string[]): Promise<Map<string, number>> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select('course_id')
      .in('course_id', courseIds)

    if (error) {
      logger.error('Error fetching bulk course enrollment counts', toError(error))
      return new Map()
    }

    const counts = new Map<string, number>()
    courseIds.forEach(id => counts.set(id, 0))

    data?.forEach(enrollment => {
      if (enrollment.course_id) {
        const current = counts.get(enrollment.course_id) || 0
        counts.set(enrollment.course_id, current + 1)
      }
    })

    return counts
  }
}

// Export singleton instance
export const enrollmentRepository = new EnrollmentRepository()
