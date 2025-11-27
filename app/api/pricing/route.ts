/**
 * Pricing Plans API
 * Public endpoint for fetching pricing information
 */

import { createPublicRoute, successResponse } from '@/lib/api';
import { pricingRepository } from '@/lib/db';

// GET - Get active pricing plans
export const GET = createPublicRoute(async () => {
  const plans = await pricingRepository.getActivePlans();

  return successResponse({
    plans: plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      tier: plan.tier,
      type: plan.type,
      price: pricingRepository.formatPrice(plan.price_cents, plan.currency),
      priceCents: plan.price_cents,
      currency: plan.currency,
      pricePerSeat: plan.price_per_seat_cents
        ? pricingRepository.formatPrice(plan.price_per_seat_cents, plan.currency)
        : null,
      minSeats: plan.min_seats,
      maxSeats: plan.max_seats,
      features: plan.features,
      limits: plan.limits,
      isFeatured: plan.is_featured,
      badgeText: plan.badge_text,
      stripePriceId: plan.stripe_price_id,
    })),
  });
});
