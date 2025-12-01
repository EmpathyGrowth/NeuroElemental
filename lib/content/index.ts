/**
 * Content Module
 * Provides CMS content with static fallbacks
 */

import { siteContentRepository } from "@/lib/db/site-content";
import { logger } from "@/lib/logging";
import { LANDING_CONTENT } from "./landing";

export { LANDING_CONTENT } from "./landing";

/**
 * Deep merge two objects, with source overriding target for matching keys
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (
      sourceValue &&
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === "object" &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>
      ) as T[keyof T];
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T];
    }
  }

  return result;
}

/**
 * Get landing page content with CMS overrides
 * Falls back to static content if CMS is unavailable
 */
export async function getLandingContent(): Promise<typeof LANDING_CONTENT> {
  try {
    // Fetch all landing page sections from CMS
    const cmsContent = await siteContentRepository.getPageSections("landing");

    if (!cmsContent || Object.keys(cmsContent).length === 0) {
      return LANDING_CONTENT;
    }

    // Merge CMS content with static defaults
    const merged = { ...LANDING_CONTENT };

    // Map CMS sections to content structure
    if (cmsContent.hero) {
      merged.hero = deepMerge(LANDING_CONTENT.hero, {
        badge: cmsContent.hero.badge as string,
        title: cmsContent.hero.title as typeof LANDING_CONTENT.hero.title,
        description: cmsContent.hero.description as string,
        cta: cmsContent.hero.cta as typeof LANDING_CONTENT.hero.cta,
        trust: cmsContent.hero.trust as string[],
      });
    }

    if (cmsContent.symptoms) {
      merged.symptoms = deepMerge(LANDING_CONTENT.symptoms, {
        title: cmsContent.symptoms.title as string,
        highlight: cmsContent.symptoms.highlight as string,
        description: cmsContent.symptoms.description as string,
        quote: cmsContent.symptoms
          .quote as typeof LANDING_CONTENT.symptoms.quote,
      });
    }

    if (cmsContent.miniAssessment) {
      merged.miniAssessment = deepMerge(LANDING_CONTENT.miniAssessment, {
        title: cmsContent.miniAssessment.title as string,
        highlight: cmsContent.miniAssessment.highlight as string,
        description: cmsContent.miniAssessment.description as string,
      });
    }

    if (cmsContent.problems) {
      merged.problems = deepMerge(LANDING_CONTENT.problems, {
        title: cmsContent.problems.title as string,
        highlight: cmsContent.problems.highlight as string,
        description: cmsContent.problems.description as string,
      });
    }

    if (cmsContent.benefits) {
      merged.benefits = deepMerge(LANDING_CONTENT.benefits, {
        title: cmsContent.benefits.title as string,
        highlight: cmsContent.benefits.highlight as string,
        description: cmsContent.benefits.description as string,
      });
    }

    if (cmsContent.steps) {
      merged.steps = deepMerge(LANDING_CONTENT.steps, {
        title: cmsContent.steps.title as string,
        highlight: cmsContent.steps.highlight as string,
        description: cmsContent.steps.description as string,
      });
    }

    if (cmsContent.professionals) {
      merged.professionals = deepMerge(LANDING_CONTENT.professionals, {
        title: cmsContent.professionals.title as string,
        highlight: cmsContent.professionals.highlight as string,
        description: cmsContent.professionals.description as string,
        cta: cmsContent.professionals.cta as string,
      });
    }

    if (cmsContent.finalCta) {
      merged.finalCta = deepMerge(LANDING_CONTENT.finalCta, {
        title: cmsContent.finalCta.title as string,
        highlight: cmsContent.finalCta.highlight as string,
        description: cmsContent.finalCta.description as string,
        cta: cmsContent.finalCta.cta as typeof LANDING_CONTENT.finalCta.cta,
        badges: cmsContent.finalCta
          .badges as typeof LANDING_CONTENT.finalCta.badges,
      });
    }

    return merged;
  } catch (error) {
    logger.error(
      "Error fetching CMS content, using static fallback",
      error as Error
    );
    return LANDING_CONTENT;
  }
}

/**
 * Get content for a specific page with CMS overrides
 */
export async function getPageContent<T extends Record<string, unknown>>(
  page: string,
  defaults: T
): Promise<T> {
  try {
    const cmsContent = await siteContentRepository.getPageSections(page);

    if (!cmsContent || Object.keys(cmsContent).length === 0) {
      return defaults;
    }

    return deepMerge(defaults, cmsContent as Partial<T>);
  } catch (error) {
    logger.error(`Error fetching CMS content for ${page}`, error as Error);
    return defaults;
  }
}

/**
 * Get a specific section's content
 */
export async function getSectionContent<T extends Record<string, unknown>>(
  page: string,
  section: string,
  defaults: T
): Promise<T> {
  try {
    const cmsContent = await siteContentRepository.getSection(page, section);

    if (!cmsContent) {
      return defaults;
    }

    return deepMerge(defaults, cmsContent as Partial<T>);
  } catch (error) {
    logger.error(
      `Error fetching CMS section ${page}/${section}`,
      error as Error
    );
    return defaults;
  }
}
