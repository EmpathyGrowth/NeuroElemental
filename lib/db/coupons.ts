/**
 * Coupon Repository
 * Manages promotional codes and discount management
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for coupon management.
 */

import { internalError } from '@/lib/api';
import { logger } from '@/lib/logging';
import { toError } from '@/lib/utils';
import type { ApplicableTo, Coupon, Database, DiscountType } from '@/lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';

type CouponInsert = Database['public']['Tables']['coupons']['Insert'];
type CouponUpdate = Database['public']['Tables']['coupons']['Update'];
type CouponRow = Database['public']['Tables']['coupons']['Row'];

/** PostgreSQL error with code property */
interface PostgresError extends Error {
  code?: string;
}

/**
 * Coupon Repository
 */
export class CouponRepository extends BaseRepository<'coupons'> {
  constructor(supabase?: SupabaseClient<Database>) {
    super('coupons', supabase);
  }

  /**
   * Create a new coupon
   */
  async createCoupon(data: {
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    max_uses?: number;
    applicable_to?: ApplicableTo;
    course_id?: string;
    expires_at?: Date;
    created_by: string;
  }): Promise<Coupon> {
    try {
      const couponData: CouponInsert = {
        code: data.code.toUpperCase(),
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        max_uses: data.max_uses || null,
        current_uses: 0,
        applicable_products: data.course_id ? [data.course_id] : null,
        is_active: true,
        valid_until: data.expires_at?.toISOString() || null,
        created_by: data.created_by,
      };

      return await this.create(couponData);
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      if (pgError?.code === '23505') {
        throw new Error('Coupon code already exists');
      }
      logger.error('Error creating coupon', toError(error));
      throw error;
    }
  }

  /**
   * Get coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon | null> {
    return this.findBy('code', code.toUpperCase());
  }

  /**
   * Validate coupon
   */
  async validateCoupon(data: {
    code: string;
    course_id?: string;
    user_id?: string;
    organization_id?: string;
  }): Promise<{ valid: boolean; error: string | null; coupon: Coupon | null }> {
    try {
      const coupon = await this.getCouponByCode(data.code);

      if (!coupon) {
        return { valid: false, error: 'Coupon not found', coupon: null };
      }

      // Check if active
      if (!coupon.is_active) {
        return { valid: false, error: 'Coupon is no longer active', coupon: null };
      }

      // Check if expired
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        return { valid: false, error: 'Coupon has expired', coupon: null };
      }

      // Check usage limit
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        return { valid: false, error: 'Coupon usage limit reached', coupon: null };
      }

      // Check applicability - coupon must include this course in applicable_products
      if (data.course_id && coupon.applicable_products && !coupon.applicable_products.includes(data.course_id)) {
        return { valid: false, error: 'Coupon not applicable to this course', coupon: null };
      }

      return { valid: true, error: null, coupon };
    } catch (err) {
      logger.error('Exception in validateCoupon', toError(err));
      return { valid: false, error: 'Validation failed', coupon: null };
    }
  }

  /**
   * Redeem coupon
   */
  async redeemCoupon(data: {
    code: string;
    user_id?: string;
    organization_id?: string;
    course_id?: string;
  }): Promise<Coupon> {
    const validation = await this.validateCoupon(data);

    if (!validation.valid || !validation.coupon) {
      throw new Error(validation.error || 'Invalid coupon');
    }

    const updateData: CouponUpdate = {
      current_uses: validation.coupon.current_uses + 1,
    };

    return await this.update(validation.coupon.id, updateData);
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(coupon: Coupon, original_price: number): number {
    switch (coupon.discount_type) {
      case 'percentage':
        return original_price * (coupon.discount_value / 100);
      case 'fixed':
        return Math.min(coupon.discount_value, original_price);
      default:
        return 0;
    }
  }

  /**
   * Get all coupons with filters
   */
  async getAllCoupons(options?: {
    active_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Coupon[]> {
    const filters: Partial<CouponRow> | undefined = options?.active_only ? { is_active: true } : undefined;
    return this.findAll(filters, {
      orderBy: { column: 'created_at', ascending: false },
      limit: options?.limit,
      offset: options?.offset
    });
  }

  /**
   * Deactivate coupon
   */
  async deactivateCoupon(id: string): Promise<Coupon> {
    return this.update(id, { is_active: false });
  }

  /**
   * Activate coupon
   */
  async activateCoupon(id: string): Promise<Coupon> {
    return this.update(id, { is_active: true });
  }

  /**
   * Get coupon usage statistics
   */
  async getCouponStatistics(id: string): Promise<{
    code: string;
    total_uses: number;
    max_uses: number | null;
    remaining_uses: number | null;
    active: boolean;
    expired: boolean;
  }> {
    const coupon = await this.findById(id);

    return {
      code: coupon.code,
      total_uses: coupon.current_uses,
      max_uses: coupon.max_uses,
      remaining_uses: coupon.max_uses ? coupon.max_uses - coupon.current_uses : null,
      active: coupon.is_active,
      expired: coupon.valid_until ? new Date(coupon.valid_until) < new Date() : false,
    };
  }

  /**
   * Get most used coupons
   */
  async getMostUsedCoupons(limit: number = 10): Promise<Coupon[]> {
    return this.findAll(undefined, {
      orderBy: { column: 'current_uses', ascending: false },
      limit
    });
  }

  /**
   * Get expiring coupons (expiring soon)
   */
  async getExpiringCoupons(days: number = 7): Promise<Coupon[]> {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await this.table()
        .select('*')
        .eq('is_active', true)
        .gte('valid_until', now.toISOString())
        .lte('valid_until', futureDate.toISOString())
        .order('valid_until', { ascending: true });

      if (error) {
        logger.error('Error fetching expiring coupons', error as Error);
        throw internalError('Failed to fetch expiring coupons');
      }

      return (data as Coupon[]) || [];
    } catch (err) {
      logger.error('Exception in getExpiringCoupons', toError(err));
      throw err;
    }
  }
}

// Export singleton instance
export const couponRepository = new CouponRepository();

// ============================================================================
// CONVENIENCE EXPORTS
// Direct bindings for methods that don't need wrapping
// ============================================================================

export const validateCoupon = couponRepository.validateCoupon.bind(couponRepository);
export const calculateDiscount = couponRepository.calculateDiscount.bind(couponRepository);
