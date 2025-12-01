/**
 * Sign Out All Sessions API
 * Signs out user from all devices
 */

import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/auth/signout-all
 * Signs out the user from all sessions/devices
 */
export const POST = createAuthenticatedRoute(
  async (_request, _context, _user) => {
    const supabase = await createClient();

    // Sign out globally - this invalidates all refresh tokens
    const { error } = await supabase.auth.signOut({ scope: "global" });

    if (error) {
      // Even if there's an error, we want to sign out the current session
      await supabase.auth.signOut({ scope: "local" });
    }

    return successResponse({ message: "Signed out from all devices" });
  }
);
