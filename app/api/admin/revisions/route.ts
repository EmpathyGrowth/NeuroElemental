/**
 * Admin Content Revisions API
 * GET - Get revisions for content or recent revisions
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import {
  contentRevisionsRepository,
  RevisionContentType,
} from "@/lib/db/content-revisions";

const VALID_CONTENT_TYPES = [
  "site_content",
  "email_template",
  "faq",
  "footer_content",
  "blog_post",
  "navigation",
];

/**
 * GET /api/admin/revisions
 * Get revisions for specific content or recent revisions
 */
export const GET = createAdminRoute(async (request) => {
  const url = new URL(request.url);
  const contentType = url.searchParams.get(
    "contentType"
  ) as RevisionContentType;
  const contentId = url.searchParams.get("contentId");
  const version = url.searchParams.get("version");
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);

  // Get recent revisions across all content
  if (!contentType && !contentId) {
    const revisions =
      await contentRevisionsRepository.getRecentRevisions(limit);
    return successResponse({ revisions });
  }

  // Validate content type
  if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
    throw badRequestError("Invalid contentType");
  }

  // Get specific version
  if (contentId && version) {
    const revision = await contentRevisionsRepository.getRevision(
      contentType,
      contentId,
      parseInt(version, 10)
    );
    return successResponse({ revision });
  }

  // Get all revisions for content
  if (contentId) {
    const revisions = await contentRevisionsRepository.getRevisions(
      contentType,
      contentId,
      limit
    );
    const count = await contentRevisionsRepository.getRevisionCount(
      contentType,
      contentId
    );
    return successResponse({ revisions, count });
  }

  throw badRequestError("contentId required");
});
