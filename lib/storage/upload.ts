import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logging';

export type StorageBucket =
  | 'avatars'
  | 'resources'
  | 'certificates'
  | 'course-materials'
  | 'images'; // For course thumbnails, blog images, etc.

export interface UploadOptions {
  bucket: StorageBucket;
  folder?: string;
  fileName?: string;
  allowedTypes?: string[];
  maxSize?: number; // in MB
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createClient();

  // Validate file type
  if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
    return { error: `File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}` };
  }

  // Validate file size
  const maxBytes = (options.maxSize || 10) * 1024 * 1024; // Default 10MB
  if (file.size > maxBytes) {
    return { error: `File size exceeds ${options.maxSize || 10}MB limit` };
  }

  // Generate file path
  const fileExt = file.name.split('.').pop();
  const fileName = options.fileName || `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = options.folder ? `${options.folder}/${fileName}` : fileName;

  // Upload file
  const { data, error } = await supabase.storage
    .from(options.bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    logger.error('Upload error:', error as Error);
    return { error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(data.path);

  // Log the URL for debugging
  logger.info('Upload successful', { bucket: options.bucket, path: data.path, publicUrl: urlData.publicUrl });

  return {
    url: urlData.publicUrl,
    path: data.path,
  };
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    logger.error('Delete error:', error as Error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600
): Promise<{ url: string } | { error: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    logger.error('Signed URL error:', error as Error);
    return { error: error.message };
  }

  return { url: data.signedUrl };
}

/**
 * Extract file path from a Supabase storage URL
 * URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
 */
export function extractPathFromUrl(url: string): { bucket: string; path: string } | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/storage/v1/object/public/');
    if (pathParts.length < 2) return null;

    const [bucket, ...pathSegments] = pathParts[1].split('/');
    return {
      bucket,
      path: pathSegments.join('/'),
    };
  } catch {
    return null;
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
