/**
 * Email Barrel Export
 * Centralized exports for email service and sending functions
 */

// Email service class for complex email operations
export {
  emailService,
  type CourseCompletionProps,
  type EmailResult,
  type PasswordResetProps,
  type PaymentConfirmationProps,
  type SessionReminderProps,
  type WelcomeEmailProps,
} from './email-service'

// Individual email sending functions
export {
  sendOrganizationInvitation,
  sendWelcomeToOrganization,
  sendRoleChanged,
  sendWaitlistConfirmation,
  sendCreditsPurchased,
  sendDataDeletionConfirmation,
  sendLowCreditsWarning,
} from './send'
