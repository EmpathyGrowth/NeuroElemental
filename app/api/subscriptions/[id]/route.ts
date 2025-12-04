import { getSupabaseServer } from '@/lib/db';
import { stripe } from '@/lib/stripe/config';
import { badRequestError, createAuthenticatedRoute, getStripePriceId, internalError, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getCurrentTimestamp, getUpdateTimestamp } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { subscriptionUpdateSchema } from '@/lib/validation/schemas';

/** Subscription data from database */
interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: Subscription | null; error: { message: string } | null };

  if (error || !subscription) {
    throw notFoundError('Subscription');
  }

  // Get Stripe subscription data
  try {
    if (subscription.stripe_subscription_id) {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      return successResponse({
        subscription: {
          ...subscription,
          stripe_data: stripeSub,
        },
      });
    }
  } catch (stripeError) {
    logger.error('Error fetching Stripe subscription', undefined, { errorMsg: stripeError instanceof Error ? stripeError.message : String(stripeError) });
  }

  return successResponse({ subscription });
});

export const PUT = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, subscriptionUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { plan_id, action } = validation.data;

  // Get existing subscription
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: Subscription | null; error: { message: string } | null };

  if (fetchError || !subscription) {
    throw notFoundError('Subscription');
  }

  const stripeSubId = subscription.stripe_subscription_id;
  if (!stripeSubId) {
    throw badRequestError('No Stripe subscription associated');
  }

  // Handle different actions
  if (action === 'cancel') {
    // Cancel at period end
    const stripeSub = await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true,
    });

    await (supabase as any)
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        ...getUpdateTimestamp(),
      })
      .eq('id', id);

    return successResponse({
      subscription: stripeSub,
      message: 'Subscription will be canceled at period end',
    });
  } else if (action === 'reactivate') {
    // Reactivate subscription
    const stripeSub = await stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: false,
    });

    await (supabase as any)
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        ...getUpdateTimestamp(),
      })
      .eq('id', id);

    return successResponse({
      subscription: stripeSub,
      message: 'Subscription reactivated',
    });
  } else if (action === 'update_plan' && plan_id) {
    // Update subscription plan
    const newPriceId = getStripePriceId(plan_id);
    if (!newPriceId) {
      throw badRequestError('Invalid plan');
    }

    const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
    const firstItem = stripeSub.items.data[0];
    if (!firstItem) {
      throw badRequestError('No subscription items found');
    }
    const stripSubUpdated = await stripe.subscriptions.update(stripeSubId, {
      items: [{
        id: firstItem.id,
        price: newPriceId,
      }],
      proration_behavior: 'always_invoice',
    });

    await (supabase as any)
      .from('subscriptions')
      .update({
        plan_id,
        ...getUpdateTimestamp(),
      })
      .eq('id', id);

    return successResponse({
      subscription: stripSubUpdated,
      message: 'Subscription plan updated',
    });
  }

  throw badRequestError('Invalid action');
});

export const DELETE = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params;
  const supabase = await getSupabaseServer();

  // Get existing subscription
  const { data: subscription, error: fetchError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: Subscription | null; error: { message: string } | null };

  if (fetchError || !subscription) {
    throw notFoundError('Subscription');
  }

  // Cancel immediately in Stripe
  const stripeSubId = subscription.stripe_subscription_id;
  if (!stripeSubId) {
    throw badRequestError('No Stripe subscription associated');
  }
  await stripe.subscriptions.cancel(stripeSubId);

  // Update database
  const { error: updateError } = await (supabase as any)
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: getCurrentTimestamp(),
      ...getUpdateTimestamp(),
    })
    .eq('id', id);

  if (updateError) {
    logger.error('Error updating subscription', undefined, { errorMsg: updateError instanceof Error ? updateError.message : String(updateError) });
    throw internalError('Failed to update subscription status');
  }

  return successResponse({
    message: 'Subscription canceled immediately',
  });
});
