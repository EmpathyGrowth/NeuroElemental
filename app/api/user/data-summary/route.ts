/**
 * User Data Summary API - Refactored with Factory Pattern
 * Provides GDPR-compliant data summary for users
 */

import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import {
    certificationRepository,
    createRepository,
    enrollmentRepository,
    userRepository
} from '@/lib/db';

export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  // Initialize ad-hoc repositories for tables without dedicated classes
  const progressRepo = createRepository('course_progress');
  const reviewRepo = createRepository('course_reviews');
  const notificationRepo = createRepository('notifications');

  // Fetch user's data summary across all tables
  const [
    profile,
    enrollments,
    courseProgress,
    reviews,
    certifications,
    notificationCount
  ] = await Promise.all([
    userRepository.findById(user.id),
    enrollmentRepository.getUserEnrollments(user.id),
    progressRepo.findAll({ user_id: user.id }),
    reviewRepo.findAll({ user_id: user.id }),
    certificationRepository.getUserApplications(user.id),
    notificationRepo.count({ user_id: user.id })
  ]);

  return successResponse({
    profile,
    enrollments: enrollments || [],
    courseProgress: courseProgress || [],
    reviews: reviews || [],
    certifications: certifications || [],
    notificationCount: notificationCount || 0,
    summary: {
      totalEnrollments: enrollments?.length || 0,
      totalCourseProgress: courseProgress?.length || 0,
      totalReviews: reviews?.length || 0,
      totalCertifications: certifications?.length || 0,
      totalNotifications: notificationCount || 0
    }
  });
});

