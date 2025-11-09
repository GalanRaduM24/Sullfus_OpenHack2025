/**
 * Profile completion utilities
 */

import { TenantProfile, LandlordProfile } from '@/lib/firebase/users'

/**
 * Check if tenant profile is complete
 */
export function isTenantProfileComplete(profile: Partial<TenantProfile>): boolean {
  if (!profile) return false
  
  // Check if profileComplete flag is set (preferred method)
  if (profile.profileComplete === true) {
    return true
  }
  
  // Fallback: check required fields for tenant profile
  const required = [
    profile.name,
    profile.email,
    profile.age,
    profile.occupation,
    profile.budgetMin !== undefined && profile.budgetMin !== null,
    profile.budgetMax !== undefined && profile.budgetMax !== null,
  ]
  
  return required.every(field => field === true)
}

/**
 * Check if landlord profile is complete
 */
export function isLandlordProfileComplete(profile: Partial<LandlordProfile>): boolean {
  if (!profile) return false
  
  // Check if profileComplete flag is set (preferred method)
  if (profile.profileComplete === true) {
    return true
  }
  
  // Fallback: check required fields for landlord profile
  const required = [
    profile.name || profile.contactName,
    profile.email,
    profile.contactEmail || profile.email, // Contact email can be same as email
    profile.description && profile.description.trim().length > 0,
  ]
  
  return required.every(field => field === true)
}

/**
 * Get missing fields for tenant profile
 */
export function getMissingTenantFields(profile: Partial<TenantProfile>): string[] {
  const missing: string[] = []
  
  if (!profile.name) missing.push('Full Name')
  if (!profile.email) missing.push('Email')
  if (!profile.age) missing.push('Age')
  if (!profile.occupation) missing.push('Occupation')
  if (profile.budgetMin === undefined) missing.push('Minimum Budget')
  if (profile.budgetMax === undefined) missing.push('Maximum Budget')
  
  return missing
}

/**
 * Calculate profile completion percentage for tenant
 */
export function calculateTenantProfileCompletion(profile: Partial<TenantProfile>): number {
  const items = [
    // Required items
    !!(profile.name && profile.age && profile.occupation && 
       profile.budgetMin !== undefined && profile.budgetMax !== undefined),
    // Optional items
    profile.idVerificationStatus === 'verified',
    !!(profile.documents?.income_proof && profile.documents.income_proof.length > 0),
    profile.interviewCompleted === true,
    !!(profile.documents?.references && profile.documents.references.length > 0),
  ]
  
  const completedItems = items.filter(Boolean).length
  return Math.round((completedItems / items.length) * 100)
}

/**
 * Get missing fields for landlord profile
 */
export function getMissingLandlordFields(profile: Partial<LandlordProfile>): string[] {
  const missing: string[] = []
  
  if (!profile.name && !profile.contactName) missing.push('Full Name')
  if (!profile.email) missing.push('Email')
  if (!profile.contactEmail && !profile.email) missing.push('Contact Email')
  if (!profile.description) missing.push('Description')
  
  return missing
}

