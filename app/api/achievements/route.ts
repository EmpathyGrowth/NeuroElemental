/**
 * Achievements API
 * GET - List all achievements and user's unlocked achievements
 *
 * NOTE: Tables 'achievements' and 'user_achievements' are defined in migration
 * 20250127_ui_ux_improvements.sql. Regenerate Supabase types to remove ts-expect-error comments.
 */

import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { achievementRepository } from '@/lib/db/achievements';

// GET - Get all achievements and user's progress
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const { achievements, stats } = await achievementRepository.getWithUserStatus(user.id);

  return successResponse({
    achievements,
    stats,
  });
});
