/**
 * Database Utilities Barrel Export
 * Centralizes all database utility imports
 *
 * MIGRATION NOTE: Use repository instances directly for all database operations.
 * Example: organizationRepository.createOrganization() instead of createOrganization()
 */

// Supabase clients
export { getSupabaseServer } from './supabase-server'

// Activity logging
export * from './activity-log'

// Repositories - prefer using these directly
export { blogRepository, BlogRepository } from './blog'
export { courseRepository, CourseRepository } from './courses'
export { couponRepository, CouponRepository, validateCoupon, calculateDiscount } from './coupons'
export {
  creditRepository,
  CreditRepository,
  // Legacy wrapper exports for backward compatibility
  addCredits,
  deductCredits,
  getOrganizationCreditBalance,
  getOrganizationAllCredits,
  getCreditTransactions,
  getUserCreditUsage,
  getTotalCreditsUsed,
  hasSufficientCredits,
  getCreditStatistics,
  addOrganizationCredits,
} from './credits'
export { userRepository, UserRepository } from './users'
export {
  waitlistRepository,
  WaitlistRepository,
  // Legacy wrapper exports
  addToWaitlist,
  getAllWaitlistEntries,
  getPendingWaitlist,
  getWaitlistCount,
  isEmailOnWaitlist,
  removeFromWaitlist,
  getWaitlistEmails,
  getRecentWaitlistSignups,
  exportWaitlistCSV,
} from './waitlist'
export { eventRepository } from './events'

// Memberships and Invitations (consolidated - uses new schema tables)
export {
  MembershipRepository,
  membershipRepository,
  addOrganizationMember,
  removeOrganizationMember,
  updateMemberRole,
  updateMemberRole as updateMembershipRole,
  getOrganizationMembers,
  getOrganizationMembers as getMembershipList,
  // Invitation functions (use these instead of old invitations.ts)
  createOrganizationInvite,
  getOrganizationInvites,
  getInviteById,
  acceptInvitation,
  cancelInvitation,
  getPendingInvitesForEmail,
  isEmailAlreadyMember,
  transferOwnership,
} from './memberships'

// Organizations - use organizationRepository for all operations
export {
  OrganizationRepository,
  organizationRepository,
  // Convenience bindings for common checks
  isUserOrgAdmin,
  isUserOrgMember,
  isUserOrgOwner,
  getUserOrgRole,
  isSlugAvailable,
} from './organizations'

// Base repository (for extension)
export { BaseRepository, queryBuilder, createRepository } from './base-repository'

// Select fragments for relation queries
export { selectFragments, buildSelectFragment, combineFragments } from './select-fragments'

// Instructor Resources
export {
  InstructorResourceRepository,
  instructorResourceRepository,
  type InstructorResource,
  type InstructorResourceInsert,
  type InstructorResourceUpdate,
  type InstructorResourceCategory,
  type InstructorResourceType,
  type ResourceDownload,
} from './instructor-resources'

// Diagnostics
export {
  DiagnosticsRepository,
  diagnosticsRepository,
  type DiagnosticTemplate,
  type OrganizationDiagnostic,
  type DiagnosticResponse,
  type DiagnosticWithTemplate,
  type DiagnosticType,
  type DiagnosticStatus,
  type DiagnosticQuestion,
} from './diagnostics'

// Certifications
export {
  CertificationRepository,
  certificationRepository,
  type CertificationApplication,
  type CertificationApplicationInsert,
  type CertificationApplicationStatus,
  type CertificationLevel,
} from './certifications'

// Enrollments
export {
  EnrollmentRepository,
  enrollmentRepository,
  type CourseEnrollment,
  type CourseEnrollmentInsert,
  type CourseEnrollmentUpdate,
  type EnrollmentPaymentStatus,
  type EnrollmentWithUser,
  type EnrollmentWithCourse,
  type EnrollmentFull,
  type EnrollmentStats,
  type UserEnrollmentSummary,
} from './enrollments'

// Pricing
export {
  PricingRepository,
  pricingRepository,
  type PricingPlan,
  type PricingPlanInsert,
  type PricingTier,
  type PricingType,
  type PricingFeature,
  type PricingLimits,
} from './pricing'

// Typed RPC function wrappers
export {
  getAuditLogForExport,
  getUserPermissions,
  userHasPermission,
  checkSSORequired,
  autoProvisionSSOUser,
  checkRateLimit,
  incrementRateLimit,
  logDataAccess,
  getUserDataSummary,
  incrementUsageMetric,
  incrementEventSpots,
  generateDeletionConfirmationToken,
} from './rpc-functions'
