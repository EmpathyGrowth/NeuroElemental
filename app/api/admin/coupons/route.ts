/**
 * Admin Coupons API
 * Admin-only endpoint for managing coupons
 */

import { conflictError, createAdminRoute, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET, HTTP_STATUS, successResponse, validateRequest } from '@/lib/api'
import { couponRepository } from '@/lib/db/coupons'
import { couponCreateSchema } from '@/lib/validation/schemas'
import type { DiscountType, ApplicableTo } from '@/lib/types/supabase'

/**
 * GET /api/admin/coupons
 * List all coupons (admin only)
 */
export const GET = createAdminRoute(async (request, _context, _admin) => {
  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get('active') === 'true'
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_PAGE_OFFSET))

  const coupons = await couponRepository.getAllCoupons({ active_only: activeOnly, limit, offset })

  return successResponse({
    coupons,
    count: coupons.length,
  })
})

/**
 * POST /api/admin/coupons
 * Create new coupon (admin only)
 */
export const POST = createAdminRoute(async (request, _context, admin) => {
  // Validate request body
  const validation = await validateRequest(request, couponCreateSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { code, discount_type, discount_value, max_uses, applicable_to, course_id, expires_at } =
    validation.data

  // Create coupon - map discount_type to database enum
  const dbDiscountType: DiscountType = discount_type === 'fixed_amount' ? 'fixed' : (discount_type === 'credits' ? 'percentage' : discount_type)
  const mappedApplicableTo = applicable_to === 'course' ? 'courses' : (applicable_to === 'event' ? 'events' : applicable_to)
  const dbApplicableTo: ApplicableTo = mappedApplicableTo || 'all'

  try {
    const coupon = await couponRepository.createCoupon({
      code,
      discount_type: dbDiscountType,
      discount_value,
      max_uses,
      applicable_to: dbApplicableTo,
      course_id,
      expires_at: expires_at ? new Date(expires_at) : undefined,
      created_by: admin.userId,
    })

    return successResponse(
      {
        coupon,
        message: 'Coupon created successfully',
      },
      HTTP_STATUS.CREATED
    )
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Coupon code already exists') {
      throw conflictError(error.message)
    }
    throw error
  }
})
