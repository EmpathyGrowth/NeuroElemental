import { createAuthenticatedRoute, successResponse, badRequestError } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_SIZE_MB = 10;

/**
 * POST /api/upload/image
 * Upload an image for courses, blogs, events, etc.
 * Uses service role to bypass RLS
 *
 * Query params:
 * - category: 'courses' | 'blogs' | 'events' | 'general' (optional, for folder organization)
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || 'general';

  // Validate category
  const validCategories = ['courses', 'blogs', 'events', 'general'];
  if (!validCategories.includes(category)) {
    throw badRequestError(`Invalid category. Valid categories: ${validCategories.join(', ')}`);
  }

  logger.info('Image upload - authenticated user', { userId: user.id, category });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    throw badRequestError('No file provided');
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw badRequestError(`File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Validate file size
  const maxBytes = MAX_SIZE_MB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw badRequestError(`File size exceeds ${MAX_SIZE_MB}MB limit`);
  }

  const supabase = getSupabaseServer();

  // Generate file path: {userId}/{category}/{timestamp}-{random}.{ext}
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${user.id}/${category}/${fileName}`;

  // Convert File to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload file using service role (bypasses RLS)
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: '31536000', // Cache for 1 year
      upsert: false,
    });

  if (error) {
    logger.error('Image upload error:', error as Error);
    throw badRequestError(error.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  logger.info('Image upload successful', {
    userId: user.id,
    category,
    path: data.path,
    publicUrl: urlData.publicUrl
  });

  return successResponse({
    url: urlData.publicUrl,
    path: data.path,
  });
});

/**
 * DELETE /api/upload/image
 * Delete an image
 */
export const DELETE = createAuthenticatedRoute(async (request, _context, user) => {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    throw badRequestError('No path provided');
  }

  // Security check: ensure the path belongs to this user (or user is admin)
  const supabase = getSupabaseServer();

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const isAdmin = profile?.role === 'admin';

  if (!path.startsWith(`${user.id}/`) && !isAdmin) {
    throw badRequestError('Cannot delete files belonging to other users');
  }

  const { error } = await supabase.storage
    .from('images')
    .remove([path]);

  if (error) {
    logger.error('Image delete error:', error as Error);
    throw badRequestError(error.message);
  }

  logger.info('Image deleted', { userId: user.id, path });

  return successResponse({ success: true });
});
