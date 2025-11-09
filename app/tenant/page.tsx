'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getTenantProfile } from '@/lib/firebase/users'
import { TenantProfile } from '@/lib/firebase/users'
import { isTenantProfileComplete } from '@/lib/utils/profile-completion'
import { TenantProfileForm } from '@/components/profile/TenantProfileForm'
import { IDVerificationPrompt } from '@/components/profile/IDVerificationPrompt'
import Link from 'next/link'
import { Heart, LogIn, CheckCircle } from 'lucide-react'

export default function TenantDashboard() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showIDVerification, setShowIDVerification] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfileLoading(false)
        return
      }

      try {
        const tenantProfile = await getTenantProfile(user.uid)
        setProfile(tenantProfile)
        
        if (tenantProfile) {
          const isComplete = isTenantProfileComplete(tenantProfile)
          setProfileComplete(isComplete)
          setShowProfileForm(!isComplete)
          
          // Show ID verification after profile is complete (if not already verified)
          if (isComplete && tenantProfile.idVerificationStatus !== 'verified') {
            setShowIDVerification(true)
          }
        } else {
          // No profile exists, show form
          setShowProfileForm(true)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleProfileComplete = () => {
    setShowProfileForm(false)
    setProfileComplete(true)
    setShowIDVerification(true)
    // Reload profile
    if (user) {
      getTenantProfile(user.uid).then(setProfile)
    }
  }

  const handleIDVerificationSkip = () => {
    setShowIDVerification(false)
  }

  const handleIDVerificationComplete = () => {
    setShowIDVerification(false)
    // Reload profile
    if (user) {
      getTenantProfile(user.uid).then(setProfile)
    }
  }

  if (profileLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Browse Properties 👋</h1>
          <p className="text-muted-foreground text-lg">
            {user ? `Welcome back${profile?.fullName ? `, ${profile.fullName}` : ''}!` : 'Browse available properties. Sign in to like properties and connect with landlords.'}
          </p>
        </div>

        {!user && !loading && (
          <Card className="border-amber-500/50 bg-amber-50/10">
            <CardHeader>
              <CardTitle>Sign in to get started</CardTitle>
              <CardDescription>
                Create an account to like properties and chat with landlords
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Link href="/auth/signup">
                <Button>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {user && showProfileForm && (
          <TenantProfileForm
            userId={user.uid}
            initialData={profile || undefined}
            onComplete={handleProfileComplete}
          />
        )}

        {user && profileComplete && showIDVerification && !showProfileForm && (
          <IDVerificationPrompt
            userId={user.uid}
            userType="tenant"
            onComplete={handleIDVerificationComplete}
            onSkip={handleIDVerificationSkip}
          />
        )}

        {user && profileComplete && !showProfileForm && !showIDVerification && (
          <>
            {profile?.idVerificationStatus === 'verified' && (
              <Card className="border-green-500/50 bg-green-50/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <p className="font-semibold">Your profile is complete and verified!</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
                <CardDescription>
                  Start browsing and liking properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-4">
                    No properties yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Properties will appear here for you to browse and like
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {user && !profileComplete && !showProfileForm && (
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                Complete your profile to start browsing properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">
                  Complete your profile to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

