-- Migration: Create user preferences tables
-- Supports learning preferences and appearance settings

-- ============================================================================
-- Learning Preferences Table
-- Stores user's learning style preferences for course recommendations
-- ============================================================================

CREATE TABLE IF NOT EXISTS learning_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Learning style preferences (1-5 scale or boolean)
  preferred_pace TEXT CHECK (preferred_pace IN ('slow', 'moderate', 'fast', 'self_paced')),
  preferred_format TEXT[] DEFAULT '{}', -- 'video', 'reading', 'interactive', 'audio'
  preferred_session_length INTEGER DEFAULT 30, -- minutes

  -- Content preferences
  difficulty_preference TEXT CHECK (difficulty_preference IN ('beginner', 'intermediate', 'advanced', 'mixed')),
  topic_interests TEXT[] DEFAULT '{}', -- areas of interest

  -- Accessibility preferences
  enable_subtitles BOOLEAN DEFAULT false,
  enable_transcripts BOOLEAN DEFAULT false,
  playback_speed DECIMAL(2,1) DEFAULT 1.0,

  -- Notification preferences for learning
  daily_reminder_enabled BOOLEAN DEFAULT false,
  daily_reminder_time TIME,
  weekly_goal_minutes INTEGER DEFAULT 60,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user
  CONSTRAINT unique_learning_preferences_per_user UNIQUE (user_id)
);

-- Index for quick lookups by user
CREATE INDEX IF NOT EXISTS idx_learning_preferences_user_id ON learning_preferences(user_id);

-- Enable RLS
ALTER TABLE learning_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view own learning preferences"
  ON learning_preferences FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own learning preferences"
  ON learning_preferences FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own learning preferences"
  ON learning_preferences FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own learning preferences"
  ON learning_preferences FOR DELETE
  USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- Appearance Preferences Table
-- Stores user's visual/UI preferences
-- ============================================================================

CREATE TABLE IF NOT EXISTS appearance_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Theme settings
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  accent_color TEXT DEFAULT 'purple', -- primary color preference

  -- Accessibility settings
  font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'x-large')),
  enable_dyslexia_font BOOLEAN DEFAULT false,
  reduce_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,

  -- Display preferences
  compact_mode BOOLEAN DEFAULT false,
  show_sidebar BOOLEAN DEFAULT true,
  dashboard_layout TEXT DEFAULT 'default', -- 'default', 'compact', 'detailed'

  -- Energy orb visualization preferences
  orb_animation_enabled BOOLEAN DEFAULT true,
  orb_size TEXT DEFAULT 'medium' CHECK (orb_size IN ('small', 'medium', 'large')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user
  CONSTRAINT unique_appearance_preferences_per_user UNIQUE (user_id)
);

-- Index for quick lookups by user
CREATE INDEX IF NOT EXISTS idx_appearance_preferences_user_id ON appearance_preferences(user_id);

-- Enable RLS
ALTER TABLE appearance_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view own appearance preferences"
  ON appearance_preferences FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own appearance preferences"
  ON appearance_preferences FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own appearance preferences"
  ON appearance_preferences FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own appearance preferences"
  ON appearance_preferences FOR DELETE
  USING ((SELECT auth.uid()) = user_id);


-- ============================================================================
-- Function to auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_learning_preferences_updated_at
  BEFORE UPDATE ON learning_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_updated_at();

CREATE TRIGGER update_appearance_preferences_updated_at
  BEFORE UPDATE ON appearance_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_preferences_updated_at();


-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE learning_preferences IS 'User learning style and course preferences';
COMMENT ON TABLE appearance_preferences IS 'User interface and accessibility preferences';

COMMENT ON COLUMN learning_preferences.preferred_pace IS 'Preferred learning pace: slow, moderate, fast, or self_paced';
COMMENT ON COLUMN learning_preferences.preferred_format IS 'Array of preferred content formats: video, reading, interactive, audio';
COMMENT ON COLUMN learning_preferences.weekly_goal_minutes IS 'Weekly learning time goal in minutes';

COMMENT ON COLUMN appearance_preferences.theme IS 'UI theme: light, dark, or system (auto)';
COMMENT ON COLUMN appearance_preferences.enable_dyslexia_font IS 'Use dyslexia-friendly font throughout the app';
COMMENT ON COLUMN appearance_preferences.reduce_motion IS 'Reduce or disable animations for accessibility';
