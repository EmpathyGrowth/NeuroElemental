/**
 * Admin URL Redirects API
 * GET - Get all redirects
 * POST - Create a redirect
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { urlRedirectsRepository } from "@/lib/db/url-redirects";
import { z } from "zod";

const redirectSchema = z.object({
  source_path: z
    .string()
    .min(1, "Source path required")
    .startsWith("/", "Must start with /"),
  destination_url: z.string().min(1, "Destination required"),
  redirect_type: z
    .union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)])
    .default(301),
  is_regex: z.boolean().default(false),
  is_active: z.boolean().default(true),
  preserve_query_string: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

/**
 * GET /api/admin/redirects
 * Get all redirects with stats
 */
export const GET = createAdminRoute(async () => {
  const redirects = await urlRedirectsRepository.getAll();
  const stats = await urlRedirectsRepository.getStats();

  return successResponse({ redirects, stats });
});

/**
 * POST /api/admin/redirects
 * Create a new redirect
 */
export const POST = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();

  const parsed = redirectSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.issues[0]?.message || "Invalid redirect data"
    );
  }

  // Check for conflicts
  const hasConflict = await urlRedirectsRepository.checkConflict(
    parsed.data.source_path
  );
  if (hasConflict) {
    throw badRequestError("A redirect for this path already exists");
  }

  const redirect = await urlRedirectsRepository.create({
    ...parsed.data,
    created_by: userId,
  });

  return successResponse({ redirect, message: "Redirect created" }, 201);
});
