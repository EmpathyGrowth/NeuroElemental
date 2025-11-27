import { createAdminRoute, internalError, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface ProfileWithStats extends Profile {
  enrolled_courses: number;
  certificates: number;
}

/** Enrollment record with user_id */
interface EnrollmentRecord {
  user_id: string;
}

/** Certificate record with user_id */
interface CertificateRecord {
  user_id: string;
}

export const GET = createAdminRoute(async (_request, _context, _admin) => {
  const supabase = getSupabaseServer();

  // Fetch profiles with aggregated counts in a single query
  // This eliminates the N+1 query problem (was 1 + 2*N queries, now just 3 queries total)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (profilesError) {
    throw internalError(profilesError.message);
  }

  if (!profiles || profiles.length === 0) {
    return successResponse([]);
  }

  // Get all enrollment counts in a single query
  const profileIds = (profiles as Profile[]).map((p) => p.id);
  const { data: enrollmentCounts, error: enrollmentError } = (await supabase
    .from('course_enrollments')
    .select('user_id')
    .in('user_id', profileIds)) as { data: EnrollmentRecord[] | null; error: { message: string } | null };

  if (enrollmentError) {
    throw internalError(enrollmentError.message);
  }

  // Get all certificate counts in a single query
  const { data: certificateCounts, error: certificateError } = (await supabase
    .from('certificates')
    .select('user_id')
    .in('user_id', profileIds)) as { data: CertificateRecord[] | null; error: { message: string } | null };

  if (certificateError) {
    throw internalError(certificateError.message);
  }

  // Create lookup maps for O(1) access
  const enrollmentMap = new Map<string, number>();
  const certificateMap = new Map<string, number>();

  enrollmentCounts?.forEach((enrollment) => {
    const count = enrollmentMap.get(enrollment.user_id) || 0;
    enrollmentMap.set(enrollment.user_id, count + 1);
  });

  certificateCounts?.forEach((certificate) => {
    const count = certificateMap.get(certificate.user_id) || 0;
    certificateMap.set(certificate.user_id, count + 1);
  });

  // Map profiles with stats (O(n) operation)
  const profilesWithStats: ProfileWithStats[] = (profiles as Profile[]).map((profile) => ({
    ...profile,
    enrolled_courses: enrollmentMap.get(profile.id) || 0,
    certificates: certificateMap.get(profile.id) || 0,
  }));

  return successResponse(profilesWithStats);
});

