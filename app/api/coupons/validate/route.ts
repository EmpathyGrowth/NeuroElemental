/**
 * Coupon Validation API Route
 * Validate and apply discount codes
 */

import { badRequestError, createPublicRoute, successResponse, validateRequest } from '@/lib/api'
import { couponRepository } from '@/lib/db/coupons'
import { couponValidateSchema } from '@/lib/validation/schemas'

/**
 * POST /api/coupons/validate
 * Validate a coupon code and calculate discount
 */
export const POST = createPublicRoute(async (request, _context) => {
  // Validate request body
  const validation = await validateRequest(request, couponValidateSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { code, course_id, organization_id } = validation.data

  // Validate coupon
  const { valid, error, coupon } = await couponRepository.validateCoupon({
    code,
    course_id,
    user_id: undefined,
    organization_id,
  })

  if (!valid || !coupon) {
    throw badRequestError(error || 'Invalid coupon')
  }

  // Calculate discount if price is provided
  const { searchParams } = new URL(request.url)
  const price = parseFloat(searchParams.get('price') || '0')
  const discount = price > 0 ? couponRepository.calculateDiscount(coupon, price) : 0

  return successResponse({
    valid: true,
    coupon: {
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      applicable_products: coupon.applicable_products,
    },
    discount_amount: discount,
    final_price: price > 0 ? Math.max(0, price - discount) : null,
  })
})
