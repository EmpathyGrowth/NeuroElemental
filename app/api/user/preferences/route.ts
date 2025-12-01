/**
 * User Email Preferences API
 * Get and update user notification preferences
 */

import { createAuthenticatedRoute, successResponse, validateRequest } from '@/lib/api'
import { emailPreferencesRepository } from '@/lib/db/email-preferences'
import { emailPreferencesUpdateSchema } from '@/lib/validation/schemas'

/**
 * GET /api/user/preferences
 * Get current user's email preferences
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const preferences = await emailPreferencesRepository.getByUser(user.id);

  return successResponse({ preferences });
});

/**
 * PUT /api/user/preferences
 * Update current user's email preferences
 */
export const PUT = createAuthenticatedRoute(async (request, _context, user) => {
  // Validate request body
  const validation = await validateRequest(request, emailPreferencesUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  // Update preferences using repository
  await emailPreferencesRepository.upsertPreferences(user.id, validation.data);

  return successResponse({
    success: true,
    message: 'Preferences updated successfully',
  });
});
