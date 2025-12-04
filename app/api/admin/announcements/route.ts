/**
 * Admin Site Announcements API
 * GET - Get all announcements
 * POST - Create a new announcement
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { siteAnnouncementsRepository } from "@/lib/db/site-announcements";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required").max(1000),
  type: z
    .enum(["info", "warning", "success", "error", "promo"])
    .default("info"),
  link_url: z.string().url().optional().nullable(),
  link_text: z.string().max(50).optional().nullable(),
  background_color: z.string().optional().nullable(),
  text_color: z.string().optional().nullable(),
  is_dismissible: z.boolean().default(true),
  is_active: z.boolean().default(false),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  display_order: z.number().default(0),
  target_pages: z.array(z.string()).default(["all"]),
});

/**
 * GET /api/admin/announcements
 * Get all announcements for admin management
 */
export const GET = createAdminRoute(async () => {
  const announcements = await siteAnnouncementsRepository.getAll();
  const activeCount = await siteAnnouncementsRepository.countActive();

  return successResponse({ announcements, activeCount });
});

/**
 * POST /api/admin/announcements
 * Create a new announcement
 */
export const POST = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();

  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.issues[0]?.message || "Invalid announcement data"
    );
  }

  const announcement = await siteAnnouncementsRepository.create({
    ...parsed.data,
    created_by: userId,
  });

  return successResponse(
    { announcement, message: "Announcement created" },
    201
  );
});
