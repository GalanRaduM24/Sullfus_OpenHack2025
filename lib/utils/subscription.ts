import { 
  Subscription, 
  SubscriptionFeatures, 
  SUBSCRIPTION_TIERS 
} from '@/lib/firebase/types'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

/**
 * Get landlord's current subscription
 */
export async function getLandlordSubscription(landlordId: string): Promise<Subscription | null> {
  try {
    const subscriptionsQuery = await getDoc(doc(db, 'subscriptions', landlordId))
    
    if (subscriptionsQuery.exists()) {
      return {
        id: subscriptionsQuery.id,
        ...subscriptionsQuery.data()
      } as Subscription
    }
    
    // Return default free subscription if none exists
    return {
      id: landlordId,
      landlord_id: landlordId,
      tier: 'free',
      status: 'active',
      current_period_start: new Date() as any,
      current_period_end: new Date() as any,
      created_at: new Date() as any
    }
  } catch (error) {
    console.error('Error getting subscription:', error)
    return null
  }
}

/**
 * Get subscription features for a tier
 */
export function getSubscriptionFeatures(tier: 'free' | 'pro' | 'business'): SubscriptionFeatures {
  return SUBSCRIPTION_TIERS[tier].features
}

/**
 * Check if landlord has access to a specific feature
 */
export async function checkFeatureAccess(
  landlordId: string, 
  feature: keyof SubscriptionFeatures
): Promise<boolean> {
  try {
    const subscription = await getLandlordSubscription(landlordId)
    
    if (!subscription || subscription.status !== 'active') {
      // Default to free tier if no active subscription
      return SUBSCRIPTION_TIERS.free.features[feature] === true
    }
    
    const features = getSubscriptionFeatures(subscription.tier)
    return features[feature] === true
  } catch (error) {
    console.error('Error checking feature access:', error)
    return false
  }
}

/**
 * Check multiple features at once
 */
export async function checkMultipleFeatures(
  landlordId: string,
  features: (keyof SubscriptionFeatures)[]
): Promise<Record<keyof SubscriptionFeatures, boolean>> {
  const subscription = await getLandlordSubscription(landlordId)
  const tier = subscription?.status === 'active' ? subscription.tier : 'free'
  const tierFeatures = getSubscriptionFeatures(tier)
  
  const result: any = {}
  features.forEach(feature => {
    result[feature] = tierFeatures[feature] === true
  })
  
  return result
}

/**
 * Get required tier for a feature
 */
export function getRequiredTierForFeature(feature: keyof SubscriptionFeatures): 'free' | 'pro' | 'business' | null {
  if (SUBSCRIPTION_TIERS.free.features[feature]) return 'free'
  if (SUBSCRIPTION_TIERS.pro.features[feature]) return 'pro'
  if (SUBSCRIPTION_TIERS.business.features[feature]) return 'business'
  return null
}

/**
 * Check if landlord can create more listings
 */
export async function canCreateListing(landlordId: string, currentListingCount: number): Promise<boolean> {
  const subscription = await getLandlordSubscription(landlordId)
  const tier = subscription?.status === 'active' ? subscription.tier : 'free'
  const features = getSubscriptionFeatures(tier)
  
  // -1 means unlimited
  if (features.max_listings === -1) return true
  
  return currentListingCount < features.max_listings
}

/**
 * Get subscription tier display name
 */
export function getSubscriptionTierName(tier: 'free' | 'pro' | 'business'): string {
  return SUBSCRIPTION_TIERS[tier].name
}

/**
 * Get subscription tier price
 */
export function getSubscriptionTierPrice(tier: 'free' | 'pro' | 'business'): number {
  return SUBSCRIPTION_TIERS[tier].price
}

/**
 * Format price for display
 */
export function formatSubscriptionPrice(price: number, currency: string = 'EUR'): string {
  if (price === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}
