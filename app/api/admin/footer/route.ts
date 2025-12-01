/**
 * Admin Footer Content API
 * GET - Get all footer sections
 * PATCH - Update a footer section
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import {
  footerContentRepository,
  FooterSection,
} from "@/lib/db/footer-content";
import { z } from "zod";

const VALID_SECTIONS = [
  "about",
  "links",
  "social",
  "legal",
  "newsletter",
  "contact",
];

const updateSchema = z.object({
  section: z.enum([
    "about",
    "links",
    "social",
    "legal",
    "newsletter",
    "contact",
  ]),
  content: z.record(z.unknown()),
});

const visibilitySchema = z.object({
  section: z.enum([
    "about",
    "links",
    "social",
    "legal",
    "newsletter",
    "contact",
  ]),
  is_visible: z.boolean(),
});

/**
 * GET /api/admin/footer
 * Get all footer sections
 */
export const GET = createAdminRoute(async () => {
  const sections = await footerContentRepository.getAllSections();
  return successResponse({ sections });
});

/**
 * PATCH /api/admin/footer
 * Update a footer section's content or visibility
 */
export const PATCH = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();
  const action = body.action; // 'update' or 'visibility'

  if (action === "visibility") {
    const parsed = visibilitySchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(parsed.error.errors[0]?.message || "Invalid data");
    }
    const section = await footerContentRepository.toggleVisibility(
      parsed.data.section,
      parsed.data.is_visible
    );
    return successResponse({ section, message: "Visibility updated" });
  }

  // Default: update content
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(parsed.error.errors[0]?.message || "Invalid data");
  }

  if (!VALID_SECTIONS.includes(parsed.data.section)) {
    throw badRequestError("Invalid section");
  }

  const section = await footerContentRepository.updateSection(
    parsed.data.section as FooterSection,
    parsed.data.content as Record<string, unknown>,
    userId
  );

  return successResponse({ section, message: "Footer updated" });
});
