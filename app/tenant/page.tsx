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
import { SeriosityScoreBadge } from '@/components/profile/SeriosityScoreBadge'
import { ScoreBreakdownModal } from '@/components/profile/ScoreBreakdownModal'
import { DocumentUploadSection } from '@/components/profile/DocumentUploadSection'
import { ProfileCompletionProgress } from '@/components/profile/ProfileCompletionProgress'
import { InterviewIntro } from '@/components/interview/InterviewIntro'
import { InterviewFlow } from '@/components/interview/InterviewFlow'
import { ChatAssistantWidget } from '@/components/chat-assistant'
import { PropertyListView, LikedPropertiesList } from '@/components/properties'
import { TenantApplicationsList } from '@/components/applications'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Heart, LogIn, CheckCircle, Search, FileText } from 'lucide-react'

export default function TenantDashboard() {
  const { user, loading } = useAuth()
  const [profile, setProfile] = useState<TenantProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showIDVerification, setShowIDVerification] = useState(false)
  const [profileComplete, setProfileComplete] = useState(false)
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false)
  const [showInterview, setShowInterview] = useState(false)
  const [startingInterview, setStartingInterview] = useState(false)
  const [likedPropertyIds, setLikedPropertyIds] = useState<string[]>([])
  const [loadingLikes, setLoadingLikes] = useState(false)

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

  useEffect(() => {
    const loadLikedProperties = async () => {
      if (!user) return

      setLoadingLikes(true)
      try {
        const response = await fetch(`/api/tenants/${user.uid}/liked-properties`)
        if (response.ok) {
          const data = await response.json()
          setLikedPropertyIds(data.properties.map((p: any) => p.id))
        }
      } catch (error) {
        console.error('Error loading liked properties:', error)
      } finally {
        setLoadingLikes(false)
      }
    }

    if (profileComplete) {
      loadLikedProperties()
    }
  }, [user, profileComplete])

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

  const handleStartInterview = async () => {
    setStartingInterview(true)
    try {
      // TODO: Call API to start interview
      // For now, just show the interview interface
      setShowInterview(true)
    } catch (error) {
      console.error('Error starting interview:', error)
    } finally {
      setStartingInterview(false)
    }
  }

  const handleInterviewComplete = () => {
    setShowInterview(false)
    // Reload profile to show updated interview status
    if (user) {
      getTenantProfile(user.uid).then(setProfile)
    }
  }

  const handleCancelInterview = () => {
    setShowInterview(false)
  }

  const handleFiltersApplied = (filters: any) => {
    console.log('Filters applied:', filters)
    // Reload profile to get updated search preferences
    if (user) {
      getTenantProfile(user.uid).then(setProfile)
    }
    // The PropertyListView will automatically use the updated filters
  }

  const handleLikeProperty = async (propertyId: string) => {
    if (!user) return

    try {
      const isLiked = likedPropertyIds.includes(propertyId)
      
      if (isLiked) {
        // Unlike
        const response = await fetch(`/api/properties/${propertyId}/like`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: user.uid })
        })

        if (response.ok) {
          setLikedPropertyIds(prev => prev.filter(id => id !== propertyId))
        }
      } else {
        // Like
        const response = await fetch(`/api/properties/${propertyId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: user.uid })
        })

        if (response.ok) {
          setLikedPropertyIds(prev => [...prev, propertyId])
        }
      }
    } catch (error) {
      console.error('Error toggling property like:', error)
    }
  }

  const handlePassProperty = async (propertyId: string) => {
    // For now, just log it. Could implement a "passed" list later
    console.log('Passed on property:', propertyId)
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
            {user ? `Welcome back${profile?.name ? `, ${profile.name}` : ''}!` : 'Browse available properties. Sign in to like properties and connect with landlords.'}
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
            {/* Profile Completion Progress */}
            {profile && (
              <ProfileCompletionProgress profile={profile} />
            )}

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

            {/* Seriosity Score Display */}
            {profile?.seriosityScore !== undefined && profile.seriosityScore > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Seriosity Score</CardTitle>
                  <CardDescription>
                    Your score helps landlords assess your reliability as a tenant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SeriosityScoreBadge
                    score={profile.seriosityScore}
                    breakdown={profile.seriosityBreakdown}
                    showBreakdown={!!profile.seriosityBreakdown}
                    onShowDetails={() => setShowScoreBreakdown(true)}
                    size="lg"
                  />
                  
                  {profile.seriosityBreakdown && (
                    <ScoreBreakdownModal
                      isOpen={showScoreBreakdown}
                      onClose={() => setShowScoreBreakdown(false)}
                      score={profile.seriosityScore}
                      breakdown={profile.seriosityBreakdown}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Interview Section */}
            {profile?.idVerificationStatus === 'verified' && !profile?.interviewCompleted && !showInterview && (
              <InterviewIntro
                onStart={handleStartInterview}
                isLoading={startingInterview}
              />
            )}

            {/* Interview Flow */}
            {showInterview && user && (
              <InterviewFlow
                interviewId={profile?.interviewId || 'temp-id'}
                onComplete={handleInterviewComplete}
                onCancel={handleCancelInterview}
              />
            )}

            {/* Document Upload Section */}
            {user && (
              <DocumentUploadSection
                userId={user.uid}
                documents={profile?.documents}
                onUploadComplete={() => {
                  // Reload profile after upload
                  getTenantProfile(user.uid).then(setProfile)
                }}
              />
            )}

            {/* Property Tabs - Browse, Liked, and Applications */}
            <div className="mt-8">
              <Tabs defaultValue="browse" className="w-full">
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="browse" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Browse
                  </TabsTrigger>
                  <TabsTrigger value="liked" className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Liked ({likedPropertyIds.length})
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Applications
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="browse" className="mt-6">
                  <PropertyListView
                    userId={user.uid}
                    initialFilters={{
                      budget_min: profile?.budgetMin,
                      budget_max: profile?.budgetMax,
                      locations: profile?.preferredLocations,
                      pets_allowed: profile?.hasPets
                    }}
                    onLike={handleLikeProperty}
                    onPass={handlePassProperty}
                    likedPropertyIds={likedPropertyIds}
                    showFilters={true}
                  />
                </TabsContent>
                
                <TabsContent value="liked" className="mt-6">
                  <LikedPropertiesList
                    tenantId={user.uid}
                    onUnlike={(propertyId) => {
                      setLikedPropertyIds(prev => prev.filter(id => id !== propertyId))
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="applications" className="mt-6">
                  <TenantApplicationsList
                    tenantId={user.uid}
                    onOpenChat={(applicationId) => {
                      // TODO: Navigate to chat page
                      console.log('Open chat for application:', applicationId)
                      alert('Chat feature coming soon!')
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}

        {user && !profileComplete && !showProfileForm && (
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
              <CardDescription>
                Complete your profile to start browsing and liking properties
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

        {/* Property List View for non-authenticated users */}
        {!user && !loading && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Browse Properties</h2>
            <PropertyListView
              showFilters={true}
            />
          </div>
        )}

        {/* Chat Assistant Widget - Only show for authenticated users with complete profiles */}
        {user && profileComplete && !showProfileForm && !showIDVerification && (
          <ChatAssistantWidget onFiltersApplied={handleFiltersApplied} />
        )}
      </div>
    </div>
  )
}

