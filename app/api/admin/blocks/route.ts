/**
 * Admin Content Blocks API
 * GET - Get all blocks
 * POST - Create a block or placement
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { BlockType, contentBlocksRepository } from "@/lib/db/content-blocks";
import { z } from "zod";

const blockSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  block_type: z.enum([
    "text",
    "html",
    "cta",
    "feature",
    "testimonial",
    "stats",
    "gallery",
    "video",
    "code",
    "custom",
  ]),
  content: z.record(z.string(), z.unknown()),
  settings: z.record(z.string(), z.unknown()).optional(),
  is_global: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

const placementSchema = z.object({
  block_id: z.string().uuid(),
  page_path: z.string().min(1),
  position: z.string().min(1),
  display_order: z.number().default(0),
  overrides: z.record(z.string(), z.unknown()).optional(),
  is_visible: z.boolean().default(true),
});

/**
 * GET /api/admin/blocks
 * Get all blocks with optional type filter
 */
export const GET = createAdminRoute(async (request) => {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as BlockType | null;

  if (type) {
    const blocks = await contentBlocksRepository.getByType(type);
    return successResponse({ blocks });
  }

  const blocks = await contentBlocksRepository.getAll();
  return successResponse({ blocks });
});

/**
 * POST /api/admin/blocks
 * Create a block or add to page
 */
export const POST = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();
  const action = body.action; // 'create' or 'place'

  if (action === "place") {
    const parsed = placementSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.issues[0]?.message || "Invalid placement data"
      );
    }
    const placement = await contentBlocksRepository.addToPage(parsed.data);
    return successResponse({ placement, message: "Block added to page" }, 201);
  }

  // Default: create block
  const parsed = blockSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.issues[0]?.message || "Invalid block data"
    );
  }

  const block = await contentBlocksRepository.create({
    ...parsed.data,
    created_by: userId,
  });

  return successResponse({ block, message: "Block created" }, 201);
});
