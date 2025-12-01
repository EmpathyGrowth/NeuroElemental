/**
 * MFA Factors API
 * Get the user's enrolled MFA factors
 */

import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";

export const GET = createAuthenticatedRoute(
  async (_request, _context, _user) => {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      return successResponse({ factors: [] });
    }

    return successResponse({
      factors: data?.totp || [],
    });
  }
);
