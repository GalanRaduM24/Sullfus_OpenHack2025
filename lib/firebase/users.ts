// Shared Firebase functions for user management
// Used by both tenant and landlord interfaces

import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export type UserRole = 'tenant' | 'landlord'

export interface BaseUserProfile {
  id: string
  email: string
  role: UserRole
  name: string
  createdAt: any
  updatedAt: any
}

export interface TenantProfile extends BaseUserProfile {
  role: 'tenant'
  age?: number
  occupation?: string
  budgetMin?: number
  budgetMax?: number
  preferredLocations?: string[]
  hasPets?: boolean
  profilePhotoUrl?: string
  responsivenessScore?: number
  verificationStatus?: 'unverified' | 'video_verified'
  introVideoUrl?: string
}

export interface LandlordProfile extends BaseUserProfile {
  role: 'landlord'
  contactEmail?: string
  description?: string
  businessVerified?: boolean
  profilePhotoUrl?: string
  rating?: number
}

export type UserProfile = TenantProfile | LandlordProfile

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    throw error
  }
}

/**
 * Create or update user profile
 */
export async function setUserProfile(
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(
      userRef,
      {
        ...profileData,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error setting user profile:', error)
    throw error
  }
}

/**
 * Update user role
 */
export async function setUserRole(
  userId: string, 
  role: UserRole,
  additionalData?: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(
      userRef,
      {
        role,
        ...additionalData,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error setting user role:', error)
    throw error
  }
}

