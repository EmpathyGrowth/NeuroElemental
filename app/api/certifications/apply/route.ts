/**
 * Certification Application API
 * Submit and manage certification applications
 */

import {
  createAuthenticatedRoute,
  successResponse,
  badRequestError,
} from '@/lib/api';
import { certificationRepository } from '@/lib/db';
import { validateRequest } from '@/lib/validation';
import { certificationApplicationSchema } from '@/lib/validation/schemas';

// GET - Get user's applications
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const applications = await certificationRepository.getUserApplications(user.id);

  return successResponse({ applications });
});

// POST - Submit new application
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const validation = await validateRequest(request, certificationApplicationSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = validation.data;

  // Check for existing application
  const existing = await certificationRepository.getUserApplication(
    user.id,
    data.certification_level
  );

  if (existing && existing.status !== 'rejected') {
    throw badRequestError(
      `You already have a ${existing.status} application for ${data.certification_level} certification`
    );
  }

  const application = await certificationRepository.createApplication({
    user_id: user.id,
    certification_level: data.certification_level,
    professional_background: data.professional_background,
    motivation: data.motivation,
    experience_years: data.experience_years,
    specializations: data.specializations,
    certifications_held: data.certifications_held,
    linkedin_url: data.linkedin_url || undefined,
    website_url: data.website_url || undefined,
  });

  return successResponse({ application }, 201);
});
