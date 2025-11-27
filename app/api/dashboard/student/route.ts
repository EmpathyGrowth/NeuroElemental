import { successResponse, createAuthenticatedRoute } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  last_accessed_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    instructor: {
      full_name: string;
    };
  };
}

interface EnrollmentWithProgress extends Enrollment {
  progress_percentage: number;
  total_lessons: number;
  completed_lessons: number;
}

/** Lesson record for progress calculation */
interface LessonRecord {
  id: string;
  course_id: string;
}

/** Lesson completion record */
interface LessonCompletionRecord {
  lesson_id: string;
}

/** Certificate record */
interface CertificateRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  issued_at: string;
}

/** Event registration with event details */
interface EventRegistrationRecord {
  id: string;
  user_id: string;
  event_id: string;
  event: {
    id: string;
    title: string;
    start_date: string;
    end_date: string | null;
    location: string | null;
    type: string;
  };
}

/** Assessment record */
interface AssessmentRecord {
  id: string;
  user_id: string;
  created_at: string;
}

export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer();

  // Fetch user's course enrollments with progress
  const { data: enrollments } = await supabase
    .from('course_enrollments')
    .select(`
        *,
        course:courses(
          id,
          title,
          description,
          thumbnail_url,
          instructor:profiles(full_name)
        )
      `)
    .eq('user_id', user.id)
    .order('last_accessed_at', { ascending: false }) as { data: Enrollment[] | null; error: unknown };

  // Calculate progress for each enrollment (optimized - no N+1 queries)
  if (!enrollments || enrollments.length === 0) {
    return successResponse({
      stats: {
        courses_enrolled: 0,
        certificates_earned: 0,
        upcoming_events: 0,
        learning_progress: 0,
      },
      enrollments: [],
      certificates: [],
      events: [],
      assessment: null,
    });
  }

  const courseIds = enrollments.map((e) => e.course_id);

  // Get all lessons for all enrolled courses in one query
  const { data: allLessons } = await supabase
    .from('course_lessons')
    .select('id, course_id')
    .in('course_id', courseIds) as { data: LessonRecord[] | null; error: unknown };

  // Get all lesson completions for this user in one query
  const lessonIds = allLessons?.map((l) => l.id) || [];
  const { data: allCompletions } = await supabase
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds) as { data: LessonCompletionRecord[] | null; error: unknown };

  // Build lookup maps
  const lessonsByCourse = new Map<string, string[]>();
  allLessons?.forEach((lesson) => {
    const existing = lessonsByCourse.get(lesson.course_id) || [];
    existing.push(lesson.id);
    lessonsByCourse.set(lesson.course_id, existing);
  });

  const completedLessonIds = new Set(allCompletions?.map((c) => c.lesson_id) || []);

  // Map enrollments with progress (O(n) operation)
  const enrollmentsWithProgress: EnrollmentWithProgress[] = enrollments.map((enrollment) => {
    const courseLessons = lessonsByCourse.get(enrollment.course_id) || [];
    const completedCount = courseLessons.filter(id => completedLessonIds.has(id)).length;
    const totalCount = courseLessons.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      ...enrollment,
      progress_percentage: progress,
      total_lessons: totalCount,
      completed_lessons: completedCount,
    };
  });

  // Fetch user's certificates
  const { data: certificates } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false }) as { data: CertificateRecord[] | null; error: unknown };

  // Fetch upcoming events
  const { data: events } = await supabase
    .from('event_registrations')
    .select(`
        *,
        event:events(
          id,
          title,
          start_date,
          end_date,
          location,
          type
        )
      `)
    .eq('user_id', user.id)
    .gte('events.start_date', new Date().toISOString())
    .order('events.start_date', { ascending: true })
    .limit(5) as { data: EventRegistrationRecord[] | null; error: unknown };

  // Fetch user's assessment results
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: AssessmentRecord | null; error: unknown };

  // Calculate overall learning progress
  const totalEnrolledCourses = enrollments.length;
  const overallProgress = totalEnrolledCourses > 0
    ? Math.round(
      enrollmentsWithProgress.reduce((acc, e) => acc + e.progress_percentage, 0) /
      totalEnrolledCourses
    )
    : 0;

  return successResponse({
    stats: {
      courses_enrolled: totalEnrolledCourses,
      certificates_earned: certificates?.length || 0,
      upcoming_events: events?.length || 0,
      learning_progress: overallProgress,
    },
    enrollments: enrollmentsWithProgress,
    certificates,
    events,
    assessment: assessments,
  });
});

