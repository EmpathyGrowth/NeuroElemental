-- Create storage buckets for the application
-- Migration: 20250128_create_storage_buckets.sql

-- Create avatars bucket (public, for user profile images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Create images bucket (public, for course thumbnails, blog images, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create resources bucket (private, for course materials, PDFs, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav']
) ON CONFLICT (id) DO NOTHING;

-- Create certificates bucket (private, for generated certificates)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'certificates',
  'certificates',
  false,
  5242880, -- 5MB
  ARRAY['application/pdf', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- Create course-materials bucket (private, for downloadable course content)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials',
  'course-materials',
  false,
  104857600, -- 100MB
  ARRAY['application/pdf', 'application/zip', 'application/x-zip-compressed', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'image/jpeg', 'image/png']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS Policies for avatars bucket (public read, authenticated upload)
-- ============================================================================

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ============================================================================
-- RLS Policies for images bucket (public read, authenticated upload)
-- ============================================================================

-- Allow anyone to view images (public bucket for course thumbnails, blog images)
CREATE POLICY "Public image access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'images'
    AND (SELECT auth.uid()) IS NOT NULL
  );

-- Allow users to update their own images (based on folder structure)
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'images'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'images'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Allow admins to manage all images
CREATE POLICY "Admins can manage all images" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for resources bucket (private, role-based access)
-- ============================================================================

-- Allow instructors and admins to upload resources
CREATE POLICY "Instructors can upload resources" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'resources'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (SELECT auth.uid())
      AND profiles.role IN ('instructor', 'admin')
    )
  );

-- Allow users to read resources they have access to (enrolled courses)
CREATE POLICY "Users can read accessible resources" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'resources'
    AND (
      -- Admins and instructors can read all
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.role IN ('instructor', 'admin')
      )
      -- Or enrolled students
      OR EXISTS (
        SELECT 1 FROM enrollments e
        JOIN lessons l ON l.course_id = e.course_id
        WHERE e.user_id = (SELECT auth.uid())
        AND storage.filename(name) LIKE l.id::text || '%'
      )
    )
  );

-- Allow instructors to update/delete their own resources
CREATE POLICY "Instructors can manage own resources" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'resources'
    AND (SELECT auth.uid()) IS NOT NULL
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- ============================================================================
-- RLS Policies for certificates bucket (private, user-specific access)
-- ============================================================================

-- Allow system to generate certificates (via service role)
-- Users can only read their own certificates
CREATE POLICY "Users can read own certificates" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'certificates'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

-- Admins can manage all certificates
CREATE POLICY "Admins can manage certificates" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- RLS Policies for course-materials bucket (private, course-based access)
-- ============================================================================

-- Allow instructors to upload course materials
CREATE POLICY "Instructors can upload course materials" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = (SELECT auth.uid())
      AND profiles.role IN ('instructor', 'admin')
    )
  );

-- Allow enrolled users to download course materials
CREATE POLICY "Enrolled users can access course materials" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'course-materials'
    AND (
      -- Admins and instructors can read all
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.user_id = (SELECT auth.uid())
        AND profiles.role IN ('instructor', 'admin')
      )
      -- Or enrolled students for specific course
      OR EXISTS (
        SELECT 1 FROM enrollments e
        WHERE e.user_id = (SELECT auth.uid())
        AND (storage.foldername(name))[1] = e.course_id::text
      )
    )
  );

-- Allow instructors to manage materials for their courses
CREATE POLICY "Instructors can manage course materials" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'course-materials'
    AND EXISTS (
      SELECT 1 FROM courses c
      WHERE c.instructor_id = (SELECT auth.uid())
      AND (storage.foldername(name))[1] = c.id::text
    )
  );
