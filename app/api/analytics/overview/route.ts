import { getSupabaseServer } from '@/lib/db';
import { getCurrentTimestamp } from '@/lib/utils';
import { createAuthenticatedRoute, successResponse } from '@/lib/api';

/** Enrollment record with timestamp */
interface EnrollmentRecord {
  enrolled_at: string;
}

/** Credit transaction record */
interface CreditTransactionRecord {
  amount: number;
  created_at: string;
  metadata: { price?: number } | null;
}

/** Course with nested counts */
interface CourseWithCounts {
  id: string;
  title: string;
  price?: number;
  course_enrollments?: { count: number }[];
  course_lessons?: { count: number }[];
}

/** Lesson record */
interface LessonRecord {
  id: string;
}

/** Active user record */
interface ActiveUserRecord {
  user_id: string;
}

/** Course revenue data for sorting */
interface CourseRevenue {
  course_id: string;
  course_title: string;
  enrollment_count: number;
  revenue: number;
}

export const GET = createAuthenticatedRoute(async (request, _context, _user) => {
  const supabase = getSupabaseServer();

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Time series data for enrollments
  const { data: enrollmentTimeSeries } = await supabase
    .from('course_enrollments')
    .select('enrolled_at')
    .gte('enrolled_at', startDate.toISOString())
    .order('enrolled_at', { ascending: true }) as { data: EnrollmentRecord[] | null; error: unknown };

  // Group enrollments by day
  const enrollmentsByDay: Record<string, number> = {};
  enrollmentTimeSeries?.forEach((enrollment) => {
    const date = new Date(enrollment.enrolled_at).toISOString().split('T')[0];
    enrollmentsByDay[date] = (enrollmentsByDay[date] || 0) + 1;
  });

  const enrollmentChartData = Object.entries(enrollmentsByDay).map(([date, count]) => ({
    date,
    count,
  }));

  // Time series data for revenue (using credit transactions with price metadata)
  const { data: creditTransactions } = await supabase
    .from('credit_transactions')
    .select('amount, created_at, metadata')
    .gte('created_at', startDate.toISOString())
    .eq('transaction_type', 'add')
    .order('created_at', { ascending: true }) as { data: CreditTransactionRecord[] | null; error: unknown };

  // Group transactions by day, using metadata.price if available
  const revenueByDay: Record<string, number> = {};
  creditTransactions?.forEach((tx) => {
    const date = new Date(tx.created_at).toISOString().split('T')[0];
    const price = tx.metadata?.price || tx.amount;
    revenueByDay[date] = (revenueByDay[date] || 0) + price;
  });

  const revenueChartData = Object.entries(revenueByDay).map(([date, amount]) => ({
    date,
    amount,
  }));

  // Course completion rates
  const { data: courses } = await supabase
    .from('courses')
    .select(`
        id,
        title,
        course_enrollments(count),
        course_lessons(count)
      `) as { data: CourseWithCounts[] | null; error: unknown };

  const courseCompletionRates = await Promise.all(
    (courses || []).map(async (course) => {
      const enrollmentCount = course.course_enrollments?.[0]?.count || 0;
      const lessonCount = course.course_lessons?.[0]?.count || 0;

      if (enrollmentCount === 0 || lessonCount === 0) {
        return {
          course_id: course.id,
          course_title: course.title,
          completion_rate: 0,
          enrollment_count: enrollmentCount,
        };
      }

      // Get lesson IDs for this course
      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id')
        .eq('course_id', course.id) as { data: LessonRecord[] | null; error: unknown };

      const lessonIds = lessons?.map((l) => l.id) || [];

      // Count completions
      const { count: completionCount } = await supabase
        .from('lesson_completions')
        .select('*', { count: 'exact', head: true })
        .in('lesson_id', lessonIds) as { count: number | null; error: unknown };

      const expectedCompletions = enrollmentCount * lessonCount;
      const completionRate = expectedCompletions > 0
        ? Math.round(((completionCount || 0) / expectedCompletions) * 100)
        : 0;

      return {
        course_id: course.id,
        course_title: course.title,
        completion_rate: completionRate,
        enrollment_count: enrollmentCount,
        total_completions: completionCount || 0,
        expected_completions: expectedCompletions,
      };
    })
  );

  // Top performing courses (by revenue)
  const { data: topCourses } = await supabase
    .from('courses')
    .select(`
        id,
        title,
        price,
        course_enrollments(count)
      `)
    .order('price', { ascending: false })
    .limit(10) as { data: CourseWithCounts[] | null; error: unknown };

  const topCoursesWithRevenue = topCourses?.map((course): CourseRevenue => {
    const enrollmentCount = course.course_enrollments?.[0]?.count || 0;
    const revenue = enrollmentCount * (course.price || 0);
    return {
      course_id: course.id,
      course_title: course.title,
      enrollment_count: enrollmentCount,
      revenue,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // User engagement metrics
  const { data: activeUsers } = await supabase
    .from('lesson_completions')
    .select('user_id')
    .gte('completed_at', startDate.toISOString()) as { data: ActiveUserRecord[] | null; error: unknown };

  const uniqueActiveUsers = new Set(activeUsers?.map((u) => u.user_id)).size;

  // Assessment completion count (using assessment_results table)
  const { count: assessmentCount } = await supabase
    .from('assessment_results')
    .select('*', { count: 'exact', head: true })
    .gte('completed_at', startDate.toISOString());

  return successResponse({
    time_range: {
      start_date: startDate.toISOString(),
      end_date: getCurrentTimestamp(),
      days,
    },
    time_series: {
      enrollments: enrollmentChartData,
      revenue: revenueChartData,
    },
    course_analytics: {
      completion_rates: courseCompletionRates,
      top_performers: topCoursesWithRevenue,
    },
    engagement: {
      active_users: uniqueActiveUsers,
      total_assessments_completed: assessmentCount || 0,
    },
  });
})

