'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getTenantProfile, getLandlordProfile, TenantProfile, LandlordProfile } from '@/lib/firebase/users'
import { isTenantProfileComplete, isLandlordProfileComplete } from '@/lib/utils/profile-completion'

export type UserRole = 'tenant' | 'landlord'
export type VerificationStatus = 'not_verified' | 'pending' | 'verified' | 'rejected'

export interface ProfileVerificationState {
  profile: TenantProfile | LandlordProfile | null
  hasProfile: boolean
  isProfileComplete: boolean
  isIdVerified: boolean
  idVerificationStatus: VerificationStatus
  needsProfileCompletion: boolean
  needsIdVerification: boolean
  loading: boolean
  error: string | null
}

export function useProfileVerification(userRole: UserRole): ProfileVerificationState {
  const { user } = useAuth()
  const [state, setState] = useState<ProfileVerificationState>({
    profile: null,
    hasProfile: false,
    isProfileComplete: false,
    isIdVerified: false,
    idVerificationStatus: 'not_verified',
    needsProfileCompletion: false,
    needsIdVerification: false,
    loading: true,
    error: null
  })

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user) {
        setState(prev => ({
          ...prev,
          loading: false,
          hasProfile: false,
          isProfileComplete: false,
          isIdVerified: false,
          needsProfileCompletion: false,
          needsIdVerification: false
        }))
        return
      }

      try {
        let profile: TenantProfile | LandlordProfile | null = null
        let isComplete = false

        if (userRole === 'tenant') {
          profile = await getTenantProfile(user.uid)
          if (profile) {
            isComplete = isTenantProfileComplete(profile)
          }
        } else {
          profile = await getLandlordProfile(user.uid)
          if (profile) {
            isComplete = isLandlordProfileComplete(profile)
          }
        }

        const hasProfile = profile !== null
        const idStatus = profile?.idVerificationStatus || 'not_verified'
        const isIdVerified = idStatus === 'verified'
        
        // Determine what the user needs to do
        const needsProfileCompletion = !hasProfile || !isComplete
        const needsIdVerification = hasProfile && isComplete && !isIdVerified

        setState({
          profile,
          hasProfile,
          isProfileComplete: isComplete,
          isIdVerified,
          idVerificationStatus: idStatus,
          needsProfileCompletion,
          needsIdVerification,
          loading: false,
          error: null
        })
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load profile'
        }))
      }
    }

    checkProfileStatus()
  }, [user, userRole])

  return state
}

// Helper function to determine if user should see any verification prompts
export function shouldShowVerificationPrompts(
  isSignedIn: boolean,
  needsProfileCompletion: boolean,
  needsIdVerification: boolean
): boolean {
  return isSignedIn && (needsProfileCompletion || needsIdVerification)
}

// Helper function to get the appropriate verification message
export function getVerificationMessage(
  needsProfileCompletion: boolean,
  needsIdVerification: boolean,
  userRole: UserRole
): { title: string; description: string; actionText: string } {
  if (needsProfileCompletion) {
    return {
      title: 'Complete Your Profile',
      description: `Complete your ${userRole} profile to ${userRole === 'tenant' ? 'apply for properties and chat with landlords' : 'list properties and manage tenant inquiries'}.`,
      actionText: 'Complete Profile'
    }
  }
  
  if (needsIdVerification) {
    return {
      title: 'Verify Your Identity',
      description: `Verify your identity to ${userRole === 'tenant' ? 'apply for properties and build trust with landlords' : 'list properties and ensure platform safety'}.`,
      actionText: 'Verify Identity'
    }
  }

  return {
    title: '',
    description: '',
    actionText: ''
  }
}