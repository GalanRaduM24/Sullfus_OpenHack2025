'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { TenantProfileForm } from '@/components/profile/TenantProfileForm'
import { LandlordProfileForm } from '@/components/profile/LandlordProfileForm'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ProfileSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [userRole, setUserRole] = useState<'tenant' | 'landlord' | null>(null)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const fetchUserData = async () => {
      setLoading(true)
      try {
        // Get user's selected role from users collection
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        
        if (userSnap.exists()) {
          const userData = userSnap.data()
          const role = userData.role as 'tenant' | 'landlord'
          setUserRole(role)
          
          // Check if they already have a profile
          const profileRef = doc(db, `${role}Profiles`, user.uid)
          const profileSnap = await getDoc(profileRef)
          
          if (profileSnap.exists()) {
            const profileData = profileSnap.data()
            // If profile is complete, redirect to dashboard
            if (profileData.profileComplete) {
              router.push(`/${role}`)
              return
            }
            setInitialData(profileData)
          }
        } else {
          // No role selected, redirect to role selection
          router.push('/select-role')
          return
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user, router])

  const handleProfileComplete = () => {
    // After profile completion, redirect to dashboard which will handle verification flow
    if (userRole) {
      router.push(`/${userRole}`)
    }
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Role Required</CardTitle>
            <CardDescription>
              Please select your role first to continue with profile setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/select-role')} className="w-full">
              Select Role
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Fill out your {userRole} profile to get started. This information helps build trust with other users.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === 'tenant' ? 'Tenant Profile' : 'Landlord Profile'}
            </CardTitle>
            <CardDescription>
              Complete your profile information below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRole === 'tenant' && (
              <TenantProfileForm 
                userId={user.uid} 
                initialData={initialData} 
                onComplete={handleProfileComplete}
              />
            )}

            {userRole === 'landlord' && (
              <LandlordProfileForm 
                userId={user.uid} 
                initialData={initialData} 
                onComplete={handleProfileComplete}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
