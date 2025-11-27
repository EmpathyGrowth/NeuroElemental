import { forbiddenError, successResponse, createAuthenticatedRoute } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';

/** Course record with enrollment and lesson counts */
interface CourseWithCounts {
  id: string;
  title: string;
  description: string | null;
  price: number;
  instructor_id: string;
  created_at: string;
  course_enrollments: { count: number }[];
  course_lessons: { count: number }[];
}

/** Course with calculated stats */
interface CourseWithStats extends Omit<CourseWithCounts, 'course_enrollments' | 'course_lessons'> {
  student_count: number;
  lesson_count: number;
  revenue: number;
}

/** Enrollment with user and course */
interface EnrollmentRecord {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
  course: {
    title: string;
  };
}

/** Session with client */
interface SessionRecord {
  id: string;
  therapist_id: string;
  client_id: string;
  scheduled_date: string;
  client: {
    full_name: string | null;
    email: string | null;
  };
}

/** Review rating result */
interface ReviewRating {
  rating: number;
}

export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  // Verify instructor role
  const role = await getUserRole();
  if (role !== 'instructor' && role !== 'admin') {
    throw forbiddenError('Instructor or admin access required');
  }

  const supabase = getSupabaseServer();

  // Fetch instructor's courses
  const { data: courses } = await supabase
    .from('courses')
    .select(`
        *,
        course_enrollments(count),
        course_lessons(count)
      `)
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false }) as { data: CourseWithCounts[] | null; error: unknown };

  // Calculate total students and revenue
  let totalStudents = 0;
  let totalRevenue = 0;
  let totalLessons = 0;

  const coursesWithStats: CourseWithStats[] = courses?.map((course) => {
    const studentCount = course.course_enrollments?.[0]?.count || 0;
    const lessonCount = course.course_lessons?.[0]?.count || 0;
    const revenue = studentCount * (course.price || 0);

    totalStudents += studentCount;
    totalRevenue += revenue;
    totalLessons += lessonCount;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      instructor_id: course.instructor_id,
      created_at: course.created_at,
      student_count: studentCount,
      lesson_count: lessonCount,
      revenue: revenue,
    };
  }) || [];

  // Fetch recent enrollments
  const courseIds = courses?.map((c) => c.id) || [];
  const { data: recentEnrollments } = await supabase
    .from('course_enrollments')
    .select(`
        *,
        user:profiles!course_enrollments_user_id_fkey(
          id,
          full_name,
          email,
          avatar_url
        ),
        course:courses(
          title
        )
      `)
    .in('course_id', courseIds)
    .order('enrolled_at', { ascending: false })
    .limit(10) as { data: EnrollmentRecord[] | null; error: unknown };

  // Fetch upcoming sessions (if instructor has sessions)
  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select(`
        *,
        client:profiles!sessions_client_id_fkey(
          full_name,
          email
        )
      `)
    .eq('therapist_id', user.id)
    .gte('scheduled_date', new Date().toISOString())
    .order('scheduled_date', { ascending: true })
    .limit(5) as { data: SessionRecord[] | null; error: unknown };

  // Calculate average rating from course_reviews
  const { data: reviews } = await supabase
    .from('course_reviews')
    .select('rating')
    .in('course_id', courseIds) as { data: ReviewRating[] | null; error: unknown };

  const avgRating = reviews?.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return successResponse({
    stats: {
      total_courses: courses?.length || 0,
      total_students: totalStudents,
      total_revenue: totalRevenue,
      average_rating: avgRating,
      total_lessons: totalLessons,
    },
    courses: coursesWithStats,
    recent_enrollments: recentEnrollments,
    upcoming_sessions: upcomingSessions,
  });
});

