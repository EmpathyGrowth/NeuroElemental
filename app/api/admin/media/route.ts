/**
 * Admin Media Library API
 * GET - Get media items with filters
 * POST - Create media record (after upload)
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { mediaLibraryRepository } from "@/lib/db/media-library";
import { z } from "zod";

const mediaCreateSchema = z.object({
  filename: z.string().min(1),
  original_filename: z.string().min(1),
  mime_type: z.string().min(1),
  file_size: z.number().positive(),
  storage_path: z.string().min(1),
  public_url: z.string().url(),
  alt_text: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().default("uploads"),
  tags: z.array(z.string()).default([]),
  width: z.number().optional(),
  height: z.number().optional(),
});

/**
 * GET /api/admin/media
 * Get media items with optional filters
 */
export const GET = createAdminRoute(async (request) => {
  const url = new URL(request.url);

  const options = {
    folder: url.searchParams.get("folder") || undefined,
    mimeType: url.searchParams.get("type") || undefined,
    search: url.searchParams.get("search") || undefined,
    uploadedBy: url.searchParams.get("uploadedBy") || undefined,
    limit: parseInt(url.searchParams.get("limit") || "50", 10),
    offset: parseInt(url.searchParams.get("offset") || "0", 10),
  };

  const tags = url.searchParams.get("tags");
  if (tags) {
    Object.assign(options, { tags: tags.split(",") });
  }

  const { items, total } = await mediaLibraryRepository.getMedia(options);
  const folders = await mediaLibraryRepository.getFolders();
  const allTags = await mediaLibraryRepository.getTags();

  return successResponse({ items, total, folders, tags: allTags });
});

/**
 * POST /api/admin/media
 * Create media record after file upload
 */
export const POST = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();

  const parsed = mediaCreateSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.errors[0]?.message || "Invalid media data"
    );
  }

  const item = await mediaLibraryRepository.create({
    ...parsed.data,
    uploaded_by: userId,
  });

  return successResponse({ item, message: "Media created" }, 201);
});
