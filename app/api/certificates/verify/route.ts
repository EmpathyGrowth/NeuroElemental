import { createPublicRoute, successResponse, badRequestError, notFoundError, getQueryParam } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

interface CertificateWithDetails {
  id: string;
  user_id: string | null;
  course_id: string | null;
  verification_code: string;
  issued_at: string | null;
  user: {
    full_name: string | null;
  } | null;
  course: {
    title: string;
    duration_hours: number | null;
    category: string | null;
  } | null;
}

/**
 * GET /api/certificates/verify?code=XXX
 * Verify a certificate by its verification code (public endpoint)
 */
export const GET = createPublicRoute(async (request) => {
  const code = getQueryParam(request, 'code');

  if (!code) {
    throw badRequestError('Verification code is required');
  }

  const supabase = await getSupabaseServer();

  const { data: certificate, error } = await supabase
    .from('certificates')
    .select(`
      id,
      user_id,
      course_id,
      verification_code,
      issued_at,
      user:profiles(
        full_name
      ),
      course:courses(
        title,
        duration_hours,
        category
      )
    `)
    .eq('verification_code', code)
    .single() as { data: CertificateWithDetails | null; error: { message: string } | null };

  if (error || !certificate) {
    throw notFoundError('Certificate not found. Please check the verification code.');
  }

  return successResponse({
    valid: true,
    certificate: {
      recipientName: certificate.user?.full_name || 'Unknown',
      courseTitle: certificate.course?.title || 'Unknown Course',
      courseCategory: certificate.course?.category,
      courseDuration: certificate.course?.duration_hours,
      issuedAt: certificate.issued_at,
      verificationCode: certificate.verification_code,
    },
  });
});
