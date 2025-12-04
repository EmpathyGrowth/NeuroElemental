/**
 * Admin Authentication Middleware
 * Centralizes admin permission checks to eliminate code duplication
 */

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getSupabaseServer } from "@/lib/db/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export interface AdminAuthResult {
  authenticated: boolean;
  isAdmin: boolean;
  userId?: string;
  error?: NextResponse;
}

/**
 * Require admin role for a request
 * Returns error response if not authenticated or not admin
 *
 * @example
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAdmin()
 *   if (auth.error) return auth.error
 *
 *   // Continue with admin-only logic
 *   const userId = auth.userId
 * }
 */
export async function requireAdmin(
  _request?: NextRequest
): Promise<AdminAuthResult> {
  // Check authentication
  const user = await getCurrentUser();

  if (!user) {
    return {
      authenticated: false,
      isAdmin: false,
      error: NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      ),
    };
  }

  // Check admin role
  const supabase = getSupabaseServer();
  const { data: profile, error } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string } | null; error: Error | null };

  if (error || !profile || profile.role !== "admin") {
    return {
      authenticated: true,
      isAdmin: false,
      userId: user.id,
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
    };
  }

  return {
    authenticated: true,
    isAdmin: true,
    userId: user.id,
  };
}

/**
 * Check if current user is admin (returns boolean)
 * Use when you need to conditionally show/hide features
 *
 * @example
 * const isAdmin = await isUserAdmin()
 * if (isAdmin) {
 *   // Show admin features
 * }
 */
export async function isUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = getSupabaseServer();
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string } | null };

  return profile?.role === "admin";
}

/**
 * Get current user's role
 */
export async function getUserRole(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = getSupabaseServer();
  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string } | null };

  return profile?.role || null;
}
