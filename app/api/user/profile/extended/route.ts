/**
 * Extended User Profile API
 * Manages additional profile fields stored in user metadata
 *
 * Fields: bio, location, timezone, website, social_links
 */

import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { getUpdateTimestamp } from "@/lib/utils";
import { z } from "zod";

const extendedProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  job_title: z.string().max(100).optional(),
  social_links: z
    .object({
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
  display_preferences: z
    .object({
      show_email: z.boolean().optional(),
      show_location: z.boolean().optional(),
      show_timezone: z.boolean().optional(),
    })
    .optional(),
});

export interface ExtendedProfile {
  bio?: string;
  location?: string;
  timezone?: string;
  website?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  display_preferences?: {
    show_email?: boolean;
    show_location?: boolean;
    show_timezone?: boolean;
  };
}

/**
 * GET /api/user/profile/extended
 * Get extended profile information
 */
export const GET = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const supabase = getSupabaseServer();

    // Get user metadata from auth.users
    const { data: authUser, error } = await supabase.auth.admin.getUserById(
      user.id
    );

    if (error || !authUser?.user) {
      // Return empty extended profile
      return successResponse({
        extended_profile: {} as ExtendedProfile,
      });
    }

    const metadata = authUser.user.user_metadata || {};

    const extendedProfile: ExtendedProfile = {
      bio: metadata.bio,
      location: metadata.location,
      timezone: metadata.timezone,
      website: metadata.website,
      phone: metadata.phone,
      company: metadata.company,
      job_title: metadata.job_title,
      social_links: metadata.social_links,
      display_preferences: metadata.display_preferences,
    };

    return successResponse({ extended_profile: extendedProfile });
  }
);

/**
 * PUT /api/user/profile/extended
 * Update extended profile information
 */
export const PUT = createAuthenticatedRoute(async (request, _context, user) => {
  const validation = await validateRequest(request, extendedProfileSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const supabase = getSupabaseServer();
  const updates = validation.data;

  // Get current metadata
  const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
  const currentMetadata = authUser?.user?.user_metadata || {};

  // Merge with new data
  const newMetadata = {
    ...currentMetadata,
    ...updates,
    profile_updated_at: getUpdateTimestamp().updated_at,
  };

  // Update user metadata
  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: newMetadata,
  });

  if (error) {
    throw new Error("Failed to update profile");
  }

  return successResponse({
    message: "Extended profile updated successfully",
    extended_profile: updates,
  });
});
