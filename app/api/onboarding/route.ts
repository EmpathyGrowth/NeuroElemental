import { createAuthenticatedRoute, successResponse, badRequestError } from '@/lib/api';
import { userRepository } from '@/lib/db';
import { z } from 'zod';

const updateStepSchema = z.object({
  step: z.string().min(1),
});

const completeOnboardingSchema = z.object({
  complete: z.literal(true),
});

/**
 * GET /api/onboarding
 * Get the current user's onboarding status
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  const status = await userRepository.getOnboardingStatus(user.id);
  return successResponse(status);
});

/**
 * POST /api/onboarding
 * Update onboarding step or mark as complete
 * Body: { step: string } to update step
 * Body: { complete: true } to mark as complete
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const body = await req.json();

  // Check if completing onboarding
  const completeResult = completeOnboardingSchema.safeParse(body);
  if (completeResult.success) {
    await userRepository.completeOnboarding(user.id);
    return successResponse({ completed: true });
  }

  // Otherwise update the current step
  const stepResult = updateStepSchema.safeParse(body);
  if (!stepResult.success) {
    throw badRequestError('Invalid request: provide either { step: string } or { complete: true }');
  }

  await userRepository.updateOnboardingStep(user.id, stepResult.data.step);
  return successResponse({ step: stepResult.data.step });
});
