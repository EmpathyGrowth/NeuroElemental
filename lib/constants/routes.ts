/**
 * Centralized route constants for type-safe navigation
 * This eliminates hardcoded routes throughout the codebase
 */

export const ROUTES = {
  // Public routes
  HOME: '/',
  ASSESSMENT: '/assessment',
  RESULTS: '/results',
  ELEMENTS: '/elements',
  FRAMEWORK: '/framework',
  SCIENCE: '/science',
  BRAIN_DIVERSITY: '/brain-diversity',
  BLOG: '/blog',
  COURSES: '/courses',
  EVENTS: '/events',
  CERTIFICATION: '/certification',
  ABOUT: '/about',
  PRIVACY: '/privacy',
  TERMS: '/terms',

  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Dashboard routes
  DASHBOARD: {
    ROOT: '/dashboard',
    PROFILE: '/dashboard/profile',
    SETTINGS: '/dashboard/settings',
    ASSESSMENTS: '/dashboard/assessments',
    COURSES: '/dashboard/courses',
    // Student dashboard
    STUDENT: {
      ROOT: '/dashboard/student',
      COURSES: '/dashboard/student/courses',
      ASSESSMENTS: '/dashboard/student/assessments',
      PROGRESS: '/dashboard/student/progress',
    },
    // Instructor dashboard
    INSTRUCTOR: {
      ROOT: '/dashboard/instructor',
      COURSES: '/dashboard/instructor/courses',
      CREATE_COURSE: '/dashboard/instructor/courses/new',
      STUDENTS: '/dashboard/instructor/students',
      ANALYTICS: '/dashboard/instructor/analytics',
    },
    // Admin dashboard
    ADMIN: {
      ROOT: '/dashboard/admin',
      USERS: '/dashboard/admin/users',
      COURSES: '/dashboard/admin/courses',
      EVENTS: '/dashboard/admin/events',
      BLOG: '/dashboard/admin/blog',
      ANALYTICS: '/dashboard/admin/analytics',
      SETTINGS: '/dashboard/admin/settings',
    },
  },

  // API routes
  API: {
    AUTH: {
      SIGNUP: '/api/auth/signup',
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      SESSION: '/api/auth/session',
    },
    ASSESSMENT: {
      SUBMIT: '/api/assessment/submit',
      RESULTS: '/api/assessment/results',
    },
    BLOG: '/api/blog',
    COURSES: '/api/courses',
    EVENTS: '/api/events',
    PROFILE: '/api/profile',
    ADMIN: {
      USERS: '/api/admin/users',
      STATS: '/api/admin/stats',
    },
  },
} as const;

/**
 * Helper function to create dynamic routes
 */
export const createRoute = {
  blogPost: (slug: string) => `/blog/${slug}` as const,
  course: (slug: string) => `/courses/${slug}` as const,
  event: (id: string) => `/events/${id}` as const,
  element: (slug: string) => `/elements/${slug}` as const,
  userProfile: (userId: string) => `/users/${userId}` as const,
  adminUser: (userId: string) => `/dashboard/admin/users/${userId}` as const,
  instructorCourse: (courseId: string) => `/dashboard/instructor/courses/${courseId}` as const,
};

/**
 * Protected routes that require authentication
 */
export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD.ROOT,
  ROUTES.DASHBOARD.PROFILE,
  ROUTES.DASHBOARD.SETTINGS,
  ROUTES.DASHBOARD.STUDENT.ROOT,
  ROUTES.DASHBOARD.INSTRUCTOR.ROOT,
  ROUTES.DASHBOARD.ADMIN.ROOT,
];

/**
 * Admin-only routes
 */
export const ADMIN_ROUTES = [
  ROUTES.DASHBOARD.ADMIN.ROOT,
  ROUTES.DASHBOARD.ADMIN.USERS,
  ROUTES.DASHBOARD.ADMIN.COURSES,
  ROUTES.DASHBOARD.ADMIN.EVENTS,
  ROUTES.DASHBOARD.ADMIN.BLOG,
  ROUTES.DASHBOARD.ADMIN.ANALYTICS,
  ROUTES.DASHBOARD.ADMIN.SETTINGS,
];

/**
 * Public routes that should redirect if user is logged in
 */
export const AUTH_REDIRECT_ROUTES = [
  ROUTES.AUTH.LOGIN,
  ROUTES.AUTH.SIGNUP,
];

export type Route = typeof ROUTES;
export type ApiRoute = typeof ROUTES.API;
export type DashboardRoute = typeof ROUTES.DASHBOARD;