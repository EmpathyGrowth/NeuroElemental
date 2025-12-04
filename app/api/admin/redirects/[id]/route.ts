/**
 * Admin URL Redirect Item API
 * GET - Get redirect by ID
 * PATCH - Update redirect
 * DELETE - Delete redirect
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { urlRedirectsRepository } from "@/lib/db/url-redirects";
import { z } from "zod";

const redirectUpdateSchema = z.object({
  source_path: z.string().min(1).startsWith("/").optional(),
  destination_url: z.string().min(1).optional(),
  redirect_type: z
    .union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)])
    .optional(),
  is_regex: z.boolean().optional(),
  is_active: z.boolean().optional(),
  preserve_query_string: z.boolean().optional(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * GET /api/admin/redirects/[id]
 * Get redirect by ID
 */
export const GET = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;
    const redirect = await urlRedirectsRepository.findById(id);
    return successResponse({ redirect });
  }
);

/**
 * PATCH /api/admin/redirects/[id]
 * Update redirect
 */
export const PATCH = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = redirectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(parsed.error.issues[0]?.message || "Invalid data");
    }

    // Check for conflicts if source_path is changing
    if (parsed.data.source_path) {
      const hasConflict = await urlRedirectsRepository.checkConflict(
        parsed.data.source_path,
        id
      );
      if (hasConflict) {
        throw badRequestError("A redirect for this path already exists");
      }
    }

    const redirect = await urlRedirectsRepository.update(id, parsed.data);
    return successResponse({ redirect, message: "Redirect updated" });
  }
);

/**
 * DELETE /api/admin/redirects/[id]
 * Delete redirect
 */
export const DELETE = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;
    await urlRedirectsRepository.delete(id);
    return successResponse({ message: "Redirect deleted" });
  }
);
