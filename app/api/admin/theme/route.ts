/**
 * Admin Theme Settings API
 * GET - Get all themes
 * POST - Create a new theme
 * PATCH - Update theme or activate
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { themeSettingsRepository } from "@/lib/db/theme-settings";
import { z } from "zod";

const colorSchema = z.object({
  // Core colors
  primary: z.string().optional(),
  primaryForeground: z.string().optional(),
  secondary: z.string().optional(),
  secondaryForeground: z.string().optional(),
  accent: z.string().optional(),
  accentForeground: z.string().optional(),
  // Surface colors
  background: z.string().optional(),
  foreground: z.string().optional(),
  card: z.string().optional(),
  cardForeground: z.string().optional(),
  popover: z.string().optional(),
  popoverForeground: z.string().optional(),
  muted: z.string().optional(),
  mutedForeground: z.string().optional(),
  // UI colors
  border: z.string().optional(),
  input: z.string().optional(),
  ring: z.string().optional(),
  // Semantic colors
  destructive: z.string().optional(),
  destructiveForeground: z.string().optional(),
  success: z.string().optional(),
  warning: z.string().optional(),
});

const typographySchema = z.object({
  fontFamily: z.string().optional(),
  headingFamily: z.string().optional(),
  baseFontSize: z.string().optional(),
  lineHeight: z.string().optional(),
  headingWeight: z.string().optional(),
  bodyWeight: z.string().optional(),
});

const layoutSchema = z.object({
  maxWidth: z.string().optional(),
  containerPadding: z.string().optional(),
  sectionSpacing: z.string().optional(),
  borderRadius: z.string().optional(),
  cardPadding: z.string().optional(),
});

const componentsSchema = z.object({
  buttonStyle: z.enum(["rounded", "square", "pill"]).optional(),
  inputStyle: z.enum(["bordered", "filled", "underlined"]).optional(),
  cardStyle: z.enum(["flat", "bordered", "elevated"]).optional(),
  navStyle: z.enum(["static", "sticky", "fixed"]).optional(),
});

const themeUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  colors: colorSchema.optional(),
  dark_colors: colorSchema.optional(),
  typography: typographySchema.optional(),
  layout: layoutSchema.optional(),
  components: componentsSchema.optional(),
  custom_css: z.string().max(50000).optional().nullable(),
});

/**
 * GET /api/admin/theme
 * Get all themes
 */
export const GET = createAdminRoute(async () => {
  const themes = await themeSettingsRepository.getAll();
  const activeTheme = await themeSettingsRepository.getActiveTheme();
  return successResponse({ themes, activeThemeId: activeTheme?.id });
});

/**
 * POST /api/admin/theme
 * Create a new theme or duplicate
 */
export const POST = createAdminRoute(async (request) => {
  const body = await request.json();
  const action = body.action;

  if (action === "duplicate") {
    const { id, name } = body;
    if (!id || !name) {
      throw badRequestError("id and name required for duplicate");
    }
    const theme = await themeSettingsRepository.duplicate(id, name);
    return successResponse({ theme, message: "Theme duplicated" }, 201);
  }

  // Create new theme
  const name = body.name;
  if (!name) {
    throw badRequestError("name required");
  }
  const theme = await themeSettingsRepository.create(name);
  return successResponse({ theme, message: "Theme created" }, 201);
});

/**
 * PATCH /api/admin/theme
 * Update theme or activate
 */
export const PATCH = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();
  const { id, action } = body;

  if (!id) {
    throw badRequestError("id required");
  }

  // Activate theme
  if (action === "activate") {
    const theme = await themeSettingsRepository.activateTheme(id);
    return successResponse({ theme, message: "Theme activated" });
  }

  // Update theme
  const parsed = themeUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.errors[0]?.message || "Invalid theme data"
    );
  }

  const theme = await themeSettingsRepository.update(id, parsed.data, userId);
  return successResponse({ theme, message: "Theme updated" });
});
