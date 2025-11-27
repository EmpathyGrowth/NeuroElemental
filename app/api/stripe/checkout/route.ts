import { stripe } from '@/lib/stripe/config';
import { createAuthenticatedRoute, successResponse, validateRequest } from '@/lib/api';
import { stripeCheckoutSchema } from '@/lib/validation/schemas';

export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  // Validate request body
  const validation = await validateRequest(request, stripeCheckoutSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { priceId, successUrl, cancelUrl, metadata } = validation.data;

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      userId: user.id,
      ...metadata,
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: priceId.includes('sub_') ? 'subscription' : 'payment',
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    allow_promotion_codes: true,
  });

  return successResponse({ sessionId: session.id, url: session.url });
})