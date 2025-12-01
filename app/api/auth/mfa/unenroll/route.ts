/**
 * MFA Unenroll API
 * Disable MFA for the user
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { z } from "zod";

const unenrollSchema = z.object({
  factorId: z.string(),
});

export const POST = createAuthenticatedRoute(
  async (request, _context, _user) => {
    const supabase = getSupabaseServer();
    const body = await request.json();

    const parsed = unenrollSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError("Invalid request");
    }

    const { error } = await supabase.auth.mfa.unenroll({
      factorId: parsed.data.factorId,
    });

    if (error) {
      throw badRequestError(error.message);
    }

    return successResponse({
      message: "MFA disabled successfully",
    });
  }
);
