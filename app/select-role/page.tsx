'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Building2, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // Check if user has a profile
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const userData = userSnap.data()
          if (userData.activeRoles && userData.activeRoles.length > 0) {
            // User has a role, redirect to their dashboard
            setHasProfile(true)
            router.push(`/${userData.activeRoles[0]}`)
            return
          }
        }
      } catch (error) {
        console.error('Error checking user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserProfile()
  }, [user, router])

  const handleRoleSelection = async (role: 'tenant' | 'landlord') => {
    if (!user) return

    setSelectedRole(role)
    setIsLoading(true)

    try {
      // Create base user document
      const userRef = doc(db, 'users', user.uid)
      const userData = {
        userId: user.uid,
        email: user.email || '',
        fullName: user.displayName || '',
        activeRoles: [role],
        idVerificationStatus: 'not_verified',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(userRef, userData)

      // Create role-specific profile
      const profileRef = doc(db, `${role}Profiles`, user.uid)
      const profileData = {
        userId: user.uid,
        email: user.email || '',
        fullName: user.displayName || '',
        role: role,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(profileRef, profileData)

      // Navigate to dashboard
      router.push(`/${role}`)
    } catch (error) {
      console.error('Error creating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated, redirect to sign in
  if (!user && !loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to select your role
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/auth/signup" className="flex-1">
              <Button className="w-full">
                Sign Up
              </Button>
            </Link>
            <Link href="/auth/signin" className="flex-1">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/5 via-background to-background">
      <div className="text-center space-y-8 max-w-4xl w-full">
        <div>
          <h1 className="text-5xl font-bold mb-4">Choose Your Role</h1>
          <p className="text-xl text-muted-foreground">
            Select how you want to use Rently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Tenant Card */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === 'tenant'
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : 'hover:shadow-lg hover:border-primary/50'
            }`}
            onClick={() => handleRoleSelection('tenant')}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className={`p-4 rounded-full ${
                  selectedRole === 'tenant' ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <User className={`h-12 w-12 ${
                    selectedRole === 'tenant' ? 'text-white' : 'text-primary'
                  }`} />
                </div>
              </div>
              <CardTitle className="text-3xl text-center">I'm a Tenant</CardTitle>
              <CardDescription className="text-center text-base">
                Looking for a place to rent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Browse available properties</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Swipe through listings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Chat with landlords</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Upload intro video</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRoleSelection('tenant')
                }}
              >
                Continue as Tenant
              </Button>
            </CardContent>
          </Card>

          {/* Landlord Card */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedRole === 'landlord'
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : 'hover:shadow-lg hover:border-primary/50'
            }`}
            onClick={() => handleRoleSelection('landlord')}
          >
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className={`p-4 rounded-full ${
                  selectedRole === 'landlord' ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  <Building2 className={`h-12 w-12 ${
                    selectedRole === 'landlord' ? 'text-white' : 'text-primary'
                  }`} />
                </div>
              </div>
              <CardTitle className="text-3xl text-center">I'm a Landlord</CardTitle>
              <CardDescription className="text-center text-base">
                Looking to rent out my property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-left mb-6">
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>List your properties</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>View interested tenants</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Manage listings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Chat with tenants</span>
                </li>
              </ul>
              <Button 
                className="w-full" 
                size="lg"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRoleSelection('landlord')
                }}
              >
                Continue as Landlord
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
