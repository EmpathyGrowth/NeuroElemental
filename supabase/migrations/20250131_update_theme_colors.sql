-- Migration: Update Theme Settings Colors
-- Adds all required color keys for proper Tailwind/shadcn integration

-- Update the default theme to include all required color keys
UPDATE theme_settings
SET
  colors = jsonb_build_object(
    -- Core colors
    'primary', '#8b5cf6',
    'primaryForeground', '#fafafa',
    'secondary', '#27272a',
    'secondaryForeground', '#fafafa',
    'accent', '#8b5cf6',
    'accentForeground', '#fafafa',
    -- Surface colors
    'background', '#0a0a0f',
    'foreground', '#fafafa',
    'card', '#18181b',
    'cardForeground', '#fafafa',
    'popover', '#18181b',
    'popoverForeground', '#fafafa',
    'muted', '#27272a',
    'mutedForeground', '#a1a1aa',
    -- UI colors
    'border', '#27272a',
    'input', '#27272a',
    'ring', '#8b5cf6',
    -- Semantic colors
    'destructive', '#ef4444',
    'destructiveForeground', '#fafafa'
  ),
  dark_colors = jsonb_build_object(
    -- Core colors (same as default since it's dark mode first)
    'primary', '#8b5cf6',
    'primaryForeground', '#fafafa',
    'secondary', '#27272a',
    'secondaryForeground', '#fafafa',
    'accent', '#8b5cf6',
    'accentForeground', '#fafafa',
    -- Surface colors
    'background', '#0a0a0f',
    'foreground', '#fafafa',
    'card', '#18181b',
    'cardForeground', '#fafafa',
    'popover', '#18181b',
    'popoverForeground', '#fafafa',
    'muted', '#27272a',
    'mutedForeground', '#a1a1aa',
    -- UI colors
    'border', '#27272a',
    'input', '#27272a',
    'ring', '#8b5cf6',
    -- Semantic colors
    'destructive', '#ef4444',
    'destructiveForeground', '#fafafa'
  )
WHERE name = 'Default Theme';

-- Add light mode colors for the default theme
-- These will be used when users switch to light mode
UPDATE theme_settings
SET colors = jsonb_build_object(
    -- Core colors
    'primary', '#8b5cf6',
    'primaryForeground', '#ffffff',
    'secondary', '#f4f4f5',
    'secondaryForeground', '#18181b',
    'accent', '#f4f4f5',
    'accentForeground', '#8b5cf6',
    -- Surface colors
    'background', '#fafafa',
    'foreground', '#18181b',
    'card', '#ffffff',
    'cardForeground', '#18181b',
    'popover', '#ffffff',
    'popoverForeground', '#18181b',
    'muted', '#f4f4f5',
    'mutedForeground', '#71717a',
    -- UI colors
    'border', '#e4e4e7',
    'input', '#e4e4e7',
    'ring', '#8b5cf6',
    -- Semantic colors
    'destructive', '#dc2626',
    'destructiveForeground', '#fafafa'
  )
WHERE name = 'Default Theme';

-- Alter default column values for new themes
ALTER TABLE theme_settings
ALTER COLUMN colors SET DEFAULT '{
  "primary": "#8b5cf6",
  "primaryForeground": "#fafafa",
  "secondary": "#27272a",
  "secondaryForeground": "#fafafa",
  "accent": "#8b5cf6",
  "accentForeground": "#fafafa",
  "background": "#fafafa",
  "foreground": "#18181b",
  "card": "#ffffff",
  "cardForeground": "#18181b",
  "popover": "#ffffff",
  "popoverForeground": "#18181b",
  "muted": "#f4f4f5",
  "mutedForeground": "#71717a",
  "border": "#e4e4e7",
  "input": "#e4e4e7",
  "ring": "#8b5cf6",
  "destructive": "#dc2626",
  "destructiveForeground": "#fafafa"
}'::jsonb;

ALTER TABLE theme_settings
ALTER COLUMN dark_colors SET DEFAULT '{
  "primary": "#8b5cf6",
  "primaryForeground": "#fafafa",
  "secondary": "#27272a",
  "secondaryForeground": "#fafafa",
  "accent": "#8b5cf6",
  "accentForeground": "#fafafa",
  "background": "#0a0a0f",
  "foreground": "#fafafa",
  "card": "#18181b",
  "cardForeground": "#fafafa",
  "popover": "#18181b",
  "popoverForeground": "#fafafa",
  "muted": "#27272a",
  "mutedForeground": "#a1a1aa",
  "border": "#27272a",
  "input": "#27272a",
  "ring": "#8b5cf6",
  "destructive": "#ef4444",
  "destructiveForeground": "#fafafa"
}'::jsonb;
