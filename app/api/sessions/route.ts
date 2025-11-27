/**
 * Sessions API - Refactored with Factory Pattern
 * Manages session bookings and availability
 */

import { createAuthenticatedRoute, createPublicRoute, formatPaginationMeta, getPaginationParams, getQueryParam, internalError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { sessionCreateRequestSchema } from '@/lib/validation/schemas';

/** Instructor profile */
interface InstructorProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

/** Session with instructor */
interface SessionWithInstructor {
  id: string;
  user_id: string;
  instructor_id: string;
  scheduled_at: string;
  duration: number;
  notes: string | null;
  status: string;
  instructor: InstructorProfile;
}

/** Session insert data */
interface SessionInsert {
  student_id: string;
  instructor_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string | null;
  status: string;
  type: string;
}

// GET - Fetch sessions (public or filtered by user)
export const GET = createPublicRoute(async (request, _context) => {
  const supabase = getSupabaseServer();
  const { limit, offset } = getPaginationParams(request, { limit: 20 });
  const instructor_id = getQueryParam(request, 'instructor_id');
  const status = getQueryParam(request, 'status');

  let query = supabase
    .from('sessions')
    .select(`
      *,
      instructor:profiles!sessions_instructor_id_fkey(
        id,
        full_name,
        avatar_url
      )
    `, { count: 'exact' });

  if (instructor_id) {
    query = query.eq('instructor_id', instructor_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  query = query
    .order('scheduled_at', { ascending: true })
    .range(offset, offset + limit - 1);

  const { data: sessions, error, count } = await query as { data: SessionWithInstructor[] | null; error: Error | null; count: number | null };

  if (error) {
    logger.error('Error fetching sessions', error);
    throw internalError('Failed to fetch sessions');
  }

  return successResponse({
    sessions: sessions || [],
    pagination: formatPaginationMeta(count || 0, limit, offset)
  });
});

// POST - Book a new session (requires authentication)
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, sessionCreateRequestSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { instructor_id, scheduled_at, duration, notes } = validation.data;

  const sessionData: SessionInsert = {
    student_id: user.id,
    instructor_id,
    scheduled_at,
    duration_minutes: duration || 60,
    notes,
    status: 'pending',
    type: 'one-on-one',
  };

  // Note: Session booking functionality may need schema updates
   
  // Type assertion needed: SessionInsert missing fields from generated schema
   
  const { data: session, error } = await (supabase
    .from('sessions') as any)
    .insert(sessionData)
    .select()
    .single() as { data: SessionWithInstructor | null; error: Error | null };

  if (error) {
    logger.error('Error creating session', error);
    throw internalError('Failed to create session');
  }

  return successResponse({ session }, 201);
});

