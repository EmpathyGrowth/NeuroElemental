/**
 * Subscriptions API - Refactored with Factory Pattern
 * Fetches paginated subscription data for current user
 */

import { createAuthenticatedRoute, formatPaginationMeta, getPaginationParams, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';

/** Subscription record */
interface SubscriptionRecord {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  created_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();
  const { limit, offset } = getPaginationParams(request, { limit: 20 });

  const { data: subscriptions, count } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1) as { data: SubscriptionRecord[] | null; count: number | null };

  return successResponse({
    subscriptions: subscriptions || [],
    pagination: formatPaginationMeta(count || 0, limit, offset)
  });
});

