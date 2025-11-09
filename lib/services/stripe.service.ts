/**
 * Stripe Service
 * Handles subscription billing and payment processing
 */

import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: {
      maxListings: 1,
      viewUnverifiedTenants: true,
      viewSeriosityScore: false,
      viewScoreBreakdown: false,
      viewDocuments: false,
      filterByScore: false,
      analytics: false,
      csvExport: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 14.99,
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    features: {
      maxListings: 5,
      viewUnverifiedTenants: true,
      viewSeriosityScore: true,
      viewScoreBreakdown: true,
      viewDocuments: true,
      filterByScore: true,
      analytics: false,
      csvExport: false,
      prioritySupport: false,
    },
  },
  business: {
    name: 'Business',
    price: 99.99,
    priceId: process.env.STRIPE_PRICE_ID_BUSINESS,
    features: {
      maxListings: -1, // unlimited
      viewUnverifiedTenants: true,
      viewSeriosityScore: true,
      viewScoreBreakdown: true,
      viewDocuments: true,
      filterByScore: true,
      analytics: true,
      csvExport: true,
      prioritySupport: true,
    },
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

/**
 * Create a new Stripe customer
 */
export async function createCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

/**
 * Create a subscription for a customer
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  metadata?: Record<string, string>
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata,
    });
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    throw new Error('Failed to create billing portal session');
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    return event;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * Check if a feature is available for a subscription tier
 */
export function checkFeatureAccess(
  tier: SubscriptionTier,
  feature: keyof (typeof SUBSCRIPTION_TIERS)['free']['features']
): boolean {
  return SUBSCRIPTION_TIERS[tier].features[feature] as boolean;
}

/**
 * Get subscription tier from price ID
 */
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  if (priceId === SUBSCRIPTION_TIERS.pro.priceId) return 'pro';
  if (priceId === SUBSCRIPTION_TIERS.business.priceId) return 'business';
  return null;
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

/**
 * Get Stripe configuration status
 */
export function getStripeConfig() {
  return {
    configured: isStripeConfigured(),
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasPriceIds: !!(
      process.env.STRIPE_PRICE_ID_PRO && process.env.STRIPE_PRICE_ID_BUSINESS
    ),
  };
}
