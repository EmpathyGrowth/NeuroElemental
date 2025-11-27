import { createAuthenticatedRoute, successResponse, badRequestError } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

interface CertificateRow {
  id: string;
  user_id: string | null;
  course_id: string | null;
  enrollment_id: string | null;
  verification_code: string;
  certificate_url: string | null;
  issued_at: string | null;
  course: {
    id: string;
    title: string;
    duration_hours: number | null;
    category: string | null;
  } | null;
}

/**
 * GET /api/certificates
 * Get all certificates for the current user
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = await getSupabaseServer();

  const { data: certificates, error } = await supabase
    .from('certificates')
    .select(`
      id,
      user_id,
      course_id,
      enrollment_id,
      verification_code,
      certificate_url,
      issued_at,
      course:courses(
        id,
        title,
        duration_hours,
        category
      )
    `)
    .eq('user_id', user.id)
    .order('issued_at', { ascending: false }) as { data: CertificateRow[] | null; error: { message: string } | null };

  if (error) {
    throw badRequestError(error.message);
  }

  // Transform data for frontend
  const formattedCertificates = (certificates || []).map(cert => ({
    id: cert.id,
    courseTitle: cert.course?.title || 'Unknown Course',
    courseCategory: cert.course?.category,
    courseDuration: cert.course?.duration_hours,
    issuedAt: cert.issued_at,
    verificationCode: cert.verification_code,
    certificateUrl: cert.certificate_url,
  }));

  return successResponse({ certificates: formattedCertificates });
});
