/**
 * Stripe Credit Checkout API
 * Create Stripe checkout sessions for credit purchases
 */

import { getSupabaseServer } from '@/lib/db'
import { stripe, CREDIT_PACKAGES, CREDIT_METADATA_KEYS, calculateCustomPrice } from '@/lib/stripe/config'
import { createAuthenticatedRoute, badRequestError, notFoundError, requireOrganizationAccess, successResponse } from '@/lib/api'

/** Organization basic info */
interface OrganizationInfo {
  name: string;
  slug: string;
}

/**
 * POST /api/stripe/credits/checkout
 * Create a Stripe checkout session for credit purchase
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const { organizationId, packageId, customAmount, couponCode } = await request.json()

  if (!organizationId) {
    throw badRequestError('Organization ID is required')
  }

  // Check if user is an admin
  await requireOrganizationAccess(user.id, organizationId, true)

  const supabase = getSupabaseServer()

  // Get organization details
  const { data: organization } = await supabase
    .from('organizations')
    .select('name, slug')
    .eq('id', organizationId)
    .single() as { data: OrganizationInfo | null }

  if (!organization) {
    throw notFoundError('Organization')
  }

  // Determine credit amount and price
  let creditAmount: number
  let priceAmount: number
  let packageName: string

  if (packageId && packageId !== 'custom') {
    const pkg = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES]
    if (!pkg) {
      throw badRequestError('Invalid package ID')
    }
    creditAmount = pkg.credits
    priceAmount = pkg.price
    packageName = pkg.name
  } else if (customAmount) {
    if (typeof customAmount !== 'number' || customAmount < 1 || customAmount > 1000) {
      throw badRequestError('Custom amount must be between 1 and 1000')
    }
    creditAmount = customAmount
    priceAmount = calculateCustomPrice(customAmount)
    packageName = `${customAmount} Custom Credits`
  } else {
    throw badRequestError('Either packageId or customAmount is required')
  }

  // Validate coupon if provided
  let couponData = null
  let discountAmount = 0
  if (couponCode) {
    const couponRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: couponCode,
        organization_id: organizationId,
        user_id: user.id,
      }),
    })

    if (couponRes.ok) {
      const couponResult = await couponRes.json()
      if (couponResult.valid && couponResult.coupon) {
        couponData = couponResult.coupon

        // Calculate discount
        if (couponData.discount_type === 'percentage') {
          discountAmount = Math.round(priceAmount * (couponData.discount_value / 100))
        } else if (couponData.discount_type === 'fixed_amount') {
          discountAmount = Math.min(priceAmount, couponData.discount_value * 100)
        }
        // Credits type doesn't affect price
      }
    }
  }

  const finalPrice = Math.max(priceAmount - discountAmount, 0)

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email || undefined,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: packageName,
            description: `${creditAmount} credits for ${organization.name}`,
            metadata: {
              [CREDIT_METADATA_KEYS.ORGANIZATION_ID]: organizationId,
              [CREDIT_METADATA_KEYS.USER_ID]: user.id,
              [CREDIT_METADATA_KEYS.CREDIT_TYPE]: 'course',
              [CREDIT_METADATA_KEYS.CREDIT_AMOUNT]: creditAmount.toString(),
              [CREDIT_METADATA_KEYS.PACKAGE_ID]: packageId || 'custom',
              [CREDIT_METADATA_KEYS.COUPON_CODE]: couponCode || '',
            },
          },
          unit_amount: finalPrice,
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/organizations/${organizationId}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/organizations/${organizationId}/credits/purchase`,
    metadata: {
      [CREDIT_METADATA_KEYS.ORGANIZATION_ID]: organizationId,
      [CREDIT_METADATA_KEYS.USER_ID]: user.id,
      [CREDIT_METADATA_KEYS.CREDIT_TYPE]: 'course',
      [CREDIT_METADATA_KEYS.CREDIT_AMOUNT]: creditAmount.toString(),
      [CREDIT_METADATA_KEYS.PACKAGE_ID]: packageId || 'custom',
      [CREDIT_METADATA_KEYS.COUPON_CODE]: couponCode || '',
    },
  })

  return successResponse({
    sessionId: session.id,
    url: session.url,
  })
})

