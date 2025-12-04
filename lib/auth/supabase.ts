import { logger } from "@/lib/logging/logger";
import { createClient as createBrowserSingleton } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/supabase";
import { createClient as createJsClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabase =
  typeof window !== "undefined"
    ? createBrowserSingleton()
    : createJsClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

/**
 * Sign up a new user with email and password
 * Note: Profile is automatically created by database trigger
 */
export async function signUp(
  email: string,
  password: string,
  full_name: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  // Profile is automatically created by the database trigger (handle_new_user)
  // No need to manually insert into profiles table

  return { data, error };
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Sign in with OAuth provider (Google, GitHub, etc.)
 */
export async function signInWithOAuth(
  provider: "google" | "github" | "azure" | "linkedin"
) {
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
}

/**
 * Sign out the current user
 */
export async function signOut() {
  return await supabase.auth.signOut();
}

/**
 * Get the current user's session
 */
export async function getSession() {
  return await supabase.auth.getSession();
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get user's role from the profiles table
 */
export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle() as { data: { role: string } | null; error: unknown };

    if (error) {
      logger.error(
        "Error fetching user role",
        new Error(JSON.stringify(error))
      );
      return null;
    }

    return data?.role || null;
  } catch (err) {
    logger.error("Exception in getUserRole", err as Error);
    return null;
  }
}

/**
 * Get full user profile
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors if not found

    if (error) {
      logger.error(
        "Error fetching user profile",
        new Error(JSON.stringify(error)),
        { userId, errorDetails: error }
      );
      return null;
    }

    if (!data) {
      logger.warn("No profile found for user", {
        userId,
        message:
          "Profile may need to be created manually or trigger may not have fired",
      });
      return null;
    }

    return data;
  } catch (err) {
    logger.error("Exception in getUserProfile", err as Error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    full_name?: string;
    avatar_url?: string;
  }
) {
  const { data, error } = await (supabase as any)
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Check if user has specific permission based on role
 */
export async function checkPermission(
  userId: string,
  allowedRoles: string[]
): Promise<boolean> {
  const role = await getUserRole(userId);
  return role ? allowedRoles.includes(role) : false;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  return await supabase.auth.updateUser({
    password: newPassword,
  });
}
