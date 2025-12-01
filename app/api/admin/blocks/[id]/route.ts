/**
 * Admin Content Block by ID API
 * GET - Get block by ID
 * PATCH - Update block
 * DELETE - Delete block
 */

import {
  badRequestError,
  createAdminRoute,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { contentBlocksRepository } from "@/lib/db/content-blocks";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  block_type: z
    .enum([
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
    ])
    .optional(),
  content: z.record(z.unknown()).optional(),
  settings: z.record(z.unknown()).optional(),
  is_global: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/blocks/[id]
 * Get a specific block
 */
export const GET = createAdminRoute(async (_request, context: RouteContext) => {
  const { id } = await context.params;

  const block = await contentBlocksRepository.getById(id);
  if (!block) {
    throw notFoundError("Block");
  }

  return successResponse({ block });
});

/**
 * PATCH /api/admin/blocks/[id]
 * Update a block
 */
export const PATCH = createAdminRoute(
  async (request, context: RouteContext) => {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.errors[0]?.message || "Invalid block data"
      );
    }

    // Check if block exists first
    const existing = await contentBlocksRepository.getById(id);
    if (!existing) {
      throw notFoundError("Block");
    }

    const block = await contentBlocksRepository.update(id, parsed.data);

    return successResponse({ block, message: "Block updated" });
  }
);

/**
 * DELETE /api/admin/blocks/[id]
 * Delete a block
 */
export const DELETE = createAdminRoute(
  async (_request, context: RouteContext) => {
    const { id } = await context.params;

    // Check if block exists first
    const existing = await contentBlocksRepository.getById(id);
    if (!existing) {
      throw notFoundError("Block");
    }

    await contentBlocksRepository.delete(id);

    return successResponse({ message: "Block deleted" });
  }
);
