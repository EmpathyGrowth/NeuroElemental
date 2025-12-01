import { createPublicRoute, successResponse, badRequestError } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

/**
 * GET /api/auth/verify-email?token=xxx
 * Verify user's email address
 */
export const GET = createPublicRoute(async (req) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  if (!token || !type) {
    throw badRequestError('Missing verification token');
  }

  // Supabase handles email verification automatically via magic link
  // This endpoint is for custom verification flows if needed
  const supabase = createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as 'email',
    });

    if (error) {
      logger.error('Email verification failed:', error as Error);
      throw badRequestError('Invalid or expired verification link');
    }

    return successResponse({
      verified: true,
      user: data.user,
    });
  } catch (error) {
    logger.error('Email verification error:', error as Error);
    throw badRequestError('Email verification failed');
  }
});
