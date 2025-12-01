/**
 * Stripe Client Configuration
 * Centralized Stripe SDK initialization
 */

import { logger } from "@/lib/logging";
import Stripe from "stripe";

// Lazy-initialized Stripe client to avoid build-time errors
let _stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
      typescript: true,
      appInfo: {
        name: "NeuroElemental",
        version: "1.0.0",
      },
    });
  }
  return _stripe;
}

// Legacy export for backwards compatibility
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripeClient()[prop as keyof Stripe];
  },
});

/**
 * Stripe configuration
 */
export const stripeConfig = {
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  currency: "usd",
  successUrl: process.env.NEXT_PUBLIC_APP_URL + "/dashboard/billing/success",
  cancelUrl: process.env.NEXT_PUBLIC_APP_URL + "/dashboard/billing",
};

/**
 * Validate Stripe webhook signature
 */
export function validateStripeWebhook(
  payload: string | Buffer,
  signature: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeConfig.webhookSecret
    );
  } catch (error) {
    logger.error("Stripe webhook signature validation failed", undefined, {
      errorMsg: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
