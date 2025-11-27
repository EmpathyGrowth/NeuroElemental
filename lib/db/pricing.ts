/**
 * Pricing Repository
 * Manages pricing plans for courses, subscriptions, and enterprise tiers
 *
 * NOTE: This repository uses generic Supabase client typing because the
 * pricing_plans table is created via migration and types need to be
 * regenerated after migration is applied.
 */

import { logger } from '@/lib/logging';
import { internalError } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export type PricingTier = 'free' | 'basic' | 'professional' | 'enterprise';

export type PricingType =
  | 'one_time'
  | 'subscription_monthly'
  | 'subscription_yearly'
  | 'per_seat';

export interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingLimits {
  assessments?: number;
  team_members?: number;
  diagnostics?: number;
  storage_gb?: number;
  api_calls?: number;
  [key: string]: number | undefined;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  tier: PricingTier;
  type: PricingType;
  price_cents: number;
  currency: string;
  price_per_seat_cents: number | null;
  min_seats: number;
  max_seats: number | null;
  features: string[];
  limits: PricingLimits;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  badge_text: string | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingPlanInsert {
  name: string;
  description?: string;
  tier: PricingTier;
  type: PricingType;
  price_cents: number;
  currency?: string;
  price_per_seat_cents?: number;
  min_seats?: number;
  max_seats?: number;
  features?: string[];
  limits?: PricingLimits;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  badge_text?: string;
  stripe_price_id?: string;
  stripe_product_id?: string;
}

// ============================================================================
// Repository
// ============================================================================

export class PricingRepository {
  // Using generic SupabaseClient because pricing_plans table
  // types need to be regenerated after migration is applied
   
  private supabase: SupabaseClient<any>;

   
  constructor(supabase?: SupabaseClient<any>) {
    if (supabase) {
      this.supabase = supabase;
    } else {
      this.supabase = createAdminClient();
    }
  }

  /**
   * Get all active pricing plans
   */
  async getActivePlans(): Promise<PricingPlan[]> {
    const { data, error } = await this.supabase
      .from('pricing_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      logger.error('Error fetching pricing plans', error);
      throw internalError('Failed to fetch pricing plans');
    }

    return (data as unknown as PricingPlan[]) || [];
  }

  /**
   * Get all plans (including inactive) for admin
   */
  async getAllPlans(): Promise<PricingPlan[]> {
    const { data, error } = await this.supabase
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      logger.error('Error fetching all pricing plans', error);
      throw internalError('Failed to fetch pricing plans');
    }

    return (data as unknown as PricingPlan[]) || [];
  }

  /**
   * Get a plan by ID
   */
  async getPlanById(id: string): Promise<PricingPlan | null> {
    const { data, error } = await this.supabase
      .from('pricing_plans')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching plan', error);
      return null;
    }

    return data as unknown as PricingPlan | null;
  }

  /**
   * Get a plan by tier
   */
  async getPlanByTier(tier: PricingTier): Promise<PricingPlan | null> {
    const { data, error } = await this.supabase
      .from('pricing_plans')
      .select('*')
      .eq('tier', tier)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching plan by tier', error);
      return null;
    }

    return data as unknown as PricingPlan | null;
  }

  /**
   * Get plan by Stripe price ID
   */
  async getPlanByStripePriceId(priceId: string): Promise<PricingPlan | null> {
    const { data, error } = await this.supabase
      .from('pricing_plans')
      .select('*')
      .eq('stripe_price_id', priceId)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching plan by Stripe price ID', error);
      return null;
    }

    return data as unknown as PricingPlan | null;
  }

  /**
   * Create a new pricing plan
   */
  async createPlan(data: PricingPlanInsert): Promise<PricingPlan> {
    const { data: plan, error } = await this.supabase
      .from('pricing_plans')
      .insert({
        name: data.name,
        description: data.description || null,
        tier: data.tier,
        type: data.type,
        price_cents: data.price_cents,
        currency: data.currency || 'USD',
        price_per_seat_cents: data.price_per_seat_cents || null,
        min_seats: data.min_seats || 1,
        max_seats: data.max_seats || null,
        features: data.features || [],
        limits: data.limits || {},
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        sort_order: data.sort_order || 0,
        badge_text: data.badge_text || null,
        stripe_price_id: data.stripe_price_id || null,
        stripe_product_id: data.stripe_product_id || null,
      } as unknown as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      logger.error('Error creating pricing plan', error);
      throw internalError('Failed to create pricing plan');
    }

    return plan as unknown as PricingPlan;
  }

  /**
   * Update a pricing plan
   */
  async updatePlan(
    id: string,
    updates: Partial<PricingPlanInsert>
  ): Promise<PricingPlan> {
    const { data, error } = await this.supabase
      .from('pricing_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as unknown as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating pricing plan', error);
      throw internalError('Failed to update pricing plan');
    }

    return data as unknown as PricingPlan;
  }

  /**
   * Delete a pricing plan
   */
  async deletePlan(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('pricing_plans')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting pricing plan', error);
      throw internalError('Failed to delete pricing plan');
    }
  }

  /**
   * Calculate price for seats
   */
  calculateSeatPrice(plan: PricingPlan, seats: number): number {
    if (plan.type !== 'per_seat' || !plan.price_per_seat_cents) {
      return plan.price_cents;
    }

    const effectiveSeats = Math.max(
      plan.min_seats,
      Math.min(seats, plan.max_seats || Infinity)
    );

    return effectiveSeats * plan.price_per_seat_cents;
  }

  /**
   * Format price for display
   */
  formatPrice(priceCents: number, currency: string = 'USD'): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });

    return formatter.format(priceCents / 100);
  }

  /**
   * Get pricing for comparison display
   */
  async getPricingComparison(): Promise<{
    plans: PricingPlan[];
    allFeatures: string[];
    featureMatrix: Record<string, Record<string, boolean>>;
  }> {
    const plans = await this.getActivePlans();

    // Collect all unique features
    const allFeatures = new Set<string>();
    plans.forEach((plan) => {
      (plan.features as unknown as string[]).forEach((f: string) => allFeatures.add(f));
    });

    // Build feature matrix
    const featureMatrix: Record<string, Record<string, boolean>> = {};
    plans.forEach((plan) => {
      featureMatrix[plan.id] = {};
      allFeatures.forEach((feature) => {
        featureMatrix[plan.id][feature] = (plan.features as unknown as string[]).includes(feature);
      });
    });

    return {
      plans,
      allFeatures: Array.from(allFeatures),
      featureMatrix,
    };
  }
}

// Export singleton instance
export const pricingRepository = new PricingRepository();
