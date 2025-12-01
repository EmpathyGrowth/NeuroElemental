import { logger } from "@/lib/logging";
import Stripe from "stripe";

// Lazy-initialized Stripe instance to avoid build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is not defined in environment variables"
      );
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Legacy export for backwards compatibility - use getStripe() for new code
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Only warn at runtime, not build time
if (typeof window === "undefined" && process.env.NODE_ENV !== "production") {
  if (!STRIPE_PUBLISHABLE_KEY) {
    logger.warn("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
  }
}

// Price IDs for different products
export const PRICES = {
  // Courses
  COURSE_STANDARD: process.env.STRIPE_COURSE_STANDARD_PRICE_ID || "",

  // Certifications
  INSTRUCTOR_CERTIFICATION: process.env.STRIPE_INSTRUCTOR_CERT_PRICE_ID || "",

  // Subscriptions
  BUSINESS_MONTHLY: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || "",
  BUSINESS_YEARLY: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || "",

  // One-time purchases
  ASSESSMENT_DETAILED: process.env.STRIPE_ASSESSMENT_DETAILED_PRICE_ID || "",
};

export const formatCurrency = (amount: number, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100);
};

// Credit package pricing for B2B organizations (in cents)
export const CREDIT_PACKAGES = {
  starter: {
    id: "starter",
    name: "Starter Package",
    credits: 10,
    price: 9900, // $99.00
    description: "Perfect for small teams getting started",
  },
  professional: {
    id: "professional",
    name: "Professional Package",
    credits: 50,
    price: 44900, // $449.00
    description: "Best value - Save 10%",
    savings: "Save 10%",
    popular: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Package",
    credits: 100,
    price: 79900, // $799.00
    description: "For large teams - Save 20%",
    savings: "Save 20%",
  },
} as const;

export type PackageId = keyof typeof CREDIT_PACKAGES;

// Price per credit for custom amounts
export const PRICE_PER_CREDIT = 1000; // $10.00 per credit

// Calculate price for custom credit amount
export function calculateCustomPrice(credits: number): number {
  return credits * PRICE_PER_CREDIT;
}

// Get package details
export function getPackage(packageId: string) {
  return CREDIT_PACKAGES[packageId as PackageId] || null;
}

// Stripe webhook events for credit purchases
export const CREDIT_WEBHOOK_EVENTS = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
] as const;

// Stripe product metadata keys for credit purchases
export const CREDIT_METADATA_KEYS = {
  ORGANIZATION_ID: "organization_id",
  USER_ID: "user_id",
  CREDIT_TYPE: "credit_type",
  CREDIT_AMOUNT: "credit_amount",
  PACKAGE_ID: "package_id",
  COUPON_CODE: "coupon_code",
} as const;
