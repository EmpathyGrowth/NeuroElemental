/**
 * Admin Single Coupon API
 * GET /api/admin/coupons/[id] - Get coupon by ID
 * PUT /api/admin/coupons/[id] - Update coupon
 * DELETE /api/admin/coupons/[id] - Delete/deactivate coupon
 */

import {
  createAdminRoute,
  notFoundError,
  successResponse,
  validateRequest,
} from '@/lib/api';
import { RouteContext } from '@/lib/types/api';
import { couponRepository } from '@/lib/db/coupons';
import { z } from 'zod';
import {
  couponCodeSchema,
  nonNegativeNumberSchema,
  positiveIntSchema,
  datetimeSchema,
  uuidSchema,
} from '@/lib/validation/schemas';
import type { DiscountType, ApplicableTo } from '@/lib/types/supabase';
import { getUpdateTimestamp } from '@/lib/utils';

type CouponParams = { id: string };

/**
 * Schema for updating a coupon
 */
const couponUpdateSchema = z.object({
  code: couponCodeSchema.optional(),
  discount_type: z.enum(['percentage', 'fixed_amount', 'credits']).optional(),
  discount_value: nonNegativeNumberSchema.optional(),
  max_uses: positiveIntSchema.nullable().optional(),
  applicable_to: z.enum(['all', 'courses', 'events']).optional(),
  course_id: uuidSchema.nullable().optional(),
  expires_at: datetimeSchema.nullable().optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/admin/coupons/[id]
 * Get a single coupon by ID
 */
export const GET = createAdminRoute<CouponParams>(
  async (_request, context: RouteContext<CouponParams>) => {
    const { id } = await context.params;

    const coupon = await couponRepository.findById(id);

    if (!coupon) {
      throw notFoundError('Coupon');
    }

    return successResponse({ coupon });
  }
);

/**
 * PUT /api/admin/coupons/[id]
 * Update a coupon
 */
export const PUT = createAdminRoute<CouponParams>(
  async (request, context: RouteContext<CouponParams>) => {
    const { id } = await context.params;

    // Verify coupon exists
    const existingCoupon = await couponRepository.findById(id);
    if (!existingCoupon) {
      throw notFoundError('Coupon');
    }

    // Validate request body
    const validation = await validateRequest(request, couponUpdateSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const { discount_type, applicable_to, expires_at, course_id, ...rest } = validation.data;

    // Map discount_type to database enum if provided
    let dbDiscountType: DiscountType | undefined;
    if (discount_type) {
      dbDiscountType = discount_type === 'fixed_amount' ? 'fixed' :
                       discount_type === 'credits' ? 'percentage' : discount_type;
    }

    // Map applicable_to if provided
    let dbApplicableTo: ApplicableTo | undefined;
    if (applicable_to) {
      dbApplicableTo = applicable_to;
    }

    // Build update payload
    const updateData: Record<string, unknown> = {
      ...rest,
      ...getUpdateTimestamp(),
    };

    if (dbDiscountType) {
      updateData.discount_type = dbDiscountType;
    }

    if (dbApplicableTo !== undefined) {
      updateData.applicable_to = dbApplicableTo;
    }

    if (expires_at !== undefined) {
      updateData.valid_until = expires_at ? new Date(expires_at).toISOString() : null;
    }

    if (course_id !== undefined) {
      updateData.applicable_products = course_id ? [course_id] : null;
    }

    const updatedCoupon = await couponRepository.update(id, updateData);

    return successResponse({
      coupon: updatedCoupon,
      message: 'Coupon updated successfully',
    });
  }
);

/**
 * DELETE /api/admin/coupons/[id]
 * Deactivate a coupon (soft delete)
 */
export const DELETE = createAdminRoute<CouponParams>(
  async (_request, context: RouteContext<CouponParams>) => {
    const { id } = await context.params;

    // Verify coupon exists
    const existingCoupon = await couponRepository.findById(id);
    if (!existingCoupon) {
      throw notFoundError('Coupon');
    }

    // Soft delete by deactivating
    await couponRepository.deactivateCoupon(id);

    return successResponse({
      message: 'Coupon deactivated successfully',
    });
  }
);
