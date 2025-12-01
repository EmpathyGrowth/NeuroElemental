/**
 * FAQs API
 * GET - Get published FAQs
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { faqsRepository } from "@/lib/db/faqs";

/**
 * GET /api/faqs
 * Get published FAQs with optional category filter
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  let faqs;

  if (search) {
    faqs = await faqsRepository.search(search);
  } else if (category) {
    faqs = await faqsRepository.getByCategory(category);
  } else {
    faqs = await faqsRepository.getPublished();
  }

  const categories = await faqsRepository.getCategories();

  return successResponse({ faqs, categories });
});
