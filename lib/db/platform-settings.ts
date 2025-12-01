/**
 * Platform Settings Repository
 * Manages global platform configuration
 *
 * Uses platform_settings table with fallback to defaults.
 */

import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

export interface PlatformSettings {
  id: string;
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  category:
    | "general"
    | "email"
    | "payment"
    | "security"
    | "branding"
    | "features";
  description: string | null;
  is_sensitive: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface GeneralSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  support_url: string;
}

export interface EmailSettings {
  notifications_enabled: boolean;
  from_email: string;
  from_name: string;
  reply_to: string;
}

export interface SecuritySettings {
  maintenance_mode: boolean;
  allow_registrations: boolean;
  require_email_verification: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
}

export interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
}

export interface FeatureFlags {
  enable_courses: boolean;
  enable_events: boolean;
  enable_assessments: boolean;
  enable_certificates: boolean;
  enable_gamification: boolean;
  enable_organizations: boolean;
}

const DEFAULT_SETTINGS: Record<
  string,
  {
    value: unknown;
    category: PlatformSettings["category"];
    description: string;
  }
> = {
  // General
  site_name: {
    value: "NeuroElemental",
    category: "general",
    description: "Platform name displayed across the site",
  },
  site_description: {
    value: "Energy management for neurodivergent brains",
    category: "general",
    description: "Site tagline and meta description",
  },
  contact_email: {
    value: "support@neuroelemental.com",
    category: "general",
    description: "Primary contact email",
  },
  support_url: {
    value: "https://neuroelemental.com/support",
    category: "general",
    description: "Support page URL",
  },
  // Email
  notifications_enabled: {
    value: true,
    category: "email",
    description: "Master toggle for email notifications",
  },
  from_email: {
    value: "noreply@neuroelemental.com",
    category: "email",
    description: "Default sender email address",
  },
  from_name: {
    value: "NeuroElemental",
    category: "email",
    description: "Default sender name",
  },
  reply_to: {
    value: "support@neuroelemental.com",
    category: "email",
    description: "Reply-to email address",
  },
  // Security
  maintenance_mode: {
    value: false,
    category: "security",
    description: "Enable maintenance mode to block public access",
  },
  allow_registrations: {
    value: true,
    category: "security",
    description: "Allow new user registrations",
  },
  require_email_verification: {
    value: true,
    category: "security",
    description: "Require email verification for new accounts",
  },
  session_timeout_minutes: {
    value: 1440,
    category: "security",
    description: "Session timeout in minutes (default: 24 hours)",
  },
  max_login_attempts: {
    value: 5,
    category: "security",
    description: "Max failed login attempts before lockout",
  },
  // Branding
  logo_url: {
    value: "/logo.svg",
    category: "branding",
    description: "Site logo URL",
  },
  favicon_url: {
    value: "/favicon.ico",
    category: "branding",
    description: "Favicon URL",
  },
  primary_color: {
    value: "#667eea",
    category: "branding",
    description: "Primary brand color",
  },
  secondary_color: {
    value: "#764BA2",
    category: "branding",
    description: "Secondary brand color",
  },
  // Features
  enable_courses: {
    value: true,
    category: "features",
    description: "Enable course functionality",
  },
  enable_events: {
    value: true,
    category: "features",
    description: "Enable events functionality",
  },
  enable_assessments: {
    value: true,
    category: "features",
    description: "Enable assessment functionality",
  },
  enable_certificates: {
    value: true,
    category: "features",
    description: "Enable certificate generation",
  },
  enable_gamification: {
    value: true,
    category: "features",
    description: "Enable achievements and gamification",
  },
  enable_organizations: {
    value: true,
    category: "features",
    description: "Enable B2B organization features",
  },
};

/**
 * Get a single platform setting
 */
export async function getPlatformSetting(key: string): Promise<unknown> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("platform_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data) {
      // Fall back to defaults if not found in DB
      return DEFAULT_SETTINGS[key]?.value ?? null;
    }

    return data.value;
  } catch (err) {
    logger.error("Error fetching platform setting", err as Error);
    return DEFAULT_SETTINGS[key]?.value ?? null;
  }
}

/**
 * Get all platform settings
 */
export async function getAllPlatformSettings(): Promise<
  Record<string, unknown>
> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("platform_settings")
      .select("key, value");

    if (error || !data) {
      // Fall back to defaults
      return Object.fromEntries(
        Object.entries(DEFAULT_SETTINGS).map(([key, setting]) => [
          key,
          setting.value,
        ])
      );
    }

    const settings: Record<string, unknown> = {};
    for (const row of data) {
      settings[row.key] = row.value;
    }
    return settings;
  } catch (err) {
    logger.error("Error fetching all platform settings", err as Error);
    return Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS).map(([key, setting]) => [
        key,
        setting.value,
      ])
    );
  }
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(
  category: PlatformSettings["category"]
): Promise<Record<string, unknown>> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("platform_settings")
      .select("key, value")
      .eq("category", category);

    if (error || !data) {
      // Fall back to defaults
      return Object.fromEntries(
        Object.entries(DEFAULT_SETTINGS)
          .filter(([_, setting]) => setting.category === category)
          .map(([key, setting]) => [key, setting.value])
      );
    }

    const settings: Record<string, unknown> = {};
    for (const row of data) {
      settings[row.key] = row.value;
    }
    return settings;
  } catch (err) {
    logger.error("Error fetching settings by category", err as Error);
    return Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS)
        .filter(([_, setting]) => setting.category === category)
        .map(([key, setting]) => [key, setting.value])
    );
  }
}

/**
 * Update a platform setting
 */
export async function updatePlatformSetting(
  key: string,
  value: unknown,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const defaultSetting = DEFAULT_SETTINGS[key];
  if (!defaultSetting) {
    return { success: false, error: "Unknown setting key" };
  }

  try {
    const supabase = getSupabaseServer();

    const { error } = await (supabase as any)
      .from("platform_settings")
      .update({
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || null,
      })
      .eq("key", key);

    if (error) {
      logger.error("Error updating platform setting", error);
      return { success: false, error: "Failed to update setting" };
    }

    logger.info(`Platform setting updated: ${key}`);
    return { success: true };
  } catch (err) {
    logger.error("Error updating platform setting", err as Error);
    return { success: false, error: "Failed to update setting" };
  }
}

/**
 * Update multiple platform settings at once
 */
export async function updatePlatformSettings(
  settings: Record<string, unknown>,
  updatedBy?: string
): Promise<{ success: boolean; error?: string }> {
  const validKeys = Object.keys(settings).filter(
    (key) => DEFAULT_SETTINGS[key]
  );

  if (validKeys.length === 0) {
    return { success: false, error: "No valid settings to update" };
  }

  try {
    const supabase = getSupabaseServer();

    // Update each setting
    for (const key of validKeys) {
      await (supabase as any)
        .from("platform_settings")
        .update({
          value: JSON.stringify(settings[key]),
          updated_at: new Date().toISOString(),
          updated_by: updatedBy || null,
        })
        .eq("key", key);
    }

    logger.info(`Platform settings updated: ${validKeys.join(", ")}`);
    return { success: true };
  } catch (err) {
    logger.error("Error updating platform settings", err as Error);
    return { success: false, error: "Failed to update settings" };
  }
}

/**
 * Check if a feature is enabled
 */
export async function isFeatureEnabled(
  feature: keyof FeatureFlags
): Promise<boolean> {
  const value = await getPlatformSetting(feature);
  return value === true;
}

/**
 * Check if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const value = await getPlatformSetting("maintenance_mode");
  return value === true;
}

export const platformSettingsRepository = {
  get: getPlatformSetting,
  getAll: getAllPlatformSettings,
  getByCategory: getSettingsByCategory,
  update: updatePlatformSetting,
  updateMany: updatePlatformSettings,
  isFeatureEnabled,
  isMaintenanceMode,
  defaults: DEFAULT_SETTINGS,
};
