'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getLandlordProfile, LandlordProfile } from '@/lib/firebase/users'
import { isLandlordProfileComplete } from '@/lib/utils/profile-completion'
import { AlertTriangle, Shield, User, CheckCircle } from 'lucide-react'

interface ProfileVerificationGuardProps {
  children: React.ReactNode
  requireIdVerification?: boolean
  redirectTo?: string
}

export function ProfileVerificationGuard({ 
  children, 
  requireIdVerification = true,
  redirectTo = '/landlord'
}: ProfileVerificationGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<LandlordProfile | null>(null)
  const [checking, setChecking] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        router.push('/auth/signin?returnUrl=' + encodeURIComponent(window.location.pathname))
        return
      }

      try {
        const landlordProfile = await getLandlordProfile(user.uid)
        setProfile(landlordProfile)

        if (landlordProfile) {
          const isComplete = isLandlordProfileComplete(landlordProfile)
          setProfileComplete(isComplete)

          if (!isComplete) {
            router.push(redirectTo + '?complete-profile=true')
            return
          }

          if (requireIdVerification && landlordProfile.idVerificationStatus !== 'verified') {
            // Allow access but show warning - don't redirect
          }
        } else {
          router.push(redirectTo + '?create-profile=true')
          return
        }
      } catch (error) {
        console.error('Error checking profile:', error)
      } finally {
        setChecking(false)
      }
    }

    checkProfile()
  }, [user, router, requireIdVerification, redirectTo])

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Checking your profile...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile || !profileComplete) {
    return null // Will redirect
  }

  if (requireIdVerification && profile.idVerificationStatus !== 'verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <Card className="bg-gray-900/50 backdrop-blur-xl border-amber-500/50">
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 text-amber-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">ID Verification Required</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                To ensure the safety and trust of our platform, all landlords must verify their identity 
                before adding properties or managing tenant inquiries. This helps protect both landlords 
                and tenants in our community.
              </p>
              
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Verification Status</p>
                    <p className="text-sm">
                      {profile.idVerificationStatus === 'pending' ? 'Under Review' :
                       profile.idVerificationStatus === 'rejected' ? 'Rejected - Please Retry' :
                       'Not Started'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button 
                  onClick={() => router.push('/landlord?verify-id=true')}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <User className="mr-2 h-4 w-4" />
                  Verify Identity
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/landlord')}
                  className="border-gray-600 text-gray-300"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook for checking profile status in components
export function useProfileVerification(requireIdVerification = true) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<LandlordProfile | null>(null)
  const [isVerified, setIsVerified] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const landlordProfile = await getLandlordProfile(user.uid)
        setProfile(landlordProfile)

        if (landlordProfile) {
          const complete = isLandlordProfileComplete(landlordProfile)
          setIsComplete(complete)
          setIsVerified(
            complete && 
            (!requireIdVerification || landlordProfile.idVerificationStatus === 'verified')
          )
        }
      } catch (error) {
        console.error('Error checking profile:', error)
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [user, requireIdVerification])

  return {
    profile,
    isVerified,
    isComplete,
    loading,
    canAddProperties: isComplete && profile?.idVerificationStatus === 'verified',
    canManageInquiries: isComplete && profile?.idVerificationStatus === 'verified'
  }
}