/**
 * MFA Verification API
 * Verify a TOTP code to complete MFA enrollment
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { z } from "zod";

const verifySchema = z.object({
  factorId: z.string(),
  code: z.string().length(6),
});

export const POST = createAuthenticatedRoute(
  async (request, _context, _user) => {
    const supabase = getSupabaseServer();
    const body = await request.json();

    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError("Invalid request");
    }

    // Create a challenge
    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({
        factorId: parsed.data.factorId,
      });

    if (challengeError) {
      throw badRequestError(challengeError.message);
    }

    // Verify the challenge
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: parsed.data.factorId,
      challengeId: challengeData.id,
      code: parsed.data.code,
    });

    if (verifyError) {
      throw badRequestError("Invalid verification code");
    }

    return successResponse({
      message: "MFA enabled successfully",
    });
  }
);
