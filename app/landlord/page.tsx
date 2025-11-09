'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile } from '@/lib/firebase/users'
import { useProfileVerification } from '@/hooks/useProfileVerification'
import { LandlordProfileForm } from '@/components/profile/LandlordProfileForm'
import { IDVerificationPrompt } from '@/components/profile/IDVerificationPrompt'
import { ProfileVerificationCard } from '@/components/profile/ProfileVerificationCard'
import { LandlordScoreCard } from '@/components/landlord/LandlordScoreCard'
import Link from 'next/link'
import { Plus, LogIn, CheckCircle, AlertCircle, Building2, Users, TrendingUp, Star, Sparkles, ArrowRight, Home, Eye, User } from 'lucide-react'

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
      <div className="min-h-screen bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {user && profile?.name ? `Welcome back, ${profile.name}` : 'Landlord Dashboard'}
            </h1>
            <p className="text-gray-400">
              {user 
                ? 'Manage your properties and connect with quality tenants.' 
                : 'Sign in to list your properties and find great tenants.'}
            </p>
          </div>          {/* Sign In Prompt */}
          {!user && !loading && (
            <Card className="border border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">Sign in to list properties</CardTitle>
                <CardDescription className="text-gray-400">
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
                  <Button variant="outline" className="border-gray-700 text-gray-300">
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

          {/* Landlord Score Card */}
          {user && isIdVerified && !showProfileForm && !showIDVerification && profile && (
            <LandlordScoreCard 
              profileData={{
                name: profile.name || '',
                age: (profile as any).age,
                description: (profile as any).description,
                idVerificationStatus: profile.idVerificationStatus || 'not_verified',
                properties: []
              }}
            />
          )}

          {/* Quick Actions */}
          {user && isIdVerified && !showProfileForm && !showIDVerification && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/landlord/add-property" className="block">
                <Card className="border border-gray-800 bg-gray-900 hover:border-gray-700 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <Plus className="h-5 w-5" />
                      Add Property
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      List a new property
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/landlord/properties" className="block">
                <Card className="border border-gray-800 bg-gray-900 hover:border-gray-700 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <Building2 className="h-5 w-5" />
                      My Properties
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage listings
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/landlord/profile" className="block">
                <Card className="border border-gray-800 bg-gray-900 hover:border-gray-700 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <User className="h-5 w-5" />
                      Profile
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      View your profile
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          )}

          {/* Stats */}
          {user && isIdVerified && !showProfileForm && !showIDVerification && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-gray-800 bg-gray-900">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm">Properties</p>
                  <p className="text-2xl font-bold text-white mt-1">0</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-800 bg-gray-900">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm">Views</p>
                  <p className="text-2xl font-bold text-white mt-1">0</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-800 bg-gray-900">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm">Inquiries</p>
                  <p className="text-2xl font-bold text-white mt-1">0</p>
                </CardContent>
              </Card>

              <Card className="border border-gray-800 bg-gray-900">
                <CardContent className="pt-6">
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-white mt-1">0</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

