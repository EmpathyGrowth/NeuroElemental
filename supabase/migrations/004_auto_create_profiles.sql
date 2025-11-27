-- ============================================
-- AUTO-CREATE PROFILES WITH DATABASE TRIGGER
-- Migration: 004_auto_create_profiles
-- Created: 2025-11-20
-- Solution: Use trigger instead of manual insert
-- ============================================

-- First, drop the INSERT policy if it exists (we won't need it)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create a function that automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'registered'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that calls the function after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Now profiles are created automatically by the database
-- No need for the application code to insert into profiles
