/**
 * Admin Media Item API
 * GET - Get media by ID
 * PATCH - Update media metadata
 * DELETE - Delete media record
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { mediaLibraryRepository } from "@/lib/db/media-library";
import { z } from "zod";

const mediaUpdateSchema = z.object({
  alt_text: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/admin/media/[id]
 * Get media by ID
 */
export const GET = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    const item = await mediaLibraryRepository.findById(id);

    return successResponse({ item });
  }
);

/**
 * PATCH /api/admin/media/[id]
 * Update media metadata
 */
export const PATCH = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = mediaUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(parsed.error.errors[0]?.message || "Invalid data");
    }

    const item = await mediaLibraryRepository.update(id, parsed.data);

    return successResponse({ item, message: "Media updated" });
  }
);

/**
 * DELETE /api/admin/media/[id]
 * Delete media record (caller should also delete from storage)
 */
export const DELETE = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    const deletedItem = await mediaLibraryRepository.delete(id);

    return successResponse({
      item: deletedItem,
      message: "Media deleted",
      storage_path: deletedItem.storage_path, // Return path for storage cleanup
    });
  }
);
