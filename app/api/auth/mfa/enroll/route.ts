/**
 * MFA Enrollment API
 * Start MFA enrollment for the user
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { z } from "zod";

const enrollSchema = z.object({
  factorType: z.enum(["totp"]),
  friendlyName: z.string().optional(),
});

export const POST = createAuthenticatedRoute(
  async (request, _context, _user) => {
    const supabase = getSupabaseServer();
    const body = await request.json();

    const parsed = enrollSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError("Invalid request");
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: parsed.data.factorType,
      friendlyName: parsed.data.friendlyName || "Authenticator App",
    });

    if (error) {
      throw badRequestError(error.message);
    }

    return successResponse({
      factor_id: data.id,
      qr_code: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    });
  }
);
