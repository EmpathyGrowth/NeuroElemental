/**
 * Footer Content API
 * GET - Get footer content
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import {
  footerContentRepository,
  FooterSection,
} from "@/lib/db/footer-content";

const VALID_SECTIONS = [
  "about",
  "links",
  "social",
  "legal",
  "newsletter",
  "contact",
];

/**
 * GET /api/footer
 * Get footer content, optionally filtered by section
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const section = url.searchParams.get("section") as FooterSection | null;

  if (section) {
    if (!VALID_SECTIONS.includes(section)) {
      return successResponse({ content: null });
    }
    const content = await footerContentRepository.getSection(section);
    return successResponse({ content });
  }

  const footer = await footerContentRepository.getFooterData();
  return successResponse({ footer });
});
