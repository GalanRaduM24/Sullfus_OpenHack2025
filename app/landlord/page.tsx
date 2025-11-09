'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile } from '@/lib/firebase/users'
import { useProfileVerification } from '@/hooks/useProfileVerification'
import { LandlordProfileForm } from '@/components/profile/LandlordProfileForm'
import { IDVerificationPrompt } from '@/components/profile/IDVerificationPrompt'
import { ProfileVerificationCard } from '@/components/profile/ProfileVerificationCard'
import Link from 'next/link'
import { Plus, LogIn, CheckCircle, AlertCircle, Building2, Users } from 'lucide-react'

interface LandlordProfile {
  role: 'landlord'
  name: string
  email: string
  age?: number
  description?: string
  partnerAgencies?: string
  profileCompleted?: boolean
  idVerificationStatus?: 'pending' | 'verified' | 'rejected'
}

export default function LandlordDashboard() {
  const { user, loading } = useAuth()
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showIDVerification, setShowIDVerification] = useState(false)

  // Use the verification hook
  const {
    profile,
    needsProfileCompletion,
    needsIdVerification,
    isIdVerified,
    loading: profileLoading
  } = useProfileVerification('landlord')

  const handleCompleteProfile = () => {
    setShowProfileForm(true)
  }

  const handleVerifyIdentity = () => {
    setShowIDVerification(true)
  }

  const handleProfileComplete = () => {
    setShowProfileForm(false)
    // The hook will automatically reload the profile
  }

  const handleIDVerificationComplete = () => {
    setShowIDVerification(false)
    // The hook will automatically reload the verification status
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
          <h1 className="text-4xl font-bold">List Your Property 🏢</h1>
          <p className="text-muted-foreground text-lg">
            {user ? `Welcome back${profile?.name ? `, ${profile.name}` : ''}!` : 'Sign in to list your properties and find great tenants.'}
          </p>
        </div>

        {!user && !loading && (
          <Card className="border-amber-500/50 bg-amber-50/10">
            <CardHeader>
              <CardTitle>Sign in to list properties</CardTitle>
              <CardDescription>
                Create an account to upload properties and connect with tenants
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

        {/* Profile Verification Card - Only shows when user needs to complete profile or verify ID */}
        {user && (needsProfileCompletion || needsIdVerification) && !showProfileForm && !showIDVerification && (
          <ProfileVerificationCard
            userRole="landlord"
            onCompleteProfile={handleCompleteProfile}
            onVerifyIdentity={handleVerifyIdentity}
          />
        )}

        {user && showProfileForm && (
          <LandlordProfileForm
            userId={user.uid}
            initialData={profile?.role === 'landlord' ? profile : undefined}
            onComplete={handleProfileComplete}
          />
        )}

        {user && showIDVerification && (
          <IDVerificationPrompt
            userId={user.uid}
            userType="landlord"
            onComplete={handleIDVerificationComplete}
            onSkip={() => setShowIDVerification(false)}
          />
        )}

        {user && isIdVerified && !showProfileForm && !showIDVerification && (
          <Card className="border-green-500/50 bg-green-50/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <p className="font-semibold">Your profile is complete and verified!</p>
                </div>
                <Link href="/landlord/properties">
                  <Button>
                    View Properties
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {user && !showProfileForm && !showIDVerification && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Property
                  </CardTitle>
                  <CardDescription>
                    List a new property for rent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/landlord/add-property">
                    <Button 
                      className="w-full"
                      disabled={!isIdVerified}
                    >
                      {!isIdVerified 
                        ? 'Verify ID First' 
                        : 'Add Property'
                      }
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    My Properties
                  </CardTitle>
                  <CardDescription>
                    Manage existing listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/landlord/properties">
                    <Button variant="outline" className="w-full">
                      View Properties
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tenant Inquiries
                  </CardTitle>
                  <CardDescription>
                    Review interested tenants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/landlord/properties">
                    <Button variant="outline" className="w-full">
                      View Inquiries
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

