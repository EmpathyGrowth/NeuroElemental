/**
 * Theme Settings Repository
 * Manages site theme and appearance settings
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Color palette - matches Tailwind/shadcn CSS variables */
export interface ThemeColors {
  // Core colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  // Surface colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  muted: string;
  mutedForeground: string;
  // UI colors
  border: string;
  input: string;
  ring: string;
  // Semantic colors
  destructive: string;
  destructiveForeground: string;
  success?: string;
  warning?: string;
}

/** Typography settings */
export interface ThemeTypography {
  fontFamily: string;
  headingFamily: string;
  baseFontSize: string;
  lineHeight: string;
  headingWeight: string;
  bodyWeight: string;
}

/** Layout settings */
export interface ThemeLayout {
  maxWidth: string;
  containerPadding: string;
  sectionSpacing: string;
  borderRadius: string;
  cardPadding: string;
}

/** Component styles */
export interface ThemeComponents {
  buttonStyle: "rounded" | "square" | "pill";
  inputStyle: "bordered" | "filled" | "underlined";
  cardStyle: "flat" | "bordered" | "elevated";
  navStyle: "static" | "sticky" | "fixed";
}

/** Theme settings */
export interface ThemeSettings {
  id: string;
  name: string;
  is_active: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  components: ThemeComponents;
  dark_colors: ThemeColors;
  custom_css: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

/** CSS variables for theme */
export interface ThemeCssVariables {
  light: Record<string, string>;
  dark: Record<string, string>;
  typography: Record<string, string>;
  layout: Record<string, string>;
}

/** Theme update */
export interface ThemeSettingsUpdate {
  name?: string;
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  layout?: Partial<ThemeLayout>;
  components?: Partial<ThemeComponents>;
  dark_colors?: Partial<ThemeColors>;
  custom_css?: string | null;
}

/**
 * Theme Settings Repository
 */
export class ThemeSettingsRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Get active theme
   */
  async getActiveTheme(): Promise<ThemeSettings | null> {
    const { data, error } = await this.supabase
      .from("theme_settings")
      .select("*")
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ThemeSettings;
  }

  /**
   * Get theme CSS variables
   */
  async getThemeCssVariables(): Promise<ThemeCssVariables | null> {
    const theme = await this.getActiveTheme();
    if (!theme) return null;

    return this.generateCssVariables(theme);
  }

  /**
   * Get all themes
   */
  async getAll(): Promise<ThemeSettings[]> {
    const { data, error } = await this.supabase
      .from("theme_settings")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching themes", error);
      return [];
    }

    return (data || []) as ThemeSettings[];
  }

  /**
   * Get theme by ID
   */
  async findById(id: string): Promise<ThemeSettings> {
    const { data, error } = await this.supabase
      .from("theme_settings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching theme", error);
      throw internalError("Theme not found");
    }

    return data as ThemeSettings;
  }

  /**
   * Create a new theme
   */
  async create(name: string): Promise<ThemeSettings> {
    const { data, error } = await this.supabase
      .from("theme_settings")
      .insert({ name, is_active: false })
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating theme", error);
      throw internalError("Failed to create theme");
    }

    return data as ThemeSettings;
  }

  /**
   * Update theme
   */
  async update(
    id: string,
    updates: ThemeSettingsUpdate,
    updatedBy?: string
  ): Promise<ThemeSettings> {
    // Get current theme to merge
    const current = await this.findById(id);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || null,
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.custom_css !== undefined)
      updateData.custom_css = updates.custom_css;

    if (updates.colors) {
      updateData.colors = { ...current.colors, ...updates.colors };
    }
    if (updates.dark_colors) {
      updateData.dark_colors = {
        ...current.dark_colors,
        ...updates.dark_colors,
      };
    }
    if (updates.typography) {
      updateData.typography = { ...current.typography, ...updates.typography };
    }
    if (updates.layout) {
      updateData.layout = { ...current.layout, ...updates.layout };
    }
    if (updates.components) {
      updateData.components = { ...current.components, ...updates.components };
    }

    const { data, error } = await this.supabase
      .from("theme_settings")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating theme", error);
      throw internalError("Failed to update theme");
    }

    return data as ThemeSettings;
  }

  /**
   * Activate a theme (deactivates others)
   */
  async activateTheme(id: string): Promise<ThemeSettings> {
    // Deactivate all themes
    await this.supabase
      .from("theme_settings")
      .update({ is_active: false })
      .neq("id", id);

    // Activate the selected theme
    const { data, error } = await this.supabase
      .from("theme_settings")
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error activating theme", error);
      throw internalError("Failed to activate theme");
    }

    return data as ThemeSettings;
  }

  /**
   * Delete a theme (cannot delete active theme)
   */
  async delete(id: string): Promise<void> {
    const theme = await this.findById(id);
    if (theme.is_active) {
      throw internalError("Cannot delete active theme");
    }

    const { error } = await this.supabase
      .from("theme_settings")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting theme", error);
      throw internalError("Failed to delete theme");
    }
  }

  /**
   * Duplicate a theme
   */
  async duplicate(id: string, newName: string): Promise<ThemeSettings> {
    const theme = await this.findById(id);

    const { data, error } = await this.supabase
      .from("theme_settings")
      .insert({
        name: newName,
        is_active: false,
        colors: theme.colors,
        typography: theme.typography,
        layout: theme.layout,
        components: theme.components,
        dark_colors: theme.dark_colors,
        custom_css: theme.custom_css,
      })
      .select()
      .single();

    if (error || !data) {
      logger.error("Error duplicating theme", error);
      throw internalError("Failed to duplicate theme");
    }

    return data as ThemeSettings;
  }

  /**
   * Generate CSS variables from theme
   */
  private generateCssVariables(theme: ThemeSettings): ThemeCssVariables {
    const light: Record<string, string> = {};
    const dark: Record<string, string> = {};
    const typography: Record<string, string> = {};
    const layout: Record<string, string> = {};

    // Light mode colors - convert hex to HSL for Tailwind compatibility
    for (const [key, value] of Object.entries(theme.colors)) {
      const hsl = this.hexToHsl(value);
      light[`--color-${this.kebabCase(key)}`] = hsl;
    }

    // Dark mode colors
    for (const [key, value] of Object.entries(theme.dark_colors)) {
      const hsl = this.hexToHsl(value);
      dark[`--color-${this.kebabCase(key)}`] = hsl;
    }

    // Typography
    for (const [key, value] of Object.entries(theme.typography)) {
      typography[`--${this.kebabCase(key)}`] = value;
    }

    // Layout
    for (const [key, value] of Object.entries(theme.layout)) {
      layout[`--${this.kebabCase(key)}`] = value;
    }

    return { light, dark, typography, layout };
  }

  /**
   * Convert camelCase to kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }

  /**
   * Convert hex color to HSL format for Tailwind CSS
   * Returns format: "hsl(h s% l%)"
   */
  private hexToHsl(hex: string): string {
    // If already HSL format, return as-is
    if (hex.startsWith("hsl")) {
      return hex;
    }

    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Parse hex values
    let r: number, g: number, b: number;
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    // Convert to degrees and percentages
    const hDeg = Math.round(h * 360);
    const sPercent = Math.round(s * 100);
    const lPercent = Math.round(l * 100);

    return `hsl(${hDeg} ${sPercent}% ${lPercent}%)`;
  }
}

/** Singleton instance */
export const themeSettingsRepository = new ThemeSettingsRepository();
