/**
 * Billing Barrel Export
 * Centralized exports for Stripe and subscription management
 */

// Stripe client and configuration
export { stripe, stripeConfig, validateStripeWebhook } from './stripe-client'

// Subscription management functions
export {
  // Core subscription operations
  getOrganizationSubscription,
  createStripeCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  changePlan,
  cancelSubscription,
  reactivateSubscription,
  syncSubscriptionFromStripe,

  // Query functions
  getSubscriptionPlans,
  getInvoices,
  getPaymentMethods,

  // Helper functions
  hasActiveSubscription,
  getSubscriptionLimits,
  formatPrice,
  calculateProration,

  // Types
  type SubscriptionPlan,
  type OrganizationSubscription,
  type Invoice,
  type PaymentMethod,
} from './subscriptions'
