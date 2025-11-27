-- ============================================
-- FIX PROFILE INSERT POLICY
-- Migration: 003_fix_profile_insert_policy
-- Created: 2025-11-20
-- Issue: Users cannot create profiles during signup
-- ============================================

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- This allows the signup flow to create a profile entry
-- when a new user registers
