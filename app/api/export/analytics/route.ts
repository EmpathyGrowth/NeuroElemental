import { forbiddenError, getQueryParam, successResponse, createAuthenticatedRoute } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { getCurrentTimestamp } from '@/lib/utils';
import ExcelJS from 'exceljs';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

interface QueryDataResult<T> {
  data: T[] | null;
  error: unknown;
}

/** Profile with role */
interface ProfileRole {
  role: string;
}

/** Credit transaction record (as proxy for payments) */
interface CreditTransactionRecord {
  amount: number;
  created_at: string;
  transaction_type: string;
  metadata?: { price?: number; description?: string };
}

/** Enrollment with user and course */
interface EnrollmentWithDetails {
  created_at: string;
  progress: number | null;
  status: string;
  completed_at: string | null;
  user?: { full_name: string | null; email: string | null };
  course?: { title: string; category: string | null };
}

/** Session with participants */
interface SessionWithParticipants {
  status: string;
  scheduled_at: string;
  student?: { full_name: string | null };
  instructor?: { full_name: string | null };
}

/** Course progress record */
interface CourseProgressRecord {
  progress_percentage: number;
  last_activity_at: string | null;
  user?: { full_name: string | null };
  course?: { title: string };
}

/** Instructor profile with stats */
interface InstructorProfile {
  full_name: string | null;
  email: string | null;
  courses_created?: unknown[];
  sessions_conducted?: unknown[];
  reviews_received?: { rating: number }[];
}

/** Analytics data structure */
interface AnalyticsData {
  reportType: string;
  generatedAt: string;
  generatedBy: string | undefined;
  period: { start: string; end: string };
  overview?: Record<string, unknown>;
  enrollments?: Record<string, unknown>[];
  revenue?: Record<string, unknown>;
  engagement?: Record<string, unknown>;
  instructors?: Record<string, unknown>[];
  [key: string]: unknown;
}

/** Revenue by month structure */
interface RevenueByMonth {
  count: number;
  total: number;
  payments: { date: string; amount: number; type: string; user: string | null }[];
}

export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();

  // Check if user is admin, instructor, business, or school
  const role = await getUserRole();
  if (!role || !['admin', 'instructor', 'business', 'school'].includes(role)) {
    throw forbiddenError('Access denied');
  }

  const format = getQueryParam(request, 'format') || 'json';
  const reportType = getQueryParam(request, 'report') || 'overview';
  const startDate = getQueryParam(request, 'startDate');
  const endDate = getQueryParam(request, 'endDate');

  const analyticsData: AnalyticsData = {
    reportType,
    generatedAt: getCurrentTimestamp(),
    generatedBy: user.email,
    period: {
      start: startDate || 'all-time',
      end: endDate || 'current'
    }
  };

  switch (reportType) {
    case 'overview':
      // Platform overview for admins
      if (role === 'admin') {
        // User statistics
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true }) as { count: number | null; error: unknown };

        const { data: profileRoles } = await supabase
          .from('profiles')
          .select('role') as { data: ProfileRole[] | null; error: unknown };

        const usersByRole: Record<string, number> = {};
        profileRoles?.forEach((profile) => {
          usersByRole[profile.role] = (usersByRole[profile.role] || 0) + 1;
        });

        // Course statistics
        const { count: totalCourses } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true }) as { count: number | null; error: unknown };

        const { count: totalEnrollments } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true }) as { count: number | null; error: unknown };

        // Revenue statistics (from credit transactions)
        const { data: revenueData } = await supabase
          .from('credit_transactions')
          .select('amount, metadata')
          .eq('transaction_type', 'add') as { data: CreditTransactionRecord[] | null; error: unknown };

        const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.metadata?.price || 0), 0) || 0;

        analyticsData.overview = {
          users: {
            total: totalUsers || 0,
            byRole: usersByRole
          },
          courses: {
            total: totalCourses || 0,
            totalEnrollments: totalEnrollments || 0
          },
          revenue: {
            total: totalRevenue,
            currency: 'USD'
          }
        };
      }
      break;

    case 'enrollments':
      // Course enrollment analytics
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select(`
            *,
            user:profiles(full_name, email),
            course:courses(title, category)
          `)
        .order('created_at', { ascending: false }) as { data: EnrollmentWithDetails[] | null; error: unknown };

      analyticsData.enrollments = enrollments?.map((e) => ({
        enrolledAt: e.created_at,
        studentName: e.user?.full_name,
        studentEmail: e.user?.email,
        courseTitle: e.course?.title,
        courseCategory: e.course?.category,
        progress: e.progress,
        status: e.status,
        completedAt: e.completed_at
      })) || [];
      break;

    case 'revenue':
      // Revenue analytics (from credit transactions)
      if (role === 'admin') {
        const { data: transactions } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('transaction_type', 'add')
          .order('created_at', { ascending: false }) as { data: CreditTransactionRecord[] | null; error: unknown };

        // Group by month
        const revenueByMonth: Record<string, RevenueByMonth> = {};
        transactions?.forEach((t) => {
          const month = new Date(t.created_at).toISOString().slice(0, 7);
          const price = t.metadata?.price || 0;
          if (!revenueByMonth[month]) {
            revenueByMonth[month] = {
              count: 0,
              total: 0,
              payments: []
            };
          }
          revenueByMonth[month].count++;
          revenueByMonth[month].total += price;
          revenueByMonth[month].payments.push({
            date: t.created_at,
            amount: price,
            type: t.transaction_type,
            user: null
          });
        });

        analyticsData.revenue = {
          total: transactions?.reduce((sum, t) => sum + (t.metadata?.price || 0), 0) || 0,
          byMonth: revenueByMonth,
          transactions: transactions?.length || 0
        };
      }
      break;

    case 'engagement':
      // User engagement analytics
      const { data: sessions } = await supabase
        .from('sessions')
        .select(`
            *,
            student:profiles!sessions_student_id_fkey(full_name),
            instructor:profiles!sessions_instructor_id_fkey(full_name)
          `)
        .order('scheduled_at', { ascending: false }) as { data: SessionWithParticipants[] | null; error: unknown };

      const { data: courseProgress } = await supabase
        .from('course_progress')
        .select(`
            *,
            user:profiles(full_name),
            course:courses(title)
          `) as { data: CourseProgressRecord[] | null; error: unknown };

      analyticsData.engagement = {
        sessions: {
          total: sessions?.length || 0,
          completed: (sessions || []).filter((s) => s.status === 'completed').length,
          upcoming: (sessions || []).filter((s) => s.status === 'scheduled').length
        },
        courseProgress: courseProgress?.map((cp) => ({
          student: cp.user?.full_name,
          course: cp.course?.title,
          progress: cp.progress_percentage,
          lastActivity: cp.last_activity_at
        })) || []
      };
      break;

    case 'instructors':
      // Instructor performance analytics
      if (role === 'admin') {
        // Use type assertion to avoid TS2589 (type instantiation too deep)
         
        const instructorQuery = supabase.from('profiles') as any;
        const { data: instructors } = await instructorQuery
          .select(`
              *,
              courses_created:courses(count),
              sessions_conducted:sessions!sessions_instructor_id_fkey(count),
              reviews_received:reviews(rating)
            `)
          .eq('role', 'instructor') as QueryDataResult<InstructorProfile>;

        analyticsData.instructors = instructors?.map((instructor) => {
          const reviews = instructor.reviews_received || [];
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : null;

          return {
            name: instructor.full_name,
            email: instructor.email,
            coursesCreated: instructor.courses_created?.length || 0,
            sessionsConducted: instructor.sessions_conducted?.length || 0,
            averageRating: avgRating,
            totalReviews: reviews.length
          };
        }) || [];
      }
      break;
  }

  // Format response based on requested format
  if (format === 'excel') {
    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NeuroElemental';
    workbook.created = new Date();

    // Add metadata sheet
    const metaSheet = workbook.addWorksheet('Report Info');
    metaSheet.addRow(['Report Type', reportType]);
    metaSheet.addRow(['Generated At', getCurrentTimestamp()]);
    metaSheet.addRow(['Generated By', user.email]);
    metaSheet.addRow(['Period Start', startDate || 'All Time']);
    metaSheet.addRow(['Period End', endDate || 'Current']);

    // Add data sheets based on report type
    Object.keys(analyticsData).forEach(key => {
      if (key === 'reportType' || key === 'generatedAt' || key === 'generatedBy' || key === 'period') return;

      const dataSheet = workbook.addWorksheet(key);
      const data = analyticsData[key];

      if (Array.isArray(data)) {
        // Add headers
        if (data.length > 0) {
          dataSheet.addRow(Object.keys(data[0]));
          // Add data rows
          data.forEach(row => {
            dataSheet.addRow(Object.values(row));
          });
        }
      } else if (typeof data === 'object' && data !== null) {
        // Add key-value pairs
        Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
          if (typeof v === 'object') {
            dataSheet.addRow([k, JSON.stringify(v)]);
          } else {
            dataSheet.addRow([k, v as string | number | boolean]);
          }
        });
      }
    });

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="analytics-${reportType}-${Date.now()}.xlsx"`
      }
    });
  } else if (format === 'csv') {
    // For CSV, flatten the data structure
    let csvData = '';

    Object.keys(analyticsData).forEach(key => {
      if (key === 'reportType' || key === 'generatedAt' || key === 'generatedBy' || key === 'period') return;

      const data = analyticsData[key];
      if (Array.isArray(data) && data.length > 0) {
        csvData += `\n\n${key.toUpperCase()}\n`;
        csvData += Papa.unparse(data);
      }
    });

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-${reportType}-${Date.now()}.csv"`
      }
    });
  } else {
    // Return as JSON
    return successResponse(analyticsData);
  }
});

