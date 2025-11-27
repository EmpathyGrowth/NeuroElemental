/**
 * Coupon Redemption API Route
 * Apply and redeem discount codes
 */

import { badRequestError, createAuthenticatedRoute, successResponse, validateRequest } from '@/lib/api'
import { couponRepository } from '@/lib/db/coupons'
import { couponValidateSchema } from '@/lib/validation/schemas'

/**
 * POST /api/coupons/redeem
 * Redeem a coupon code
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  // Validate request body
  const validation = await validateRequest(request, couponValidateSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { code, course_id, organization_id } = validation.data

  // Redeem coupon (throws on invalid coupon)
  try {
    const coupon = await couponRepository.redeemCoupon({
      code,
      user_id: user.id,
      organization_id,
      course_id,
    })

    // Calculate discount if price is provided
    const body = await request.json()
    const price = body.price || 0
    const discount = price > 0 ? couponRepository.calculateDiscount(coupon, price) : 0

    return successResponse({
      message: 'Coupon redeemed successfully',
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discount_amount: discount,
      final_price: price > 0 ? Math.max(0, price - discount) : null,
    })
  } catch (error: unknown) {
    throw badRequestError(error instanceof Error ? error.message : 'Failed to redeem coupon')
  }
})
