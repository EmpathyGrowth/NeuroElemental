/**
 * Content Blocks API
 * GET - Get blocks for a page or by slug
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { contentBlocksRepository } from "@/lib/db/content-blocks";

/**
 * GET /api/blocks
 * Get blocks by slug, page, or all global blocks
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const page = url.searchParams.get("page");
  const position = url.searchParams.get("position");

  // Get by slug
  if (slug) {
    const block = await contentBlocksRepository.getBySlug(slug);
    return successResponse({ block });
  }

  // Get blocks for page position
  if (page && position) {
    const placements = await contentBlocksRepository.getBlocksForPosition(
      page,
      position
    );
    return successResponse({ placements });
  }

  // Get all blocks for page
  if (page) {
    const placements = await contentBlocksRepository.getBlocksForPage(page);
    return successResponse({ placements });
  }

  // Get global blocks
  const blocks = await contentBlocksRepository.getGlobalBlocks();
  return successResponse({ blocks });
});
