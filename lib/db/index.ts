/**
 * Database Utilities Barrel Export
 * Centralizes all database utility imports
 *
 * MIGRATION NOTE: Use repository instances directly for all database operations.
 * Example: organizationRepository.createOrganization() instead of createOrganization()
 */

// Supabase clients
export { getSupabaseServer } from "./supabase-server";

// Activity logging
export * from "./activity-log";

// Repositories - prefer using these directly
export {
  AchievementRepository,
  achievementRepository,
  type AchievementStats,
  type AchievementWithStatus,
} from "./achievements";
export { AssessmentRepository, assessmentRepository } from "./assessments";
export { BlogRepository, blogRepository } from "./blog";
export {
  BlogCommentsRepository,
  blogCommentsRepository,
  type BlogComment,
  type BlogCommentWithAuthor,
  type BlogCommentWithReplies,
} from "./blog-comments";
export {
  BlogReactionsRepository,
  blogReactionsRepository,
  type BlogReaction,
  type ReactionCounts,
  type ReactionType,
} from "./blog-reactions";
export { CertificateRepository, certificateRepository } from "./certificates";
export {
  CertificationRepository,
  certificationRepository,
} from "./certifications";
export {
  calculateDiscount,
  CouponRepository,
  couponRepository,
  validateCoupon,
} from "./coupons";
export { CourseRepository, courseRepository } from "./courses";
export {
  // Legacy wrapper exports for backward compatibility
  addCredits,
  addOrganizationCredits,
  CreditRepository,
  creditRepository,
  deductCredits,
  getCreditStatistics,
  getCreditTransactions,
  getOrganizationAllCredits,
  getOrganizationCreditBalance,
  getTotalCreditsUsed,
  getUserCreditUsage,
  hasSufficientCredits,
} from "./credits";
export {
  DiagnosticsRepository,
  diagnosticsRepository,
  type DiagnosticResponse,
  type DiagnosticStatus,
  type DiagnosticTemplate,
  type DiagnosticType,
  type DiagnosticWithTemplate,
} from "./diagnostics";
export {
  EmailPreferencesRepository,
  emailPreferencesRepository,
} from "./email-preferences";
export { EnrollmentRepository, enrollmentRepository } from "./enrollments";
export {
  EventRegistrationRepository,
  eventRegistrationRepository,
} from "./event-registrations";
export {
  eventRepository,
  type AgendaItem,
  type Event,
  type EventType,
  type EventWithStats,
} from "./events";
export {
  InstructorResourceRepository,
  instructorResourceRepository,
  type InstructorResource,
  type InstructorResourceCategory,
  type InstructorResourceType,
} from "./instructor-resources";
export {
  LessonCompletionsRepository,
  lessonCompletionsRepository,
} from "./lesson-completions";
export {
  LessonProgressRepository,
  lessonProgressRepository,
} from "./lesson-progress";
export { LessonRepository, lessonRepository } from "./lessons";

// New LMS feature repositories
export {
  CourseAnnouncementsRepository,
  courseAnnouncementsRepository,
  type AnnouncementWithCourse,
  type AnnouncementWithInstructor,
} from "./course-announcements";
export {
  LearningStreaksRepository,
  learningStreaksRepository,
  type StreakHistoryEntry,
  type StreakStats,
} from "./learning-streaks";
export {
  LessonBookmarksRepository,
  lessonBookmarksRepository,
  type LessonBookmarkWithContext,
  type LessonBookmarkWithLesson,
} from "./lesson-bookmarks";
export {
  LessonNotesRepository,
  lessonNotesRepository,
  type LessonNoteWithContext,
  type LessonNoteWithLesson,
} from "./lesson-notes";
export { LogsRepository, logsRepository } from "./logs";
export { ModuleRepository, moduleRepository } from "./modules";
export { PricingRepository, pricingRepository } from "./pricing";
export { QuizRepository, quizRepository, type QuizQuestion } from "./quizzes";
export {
  ScheduledEmailRepository,
  scheduledEmailRepository,
} from "./scheduled-emails";
export { TestimonialRepository, testimonialRepository } from "./testimonials";
export { UserRepository, userRepository } from "./users";
export {
  // Legacy wrapper exports
  addToWaitlist,
  exportWaitlistCSV,
  getAllWaitlistEntries,
  getPendingWaitlist,
  getRecentWaitlistSignups,
  getWaitlistCount,
  getWaitlistEmails,
  isEmailOnWaitlist,
  removeFromWaitlist,
  WaitlistRepository,
  waitlistRepository,
} from "./waitlist";
export {
  WebhookRepository,
  webhookRepository,
  type WebhookWithDeliveries,
} from "./webhooks";

// Memberships
export {
  acceptInvitation,
  acceptInvitation as acceptMembershipInvite,
  addOrganizationMember,
  cancelInvitation,
  createOrganizationInvite,
  getInviteById,
  getOrganizationMembers as getMembershipList,
  getOrganizationInvites,
  getOrganizationMembers,
  getPendingInvitesForEmail,
  isEmailAlreadyMember,
  MembershipRepository,
  membershipRepository,
  removeOrganizationMember,
  transferOwnership,
  updateMemberRole,
  updateMemberRole as updateMembershipRole,
} from "./memberships";

// Organizations - use organizationRepository for all operations
export {
  getUserOrgRole,
  isSlugAvailable,
  // Convenience bindings for common checks
  isUserOrgAdmin,
  isUserOrgMember,
  isUserOrgOwner,
  OrganizationRepository,
  organizationRepository,
} from "./organizations";

// Platform settings
export {
  platformSettingsRepository,
  type BrandingSettings,
  type EmailSettings,
  type FeatureFlags,
  type GeneralSettings,
  type PlatformSettings,
  type SecuritySettings,
} from "./platform-settings";

// CMS repositories
export {
  FAQsRepository,
  faqsRepository,
  type FAQ,
  type FAQInsert,
  type FAQUpdate,
} from "./faqs";
export {
  SiteAnnouncementsRepository,
  siteAnnouncementsRepository,
  type AnnouncementType,
  type SiteAnnouncement,
  type SiteAnnouncementInsert,
  type SiteAnnouncementUpdate,
} from "./site-announcements";
export {
  SiteContentRepository,
  siteContentRepository,
  type SiteContent,
  type SiteContentInsert,
  type SiteContentUpdate,
} from "./site-content";

// Navigation management
export {
  NavigationRepository,
  navigationRepository,
  type MenuLocation,
  type NavigationMenu,
  type NavigationMenuItem,
  type NavigationMenuItemWithChildren,
  type NavigationMenuWithItems,
} from "./navigation";

// Footer content
export {
  FooterContentRepository,
  footerContentRepository,
  type FooterAboutContent,
  type FooterContent,
  type FooterData,
  type FooterLegalContent,
  type FooterLinksContent,
  type FooterNewsletterContent,
  type FooterSection,
  type FooterSocialContent,
} from "./footer-content";

// Media library
export {
  MediaLibraryRepository,
  mediaLibraryRepository,
  type MediaFilterOptions,
  type MediaItem,
  type MediaItemInsert,
  type MediaItemUpdate,
} from "./media-library";

// Email templates
export {
  EmailTemplatesRepository,
  emailTemplatesRepository,
  type EmailTemplate,
  type EmailTemplateCategory,
  type EmailTemplateInsert,
  type EmailTemplateUpdate,
  type RenderedEmail,
} from "./email-templates";

// Content revisions
export {
  ContentRevisionsRepository,
  contentRevisionsRepository,
  type ContentRevision,
  type ContentRevisionWithAuthor,
  type RevisionContentType,
} from "./content-revisions";

// URL Redirects
export {
  UrlRedirectsRepository,
  urlRedirectsRepository,
  type RedirectType,
  type UrlRedirect,
  type UrlRedirectInsert,
  type UrlRedirectUpdate,
} from "./url-redirects";

// SEO Settings
export {
  SeoSettingsRepository,
  seoSettingsRepository,
  type ChangeFrequency,
  type PageSeo,
  type SeoSettings,
  type SeoSettingsInsert,
  type SeoSettingsUpdate,
} from "./seo-settings";

// Contact Forms
export {
  ContactFormsRepository,
  contactFormsRepository,
  type ContactForm,
  type ContactFormInsert,
  type ContactFormUpdate,
  type FormField,
  type FormSubmission,
  type FormSubmissionWithForm,
  type SubmissionStatus,
} from "./contact-forms";

// Content Blocks
export {
  ContentBlocksRepository,
  contentBlocksRepository,
  type BlockPlacement,
  type BlockPlacementWithBlock,
  type BlockType,
  type ContentBlock,
  type ContentBlockInsert,
  type ContentBlockUpdate,
} from "./content-blocks";

// Theme Settings
export {
  ThemeSettingsRepository,
  themeSettingsRepository,
  type ThemeColors,
  type ThemeComponents,
  type ThemeCssVariables,
  type ThemeLayout,
  type ThemeSettings,
  type ThemeSettingsUpdate,
  type ThemeTypography,
} from "./theme-settings";

// Base repository (for extension)
export { BaseRepository, createRepository } from "./base-repository";
