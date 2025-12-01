-- Migration: Add onboarding tracking to profiles
-- This allows users to resume incomplete onboarding

-- Add onboarding tracking columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_current_step TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN profiles.onboarding_current_step IS 'Current step ID in onboarding flow (welcome, role, profile, assessment, complete)';
COMMENT ON COLUMN profiles.onboarding_completed_at IS 'Timestamp when user completed onboarding';

-- Create index for querying incomplete onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_incomplete
ON profiles (onboarding_current_step)
WHERE onboarding_completed_at IS NULL AND onboarding_current_step IS NOT NULL;
