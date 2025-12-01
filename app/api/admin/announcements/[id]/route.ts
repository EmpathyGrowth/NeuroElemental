/**
 * Admin Site Announcement Item API
 * GET - Get announcement by ID
 * PATCH - Update announcement
 * DELETE - Delete announcement
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { siteAnnouncementsRepository } from "@/lib/db/site-announcements";
import { z } from "zod";

const announcementUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(1000).optional(),
  type: z.enum(["info", "warning", "success", "error", "promo"]).optional(),
  link_url: z.string().url().optional().nullable(),
  link_text: z.string().max(50).optional().nullable(),
  background_color: z.string().optional().nullable(),
  text_color: z.string().optional().nullable(),
  is_dismissible: z.boolean().optional(),
  is_active: z.boolean().optional(),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  display_order: z.number().optional(),
  target_pages: z.array(z.string()).optional(),
});

/**
 * GET /api/admin/announcements/[id]
 * Get announcement by ID
 */
export const GET = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    const announcement = await siteAnnouncementsRepository.findById(id);

    return successResponse({ announcement });
  }
);

/**
 * PATCH /api/admin/announcements/[id]
 * Update announcement
 */
export const PATCH = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = announcementUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.errors[0]?.message || "Invalid announcement data"
      );
    }

    const announcement = await siteAnnouncementsRepository.update(
      id,
      parsed.data
    );

    return successResponse({ announcement, message: "Announcement updated" });
  }
);

/**
 * DELETE /api/admin/announcements/[id]
 * Delete announcement
 */
export const DELETE = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    await siteAnnouncementsRepository.delete(id);

    return successResponse({ message: "Announcement deleted" });
  }
);
