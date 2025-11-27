import { emailService } from '@/lib/email';
import { createCronRoute, successResponse } from '@/lib/api';

/**
 * POST /api/emails/scheduled
 * Process scheduled emails (requires x-cron-secret header)
 * Should be called by a cron job every minute
 */
export const POST = createCronRoute(async (_request, _context) => {
  // Process scheduled emails
  await emailService.processScheduledEmails();

  return successResponse({
    success: true,
    message: 'Scheduled emails processed'
  });
})