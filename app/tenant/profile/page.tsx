'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TenantProfileForm } from '@/components/profile/TenantProfileForm'
import { IDVerificationPrompt } from '@/components/profile/IDVerificationPrompt'
import { CheckCircle, AlertCircle, User, FileText, Shield } from 'lucide-react'

interface TenantProfile {
  userId: string
  name: string
  email: string
  age?: number
  bio?: string
  occupation?: string
  profileComplete?: boolean
  idVerificationStatus?: 'not_verified' | 'pending' | 'verified' | 'rejected'
}

interface IDVerification {
  verificationStatus: 'not_verified' | 'pending' | 'verified' | 'rejected'
}

export default function TenantProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [idVerification, setIdVerification] = useState<IDVerification | null>(null)
  const [loading, setLoading] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showIDVerification, setShowIDVerification] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProfileData = async () => {
      try {
        // Fetch tenant profile
        const profileRef = doc(db, 'tenantProfiles', user.uid)
        const profileSnap = await getDoc(profileRef)
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as TenantProfile)
        }

        // Fetch ID verification
        const idVerificationRef = doc(db, 'idVerifications', user.uid)
        const idVerificationSnap = await getDoc(idVerificationRef)
        
        if (idVerificationSnap.exists()) {
          setIdVerification(idVerificationSnap.data() as IDVerification)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user])

  const calculateProfileScore = () => {
    let score = 0
    const breakdown = {
      profileCompletion: 0,
      bioQuality: 0,
      idVerification: 0,
      detailsProvided: 0
    }

    // Profile Completion (30 points)
    if (profile?.name) breakdown.profileCompletion += 10
    if (profile?.email) breakdown.profileCompletion += 10
    if (profile?.occupation) breakdown.profileCompletion += 10

    // Bio Quality (20 points)
    if (profile?.bio) {
      const bioLength = profile.bio.length
      if (bioLength > 50) breakdown.bioQuality = 10
      if (bioLength > 150) breakdown.bioQuality = 20
    }

    // ID Verification (30 points)
    if (idVerification?.verificationStatus === 'verified') {
      breakdown.idVerification = 30
    } else if (idVerification?.verificationStatus === 'pending') {
      breakdown.idVerification = 15
    }

    // Details Provided (20 points)
    if (profile?.age) breakdown.detailsProvided += 10
    if (profile?.occupation) breakdown.detailsProvided += 10

    score = breakdown.profileCompletion + breakdown.bioQuality + breakdown.idVerification + breakdown.detailsProvided

    return { score, breakdown }
  }

  const handleProfileComplete = () => {
    setShowProfileForm(false)
    // Refresh profile data
    if (user) {
      const fetchProfile = async () => {
        const profileRef = doc(db, 'tenantProfiles', user.uid)
        const profileSnap = await getDoc(profileRef)
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as TenantProfile)
        }
      }
      fetchProfile()
    }
  }

  const handleIDVerificationComplete = () => {
    setShowIDVerification(false)
    // Refresh ID verification data
    if (user) {
      const fetchIDVerification = async () => {
        const idVerificationRef = doc(db, 'idVerifications', user.uid)
        const idVerificationSnap = await getDoc(idVerificationRef)
        if (idVerificationSnap.exists()) {
          setIdVerification(idVerificationSnap.data() as IDVerification)
        }
      }
      fetchIDVerification()
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-gray-800 bg-gray-900">
            <CardContent className="pt-6">
              <p className="text-gray-400 text-center">Please sign in to view your profile.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { score, breakdown } = calculateProfileScore()
  const isIdVerified = idVerification?.verificationStatus === 'verified'

  if (showProfileForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <TenantProfileForm
            userId={user.uid}
            initialData={profile || undefined}
            onComplete={handleProfileComplete}
          />
        </div>
      </div>
    )
  }

  if (showIDVerification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <IDVerificationPrompt
            userId={user.uid}
            userType="tenant"
            onComplete={handleIDVerificationComplete}
            onSkip={() => setShowIDVerification(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Tenant Profile</h1>
          <p className="text-gray-400 mt-2">Manage your profile and verification status</p>
        </div>

        {/* Profile Score Card */}
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Profile Strength Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-white">{score}/100</span>
                <Badge variant={score >= 80 ? "default" : score >= 50 ? "secondary" : "destructive"} className="bg-blue-600">
                  {score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
              <Progress value={score} className="h-3 bg-gray-800" />
              <p className="text-sm text-gray-400 mt-2">
                A higher score helps you stand out to landlords
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Profile Completion</span>
                  <span className="text-lg font-bold text-white">{breakdown.profileCompletion}/30</span>
                </div>
                <Progress value={(breakdown.profileCompletion / 30) * 100} className="h-2 bg-gray-700" />
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Bio Quality</span>
                  <span className="text-lg font-bold text-white">{breakdown.bioQuality}/20</span>
                </div>
                <Progress value={(breakdown.bioQuality / 20) * 100} className="h-2 bg-gray-700" />
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">ID Verification</span>
                  <span className="text-lg font-bold text-white">{breakdown.idVerification}/30</span>
                </div>
                <Progress value={(breakdown.idVerification / 30) * 100} className="h-2 bg-gray-700" />
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Details Provided</span>
                  <span className="text-lg font-bold text-white">{breakdown.detailsProvided}/20</span>
                </div>
                <Progress value={(breakdown.detailsProvided / 20) * 100} className="h-2 bg-gray-700" />
              </div>
            </div>

            {/* Tips */}
            {score < 100 && (
              <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Tips to improve your score:</h4>
                <ul className="space-y-1 text-sm text-gray-300">
                  {breakdown.profileCompletion < 30 && <li>• Complete all profile fields</li>}
                  {breakdown.bioQuality < 20 && <li>• Write a detailed bio (at least 150 characters)</li>}
                  {breakdown.idVerification < 30 && <li>• Verify your identity</li>}
                  {breakdown.detailsProvided < 20 && <li>• Add your age and occupation</li>}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-gray-800 bg-gray-900 hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => setShowProfileForm(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <User className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Edit Profile</h3>
                  <p className="text-sm text-gray-400">Update your information</p>
                </div>
                {profile?.profileComplete ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900 hover:bg-gray-800/50 transition-colors cursor-pointer"
                onClick={() => setShowIDVerification(true)}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">ID Verification</h3>
                  <p className="text-sm text-gray-400">
                    {isIdVerified ? 'Verified' : 
                     idVerification?.verificationStatus === 'pending' ? 'Pending review' : 
                     'Not verified'}
                  </p>
                </div>
                {isIdVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
