import { badRequestError, createAuthenticatedRoute, getQueryParam, internalError, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { getCurrentTimestamp } from '@/lib/utils';
import { NextResponse } from 'next/server';
import Papa from 'papaparse';

/** Profile record from database */
interface ProfileRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  [key: string]: unknown;
}

/** Assessment result record */
interface AssessmentResultRecord {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number | null;
  completed_at: string | null;
  created_at: string;
  [key: string]: unknown;
}

/** Course info for joins */
interface CourseInfo {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

/** Enrollment record with course */
interface EnrollmentRecord {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  course?: CourseInfo;
  [key: string]: unknown;
}

/** Course progress record */
interface CourseProgressRecord {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  [key: string]: unknown;
}

/** Instructor info for sessions */
interface InstructorInfo {
  full_name: string | null;
  email: string | null;
}

/** Session record with instructor */
interface SessionRecord {
  id: string;
  student_id: string;
  instructor_id: string;
  scheduled_at: string;
  status: string;
  instructor?: InstructorInfo;
  [key: string]: unknown;
}

/** Payment record */
interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

/** Invoice record */
interface InvoiceRecord {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  [key: string]: unknown;
}

/** Subscription record */
interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  [key: string]: unknown;
}

/** Certification record with course */
interface CertificationRecord {
  id: string;
  user_id: string;
  course_id: string;
  issued_at: string;
  course?: { id: string; title: string };
  [key: string]: unknown;
}

/** Review record with course */
interface ReviewRecord {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  content: string | null;
  course?: { id: string; title: string };
  [key: string]: unknown;
}

/** Exported user data structure */
interface ExportedUserData {
  exportDate: string;
  userId: string;
  email: string | undefined;
  profile?: ProfileRecord | null;
  assessments?: AssessmentResultRecord[];
  enrollments?: EnrollmentRecord[];
  courseProgress?: CourseProgressRecord[];
  sessions?: SessionRecord[];
  payments?: PaymentRecord[];
  invoices?: InvoiceRecord[];
  subscriptions?: SubscriptionRecord[];
  certifications?: CertificationRecord[];
  reviews?: ReviewRecord[];
}

/** CSV data structure */
interface CsvDataExport {
  profile?: string;
  assessments?: string;
  enrollments?: string;
  sessions?: string;
  payments?: string;
  certifications?: string;
}

export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();

  const format = getQueryParam(request, 'format') || 'json';
  const dataType = getQueryParam(request, 'type') || 'all';

  // Collect all user data
  const userData: ExportedUserData = {
    exportDate: getCurrentTimestamp(),
    userId: user.id,
    email: user.email,
  };

  // Fetch profile data
  if (dataType === 'all' || dataType === 'profile') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: ProfileRecord | null; error: unknown };

    userData.profile = profile;
  }

  // Fetch assessment results
  if (dataType === 'all' || dataType === 'assessments') {
    const { data: assessments } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as { data: AssessmentResultRecord[] | null; error: unknown };

    userData.assessments = assessments || [];
  }

  // Fetch course enrollments
  if (dataType === 'all' || dataType === 'courses') {
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select(`
          *,
          course:courses(
            id,
            title,
            description,
            category
          )
        `)
      .eq('user_id', user.id) as { data: EnrollmentRecord[] | null; error: unknown };

    userData.enrollments = enrollments || [];

    // Fetch course progress
    const { data: progress } = await supabase
      .from('course_progress')
      .select('*')
      .eq('user_id', user.id) as { data: CourseProgressRecord[] | null; error: unknown };

    userData.courseProgress = progress || [];
  }

  // Fetch sessions
  if (dataType === 'all' || dataType === 'sessions') {
    const { data: sessions } = await supabase
      .from('sessions')
      .select(`
          *,
          instructor:profiles!sessions_instructor_id_fkey(
            full_name,
            email
          )
        `)
      .eq('student_id', user.id)
      .order('scheduled_at', { ascending: false }) as { data: SessionRecord[] | null; error: unknown };

    userData.sessions = sessions || [];
  }

  // Fetch credit transactions (as proxy for payments)
  if (dataType === 'all' || dataType === 'payments') {
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }) as { data: PaymentRecord[] | null; error: unknown };

    userData.payments = transactions || [];

    // Fetch invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id) as { data: InvoiceRecord[] | null; error: unknown };

    userData.invoices = invoices || [];
  }

  // Fetch subscriptions
  if (dataType === 'all' || dataType === 'subscriptions') {
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id) as { data: SubscriptionRecord[] | null; error: unknown };

    userData.subscriptions = subscriptions || [];
  }

  // Fetch certificates
  if (dataType === 'all' || dataType === 'certifications') {
    const { data: certifications } = await supabase
      .from('certificates')
      .select(`
          *,
          course:courses(
            id,
            title
          )
        `)
      .eq('user_id', user.id) as { data: CertificationRecord[] | null; error: unknown };

    userData.certifications = certifications || [];
  }

  // Fetch course reviews
  if (dataType === 'all' || dataType === 'reviews') {
    const { data: reviews } = await supabase
      .from('course_reviews')
      .select(`
          *,
          course:courses(
            id,
            title
          )
        `)
      .eq('user_id', user.id) as { data: ReviewRecord[] | null; error: unknown };

    userData.reviews = reviews || [];
  }

  // Format the response based on requested format
  if (format === 'csv') {
    // For CSV, we'll create separate sheets for each data type
    const csvData: CsvDataExport = {};

    if (userData.profile) {
      csvData.profile = Papa.unparse([userData.profile]);
    }
    if (userData.assessments?.length) {
      csvData.assessments = Papa.unparse(userData.assessments);
    }
    if (userData.enrollments?.length) {
      csvData.enrollments = Papa.unparse(userData.enrollments.map((e) => ({
        ...e,
        course_title: e.course?.title,
        course_category: e.course?.category
      })));
    }
    if (userData.sessions?.length) {
      csvData.sessions = Papa.unparse(userData.sessions.map((s) => ({
        ...s,
        instructor_name: s.instructor?.full_name,
        instructor_email: s.instructor?.email
      })));
    }
    if (userData.payments?.length) {
      csvData.payments = Papa.unparse(userData.payments);
    }
    if (userData.certifications?.length) {
      csvData.certifications = Papa.unparse(userData.certifications.map((c) => ({
        ...c,
        course_title: c.course?.title
      })));
    }

    // Return as multipart CSV (simplified for now - returns main data)
    const mainCsv = Papa.unparse([userData.profile || {}]);

    return new NextResponse(mainCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="neuroelemental-export-${Date.now()}.csv"`
      }
    });
  } else {
    // Return as JSON with download headers
    const response = successResponse(userData);
    response.headers.set('Content-Disposition', `attachment; filename="neuroelemental-export-${Date.now()}.json"`);
    return response;
  }
});

/**
 * DELETE /api/export/user-data
 * Delete user data (GDPR compliance)
 */
export const DELETE = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();

  const confirmDelete = getQueryParam(request, 'confirm') === 'true';

  if (!confirmDelete) {
    throw badRequestError('Please confirm deletion by setting confirm=true');
  }

  // Soft delete user profile (preserves data for legal requirements)
  const deleteData = {
    deleted_at: getCurrentTimestamp(),
    email: `deleted_${user.id}@deleted.com`,
    full_name: 'Deleted User',
    avatar_url: null,
    bio: null,
    location: null,
    phone: null,
    linkedin_url: null,
    github_url: null,
    website_url: null
  };

  const { error: profileError } = await (supabase as any)
    .from('profiles')
    .update(deleteData)
    .eq('id', user.id);

  if (profileError) {
    logger.error('Error deleting profile', undefined, { errorMsg: profileError.message });
    throw internalError('Failed to delete profile');
  }

  // Delete auth user
  const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteError) {
    logger.error('Error deleting auth user', undefined, { errorMsg: deleteError.message });
    throw internalError('Failed to delete account');
  }

  return successResponse({
    success: true,
    message: 'Your account and associated data have been deleted'
  });
});

