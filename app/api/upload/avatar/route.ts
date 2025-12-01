import { createAuthenticatedRoute, successResponse, badRequestError } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 5;

/**
 * POST /api/upload/avatar
 * Upload an avatar image for the authenticated user
 * Uses service role to bypass RLS
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  logger.info('Avatar upload - authenticated user', { userId: user.id });
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

  // Generate file path: {userId}/{timestamp}-{random}.jpg
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  const filePath = `${user.id}/${fileName}`;

  // Convert File to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Upload file using service role (bypasses RLS)
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(filePath, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    logger.error('Avatar upload error:', error as Error);
    throw badRequestError(error.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  logger.info('Avatar upload successful', {
    userId: user.id,
    path: data.path,
    publicUrl: urlData.publicUrl
  });

  return successResponse({
    url: urlData.publicUrl,
    path: data.path,
  });
});

/**
 * DELETE /api/upload/avatar
 * Delete an avatar image for the authenticated user
 */
export const DELETE = createAuthenticatedRoute(async (request, _context, user) => {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    throw badRequestError('No path provided');
  }

  // Security check: ensure the path belongs to this user
  if (!path.startsWith(`${user.id}/`)) {
    throw badRequestError('Cannot delete files belonging to other users');
  }

  const supabase = getSupabaseServer();

  const { error } = await supabase.storage
    .from('avatars')
    .remove([path]);

  if (error) {
    logger.error('Avatar delete error:', error as Error);
    throw badRequestError(error.message);
  }

  logger.info('Avatar deleted', { userId: user.id, path });

  return successResponse({ success: true });
});
