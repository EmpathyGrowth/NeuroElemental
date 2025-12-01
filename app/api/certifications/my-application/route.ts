import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { certificationRepository } from '@/lib/db';

export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  // Default to 'instructor' level for now as that's the primary use case
  // In the future, we could accept a query param ?level=practitioner
  const application = await certificationRepository.getUserApplication(
    user.id,
    'instructor'
  );

  return successResponse({ application });
});
