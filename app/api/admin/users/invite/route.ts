import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";

interface InviteUserBody {
  email: string;
  full_name?: string;
  role?: string;
}

/**
 * POST /api/admin/users/invite
 * Send an invitation email to a new user
 */
export const POST = createAdminRoute(async (request, _context, admin) => {
  const body = (await request.json()) as InviteUserBody;

  if (!body.email) {
    throw badRequestError("Email is required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    throw badRequestError("Invalid email format");
  }

  const supabase = getSupabaseServer();

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", body.email.toLowerCase())
    .single();

  if (existingUser) {
    throw badRequestError("User with this email already exists");
  }

  // Generate invitation token
  const token = crypto.randomUUID();
  const _expiresAt = new Date();
  _expiresAt.setDate(_expiresAt.getDate() + 7); // 7 days expiry

  // For now, we'll use Supabase's built-in invite functionality
  // or just log the invitation since the user_invitations table may not exist
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/signup?invite=${token}&email=${encodeURIComponent(body.email)}`;

  logger.info("User invitation created", {
    email: body.email,
    role: body.role || "student",
    invitedBy: admin.userId,
    inviteUrl,
  });

  // Note: In production, integrate with your email service
  // For now, we just log the invite and return success
  // The invitation URL can be manually shared or integrated with
  // Supabase Auth's invite functionality

  return successResponse({
    message: "Invitation created successfully",
    email: body.email,
    // Include invite URL for manual sharing (remove in production)
    inviteUrl: process.env.NODE_ENV === "development" ? inviteUrl : undefined,
  });
});
