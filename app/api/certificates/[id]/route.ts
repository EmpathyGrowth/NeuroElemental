import { RouteContext } from '@/lib/types/api';
import { NextRequest } from 'next/server';
import { getSupabaseServer } from '@/lib/db';
import { createAuthenticatedRoute, notFoundError, forbiddenError, successResponse } from '@/lib/api';

interface CertificateRow {
  id: string;
  user_id: string | null;
  course_id: string | null;
  verification_code: string;
  certificate_url: string | null;
  issued_at: string | null;
  course: {
    id: string;
    title: string;
    duration_hours: number | null;
    category: string | null;
    instructor_name: string | null;
  } | null;
  user: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

/**
 * GET /api/certificates/[id]
 * Get a single certificate by ID
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const { id } = await context.params;
    const supabase = await getSupabaseServer();

    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        id,
        user_id,
        course_id,
        verification_code,
        certificate_url,
        issued_at,
        course:courses(
          id,
          title,
          duration_hours,
          category,
          instructor_name
        ),
        user:profiles(
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .single() as { data: CertificateRow | null; error: { message: string } | null };

    if (error || !certificate) {
      throw notFoundError('Certificate');
    }

    // Ensure user owns this certificate
    if (certificate.user_id !== user.id) {
      throw forbiddenError('You do not have access to this certificate');
    }

    return successResponse({
      certificate: {
        id: certificate.id,
        recipientName: certificate.user?.full_name || 'Student',
        recipientEmail: certificate.user?.email,
        courseTitle: certificate.course?.title || 'Unknown Course',
        courseCategory: certificate.course?.category,
        courseDuration: certificate.course?.duration_hours,
        instructorName: certificate.course?.instructor_name || 'Jannik Laursen',
        issuedAt: certificate.issued_at,
        verificationCode: certificate.verification_code,
        certificateUrl: certificate.certificate_url,
      },
    });
  }
);
