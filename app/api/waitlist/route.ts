import { badRequestError, createAdminRoute, createPublicRoute, internalError, successResponse, validateRequest } from '@/lib/api';
import { addToWaitlist, getAllWaitlistEntries, getWaitlistCount, isEmailOnWaitlist, removeFromWaitlist } from '@/lib/db';
import { sendWaitlistConfirmation } from '@/lib/email';
import { log } from '@/lib/logging';
import { waitlistCreateSchema } from '@/lib/validation/schemas';

/**
 * GET /api/waitlist
 * Get waitlist entries (admin only)
 */
export const GET = createAdminRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get('status') || undefined;
  const status = statusParam as 'pending' | 'approved' | 'rejected' | undefined;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const count_only = searchParams.get('count') === 'true';

  if (count_only) {
    const count = await getWaitlistCount(status);
    return successResponse({ count });
  }

  const { data: entries } = await getAllWaitlistEntries({
    status,
    limit,
    offset,
  });

  return successResponse({
    entries: entries || [],
    count: entries?.length || 0,
  });
});

/**
 * POST /api/waitlist
 * Add email to waitlist (public endpoint)
 */
export const POST = createPublicRoute(async (request) => {
  // Validate request body
  const validation = await validateRequest(request, waitlistCreateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { email, name, referral_code } = validation.data;

  // Check if already on waitlist
  const alreadyOnWaitlist = await isEmailOnWaitlist(email);

  if (alreadyOnWaitlist) {
    throw badRequestError('Email already on waitlist');
  }

  // Add to waitlist
  const { data: entry, error } = await addToWaitlist({
    email,
    name,
    referral_code,
  });

  if (error) {
    log.error('Error adding to waitlist', error, {
      endpoint: 'POST /api/waitlist',
      email,
    });

    // Handle duplicate email gracefully
    if (error === 'Email already on waitlist') {
      throw badRequestError('Email already on waitlist');
    }

    throw internalError('Failed to add to waitlist');
  }

  // Send confirmation email (non-blocking - don't fail if email fails)
  sendWaitlistConfirmation({
    to: email,
    name: name || undefined,
  }).catch((err) => {
    log.error('Failed to send waitlist confirmation email', err, {
      endpoint: 'POST /api/waitlist',
      email,
    });
  });

  return successResponse(
    {
      entry,
      message: 'Successfully added to waitlist',
    },
    201
  );
});

/**
 * DELETE /api/waitlist
 * Remove email from waitlist
 */
export const DELETE = createPublicRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    throw badRequestError('Email query parameter required');
  }

  // Remove from waitlist
  const { error } = await removeFromWaitlist(email);

  if (error) {
    log.error('Error removing from waitlist', error, {
      endpoint: 'DELETE /api/waitlist',
      email,
    });
    throw internalError('Failed to remove from waitlist');
  }

  return successResponse({
    message: 'Successfully removed from waitlist',
  });
});
