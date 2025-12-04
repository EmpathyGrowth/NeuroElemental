/**
 * Notification API Routes
 * GET, PUT, DELETE for individual notifications
 */

import { createAuthenticatedRoute, internalError, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { notificationUpdateSchema } from '@/lib/validation/schemas';

/** Notification data from database */
interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

/**
 * GET /api/notifications/[id]
 * Get a specific notification for the authenticated user
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  const { data: notification, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: Notification | null; error: { message: string } | null };

  if (error || !notification) {
    throw notFoundError('Notification');
  }

  return successResponse({ notification });
});

/**
 * PUT /api/notifications/[id]
 * Update notification (mark as read/unread)
 */
export const PUT = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, notificationUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { is_read } = validation.data;

  const { data: notification, error } = await (supabase as any)
    .from('notifications')
    .update({ read: is_read })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single() as { data: Notification | null; error: { message: string } | null };

  if (error || !notification) {
    throw notFoundError('Notification');
  }

  return successResponse({ notification });
});

/**
 * DELETE /api/notifications/[id]
 * Delete a notification
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw internalError('Failed to delete notification');
  }

  return successResponse({ message: 'Notification deleted successfully' });
});
