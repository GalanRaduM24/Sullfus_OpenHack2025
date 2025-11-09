'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { getUserProfile } from '@/lib/firebase/users'
import { getIDVerificationStatus, IDCardDocument } from '@/lib/firebase/id-verification'
import { LandlordProfileForm } from '@/components/profile/LandlordProfileForm'
import { IDVerificationPrompt } from '@/components/profile/IDVerificationPrompt'
import { LandlordScoreCard } from '@/components/landlord/LandlordScoreCard'
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Shield,
  Building2
} from 'lucide-react'

interface LandlordProfile {
  role: 'landlord'
  name: string
  email: string
  phone?: string
  age?: number
  description?: string
  partnerAgencies?: string
  profileCompleted?: boolean
  idVerificationStatus?: 'not_verified' | 'pending' | 'verified' | 'rejected'
  createdAt?: any
  updatedAt?: any
}

export default function LandlordProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<LandlordProfile | null>(null)
  const [idVerification, setIdVerification] = useState<IDCardDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showIDVerification, setShowIDVerification] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfileData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadProfileData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load profile
      const userProfile = await getUserProfile(user.uid)
      if (userProfile && userProfile.role === 'landlord') {
        setProfile(userProfile as LandlordProfile)
      }

      // Load ID verification status
      const idStatus = await getIDVerificationStatus(user.uid)
      setIdVerification(idStatus)
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = () => {
    setShowEditForm(false)
    loadProfileData()
  }

  const handleIDVerificationComplete = () => {
    setShowIDVerification(false)
    loadProfileData()
  }

  const getVerificationStatusBadge = () => {
    // Check idVerification object first (most reliable)
    if (idVerification) {
      switch (idVerification.verificationStatus) {
        case 'verified':
          return (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          )
        case 'pending':
          return (
            <Badge className="bg-yellow-500 hover:bg-yellow-600">
              <Clock className="mr-1 h-3 w-3" />
              Pending Review
            </Badge>
          )
        case 'rejected':
          return (
            <Badge className="bg-red-500 hover:bg-red-600">
              <XCircle className="mr-1 h-3 w-3" />
              Rejected
            </Badge>
          )
      }
    }
    
    // Fallback to profile status
    switch (profile?.idVerificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="mr-1 h-3 w-3" />
            Pending Review
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            Not Verified
          </Badge>
        )
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (showEditForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowEditForm(false)}
            className="mb-4"
          >
            ← Back to Profile
          </Button>
          <LandlordProfileForm
            userId={user.uid}
            initialData={profile || undefined}
            onComplete={handleProfileUpdate}
          />
        </div>
      </div>
    )
  }

  if (showIDVerification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setShowIDVerification(false)}
            className="mb-4"
          >
            ← Back to Profile
          </Button>
          <IDVerificationPrompt
            userId={user.uid}
            userType="landlord"
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">Manage your landlord profile and verification</p>
          </div>
          <Button onClick={() => setShowEditForm(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        {/* Landlord Score Card */}
        <LandlordScoreCard
          profileData={{
            name: profile?.name,
            age: profile?.age,
            description: profile?.description,
            idVerificationStatus: profile?.idVerificationStatus,
            properties: [], // TODO: Load actual properties
          }}
        />

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>{profile?.name || 'No Name'}</CardTitle>
                  <CardDescription>Landlord Account</CardDescription>
                </div>
              </div>
              <Badge variant="outline">
                <Building2 className="mr-1 h-3 w-3" />
                Landlord
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{profile?.email || user.email || 'Not provided'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{profile?.phone || 'Not provided'}</p>
                </div>
              </div>

              {/* Age */}
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p className="text-base">{profile?.age ? `${profile.age} years` : 'Not provided'}</p>
                </div>
              </div>

              {/* Profile Status */}
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Profile Status</p>
                  <p className="text-base">
                    {profile?.profileCompleted ? (
                      <span className="text-green-600 font-medium">Complete</span>
                    ) : (
                      <span className="text-amber-600 font-medium">Incomplete</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {profile?.description && (
              <div className="pt-4 border-t">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">About</p>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {profile.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Partner Agencies */}
            {profile?.partnerAgencies && (
              <div className="pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Partner Agencies</p>
                    <p className="text-base text-muted-foreground">
                      {profile.partnerAgencies}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ID Verification Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-500" />
                <div>
                  <CardTitle>Identity Verification</CardTitle>
                  <CardDescription>
                    Verify your identity to list properties and manage tenants
                  </CardDescription>
                </div>
              </div>
              {getVerificationStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(profile?.idVerificationStatus === 'verified' || (idVerification && idVerification.verificationStatus === 'verified')) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <p className="font-medium">Your identity has been verified</p>
                </div>
                
                {idVerification?.data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                    {idVerification.data.fullName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{idVerification.data.fullName}</p>
                      </div>
                    )}
                    {idVerification.data.dateOfBirth && (
                      <div>
                        <p className="text-sm text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">{idVerification.data.dateOfBirth}</p>
                      </div>
                    )}
                    {idVerification.data.idNumber && (
                      <div>
                        <p className="text-sm text-muted-foreground">ID Number</p>
                        <p className="font-medium">{idVerification.data.idNumber}</p>
                      </div>
                    )}
                    {idVerification.verifiedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">Verified On</p>
                        <p className="font-medium">
                          {new Date(idVerification.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (profile?.idVerificationStatus === 'pending' || (idVerification && idVerification.verificationStatus === 'pending')) ? (
              <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                <Clock className="h-5 w-5" />
                <p className="font-medium">Your ID verification is being reviewed</p>
              </div>
            ) : (profile?.idVerificationStatus === 'rejected' || (idVerification && idVerification.verificationStatus === 'rejected')) ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <XCircle className="h-5 w-5" />
                  <p className="font-medium">ID verification was rejected</p>
                </div>
                {idVerification && idVerification.errors && idVerification.errors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-2">Reasons:</p>
                    <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                      {idVerification.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button 
                  onClick={() => setShowIDVerification(true)}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">You need to verify your identity</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  To list properties and manage tenant inquiries, you must verify your identity by uploading your ID card.
                </p>
                <Button 
                  onClick={() => setShowIDVerification(true)}
                  className="w-full"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Identity
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and registration date</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-sm font-mono">{user.uid.substring(0, 20)}...</span>
            </div>
            {profile?.createdAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Member Since</span>
                <span className="text-sm">
                  {new Date(profile.createdAt.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
            {profile?.updatedAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm">
                  {new Date(profile.updatedAt.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
