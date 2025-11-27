/**
 * Student Courses API Route
 * Fetch student's enrolled and completed courses
 */

import { createAuthenticatedRoute, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'

interface CourseEnrollment {
  id: string
  course_id: string
  status: string
  enrolled_at: string
  last_accessed_at: string | null
  completed_at: string | null
  course: {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnail_url: string | null
  }
}

interface LessonRecord {
  id: string
  course_id: string
  title: string
}

interface LessonCompletionRecord {
  lesson_id: string
}

interface CertificateRecord {
  id: string
  course_id: string | null
  type: string
  title: string
  issued_at: string
}

export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer()

  // Fetch all enrollments for this user
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select(`
      id,
      course_id,
      status,
      enrolled_at,
      last_accessed_at,
      completed_at,
      course:courses(
        id,
        title,
        slug,
        description,
        thumbnail_url
      )
    `)
    .eq('user_id', user.id)
    .order('last_accessed_at', { ascending: false, nullsFirst: false }) as { data: CourseEnrollment[] | null; error: unknown }

  if (!enrollments || enrollments.length === 0) {
    return successResponse({
      stats: {
        enrolled_count: 0,
        completed_count: 0,
        average_progress: 0,
        certificates_count: 0,
      },
      enrolled_courses: [],
      completed_courses: [],
    })
  }

  // Get all course IDs
  const courseIds = enrollments.map(e => e.course_id)

  // Get all lessons for all enrolled courses in one query
  const { data: allLessons } = await supabase
    .from('course_lessons')
    .select('id, course_id, title')
    .in('course_id', courseIds)
    .order('order_index', { ascending: true }) as { data: LessonRecord[] | null; error: unknown }

  // Get all lesson completions for this user in one query
  const lessonIds = allLessons?.map(l => l.id) || []
  const { data: allCompletions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds) as { data: LessonCompletionRecord[] | null; error: unknown }

  // Build lookup maps
  const lessonsByCourse = new Map<string, LessonRecord[]>()
  allLessons?.forEach(lesson => {
    const existing = lessonsByCourse.get(lesson.course_id) || []
    existing.push(lesson)
    lessonsByCourse.set(lesson.course_id, existing)
  })

  const completedLessonIds = new Set(allCompletions?.map(c => c.lesson_id) || [])

  // Fetch certificates for completed courses
  const { data: certificates } = await supabase
    .from('certificates')
    .select('id, course_id, type, title, issued_at')
    .eq('user_id', user.id)
    .eq('type', 'course_completion') as { data: CertificateRecord[] | null; error: unknown }

  const certificatesByCourse = new Map<string, CertificateRecord>()
  certificates?.forEach(cert => {
    if (cert.course_id) {
      certificatesByCourse.set(cert.course_id, cert)
    }
  })

  // Process enrollments
  const enrolledCourses: Array<{
    id: string
    course_id: string
    course_title: string
    course_slug: string
    thumbnail_url: string | null
    progress: number
    total_lessons: number
    completed_lessons: number
    last_lesson: string | null
    enrolled_at: string
    last_accessed: string | null
  }> = []

  const completedCourses: Array<{
    id: string
    course_id: string
    course_title: string
    course_slug: string
    thumbnail_url: string | null
    completed_at: string
    certificate_id: string | null
  }> = []

  enrollments.forEach(enrollment => {
    const courseLessons = lessonsByCourse.get(enrollment.course_id) || []
    const completedCount = courseLessons.filter(l => completedLessonIds.has(l.id)).length
    const totalCount = courseLessons.length
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    // Find the next lesson (first incomplete lesson)
    const nextLesson = courseLessons.find(l => !completedLessonIds.has(l.id))

    if (enrollment.status === 'completed' || progress === 100) {
      const cert = certificatesByCourse.get(enrollment.course_id)
      completedCourses.push({
        id: enrollment.id,
        course_id: enrollment.course_id,
        course_title: enrollment.course?.title || 'Unknown Course',
        course_slug: enrollment.course?.slug || enrollment.course_id,
        thumbnail_url: enrollment.course?.thumbnail_url || null,
        completed_at: enrollment.completed_at || enrollment.last_accessed_at || enrollment.enrolled_at,
        certificate_id: cert?.id || null,
      })
    } else {
      enrolledCourses.push({
        id: enrollment.id,
        course_id: enrollment.course_id,
        course_title: enrollment.course?.title || 'Unknown Course',
        course_slug: enrollment.course?.slug || enrollment.course_id,
        thumbnail_url: enrollment.course?.thumbnail_url || null,
        progress,
        total_lessons: totalCount,
        completed_lessons: completedCount,
        last_lesson: nextLesson?.title || null,
        enrolled_at: enrollment.enrolled_at,
        last_accessed: enrollment.last_accessed_at,
      })
    }
  })

  // Calculate stats
  const averageProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
    : 0

  return successResponse({
    stats: {
      enrolled_count: enrolledCourses.length,
      completed_count: completedCourses.length,
      average_progress: averageProgress,
      certificates_count: certificates?.length || 0,
    },
    enrolled_courses: enrolledCourses,
    completed_courses: completedCourses,
  })
})
