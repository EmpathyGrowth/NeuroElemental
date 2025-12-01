import { createPublicRoute, successResponse, validateRequest } from '@/lib/api';
import { scheduledEmailRepository } from '@/lib/db/scheduled-emails';
import { logger } from '@/lib/logging';
import { z } from 'zod';

const saveProgressSchema = z.object({
  email: z.string().email('Invalid email address'),
  answers: z.record(z.string(), z.number()).optional(),
});

/**
 * POST /api/assessment/save-progress
 * Save assessment progress with email for later completion
 */
export const POST = createPublicRoute(async (req) => {
  const validation = await validateRequest(req, saveProgressSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { email, answers } = validation.data;

  // Schedule reminder email using repository
  await scheduledEmailRepository.scheduleEmail({
    to: email,
    type: 'assessment_reminder',
    props: { answers: answers || {}, progress: Object.keys(answers || {}).length },
    scheduled_for: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    status: 'pending',
  });

  logger.info('Assessment progress saved', { email, questionCount: Object.keys(answers || {}).length });

  return successResponse({
    message: 'Progress saved successfully',
    email,
  });
});
