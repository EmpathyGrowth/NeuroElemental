-- Migration: UI/UX Improvements
-- Creates tables for achievements, streaks, reviews, bookmarks, notes, announcements,
-- instructor applications, and departments

-- ============================================================================
-- INSTRUCTOR APPLICATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS instructor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experience_years INTEGER NOT NULL,
  background TEXT NOT NULL,
  motivation TEXT NOT NULL,
  specializations TEXT[] NOT NULL DEFAULT '{}',
  website_url TEXT,
  linkedin_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instructor_applications_user_id ON instructor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_instructor_applications_status ON instructor_applications(status);

-- ============================================================================
-- ACHIEVEMENTS / BADGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  category TEXT CHECK (category IN ('learning', 'social', 'milestone', 'course', 'engagement')),
  points INTEGER DEFAULT 0,
  criteria JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ============================================================================
-- LEARNING STREAKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_history JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COURSE REVIEWS
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  instructor_response TEXT,
  responded_at TIMESTAMPTZ,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user_id ON course_reviews(user_id);

-- ============================================================================
-- LESSON BOOKMARKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS lesson_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_user_id ON lesson_bookmarks(user_id);

-- ============================================================================
-- LESSON NOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS lesson_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_id ON lesson_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson_id ON lesson_notes(lesson_id);

-- ============================================================================
-- COURSE ANNOUNCEMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_announcements_course_id ON course_announcements(course_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Instructor Applications RLS
ALTER TABLE instructor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own applications"
  ON instructor_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
  ON instructor_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON instructor_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON instructor_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Achievements RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active achievements"
  ON achievements FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage achievements"
  ON achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- User Achievements RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Learning Streaks RLS
ALTER TABLE learning_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
  ON learning_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON learning_streaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON learning_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Course Reviews RLS
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible reviews"
  ON course_reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Users can view their own reviews"
  ON course_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews for enrolled courses"
  ON course_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_enrollments.course_id = course_reviews.course_id
      AND course_enrollments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update their own reviews"
  ON course_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can respond to reviews on their courses"
  ON course_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_reviews.course_id
      AND courses.instructor_id = (SELECT auth.uid())
    )
  );

-- Lesson Bookmarks RLS
ALTER TABLE lesson_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks"
  ON lesson_bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Lesson Notes RLS
ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes"
  ON lesson_notes FOR ALL
  USING (auth.uid() = user_id);

-- Course Announcements RLS
ALTER TABLE course_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrolled users can view announcements"
  ON course_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_enrollments.course_id = course_announcements.course_id
      AND course_enrollments.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Instructors can view their course announcements"
  ON course_announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_announcements.course_id
      AND courses.instructor_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Instructors can manage their course announcements"
  ON course_announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_announcements.course_id
      AND courses.instructor_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- SEED DEFAULT ACHIEVEMENTS
-- ============================================================================
INSERT INTO achievements (name, description, icon_url, category, points, criteria) VALUES
  ('First Steps', 'Complete your first lesson', NULL, 'milestone', 10, '{"type": "lessons_completed", "count": 1}'),
  ('Quick Learner', 'Complete 10 lessons', NULL, 'learning', 25, '{"type": "lessons_completed", "count": 10}'),
  ('Dedicated Student', 'Complete 50 lessons', NULL, 'learning', 100, '{"type": "lessons_completed", "count": 50}'),
  ('Course Graduate', 'Complete your first course', NULL, 'course', 50, '{"type": "courses_completed", "count": 1}'),
  ('Multi-Talented', 'Complete 3 courses', NULL, 'course', 150, '{"type": "courses_completed", "count": 3}'),
  ('Knowledge Seeker', 'Complete 5 courses', NULL, 'course', 250, '{"type": "courses_completed", "count": 5}'),
  ('On Fire', 'Maintain a 7-day learning streak', NULL, 'engagement', 30, '{"type": "streak", "days": 7}'),
  ('Consistent Learner', 'Maintain a 30-day learning streak', NULL, 'engagement', 100, '{"type": "streak", "days": 30}'),
  ('Quiz Master', 'Score 100% on 5 quizzes', NULL, 'learning', 50, '{"type": "perfect_quizzes", "count": 5}'),
  ('Element Explorer', 'Complete the Element Mix assessment', NULL, 'milestone', 20, '{"type": "assessment_completed"}'),
  ('Community Member', 'Leave your first course review', NULL, 'social', 15, '{"type": "reviews_written", "count": 1}'),
  ('Helpful Reviewer', 'Leave 5 course reviews', NULL, 'social', 50, '{"type": "reviews_written", "count": 5}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update course average rating
CREATE OR REPLACE FUNCTION update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the course's average rating (assuming there's a rating column on courses)
  -- This is a placeholder - adjust based on your courses table structure
  UPDATE courses
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.course_id, OLD.course_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for course rating updates
DROP TRIGGER IF EXISTS trigger_update_course_rating ON course_reviews;
CREATE TRIGGER trigger_update_course_rating
  AFTER INSERT OR UPDATE OR DELETE ON course_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_course_rating();

-- Function to check and award streak achievements
CREATE OR REPLACE FUNCTION check_streak_achievement()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for 7-day streak achievement
  IF NEW.current_streak >= 7 THEN
    INSERT INTO user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, a.id
    FROM achievements a
    WHERE a.criteria->>'type' = 'streak'
    AND (a.criteria->>'days')::int <= NEW.current_streak
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for streak achievements
DROP TRIGGER IF EXISTS trigger_check_streak_achievement ON learning_streaks;
CREATE TRIGGER trigger_check_streak_achievement
  AFTER UPDATE ON learning_streaks
  FOR EACH ROW
  WHEN (NEW.current_streak > OLD.current_streak)
  EXECUTE FUNCTION check_streak_achievement();
