'use client'

import LandlordNav from '@/components/landlord/LandlordNav'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    let mounted = true
    const checkProfile = async () => {
      if (!user) {
        setHasProfile(null)
        return
      }

      try {
        const profileRef = doc(db, 'landlordProfiles', user.uid)
        const snap = await getDoc(profileRef)
        if (!mounted) return
        setHasProfile(snap.exists())
      } catch (err) {
        console.error('Error checking landlord profile:', err)
        if (mounted) setHasProfile(false)
      }
    }

    checkProfile()

    return () => { mounted = false }
  }, [user])

  const createLandlordProfile = async () => {
    if (!user) return
    setCreating(true)
    try {
      const profileRef = doc(db, 'landlordProfiles', user.uid)
      const profileData = {
        userId: user.uid,
        email: user.email || '',
        fullName: user.displayName || '',
        name: user.displayName || '',
        role: 'landlord',
        isActive: true,
        profileComplete: false,
        idVerificationStatus: 'not_verified',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await setDoc(profileRef, profileData)

  // Add landlord to user's activeRoles (merge, avoid overwriting existing roles)
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)
  const existingRoles: string[] = userSnap.exists() ? (userSnap.data() as any).activeRoles || [] : []
  const newRoles = Array.from(new Set([...existingRoles, 'landlord']))
  await setDoc(userRef, { activeRoles: newRoles }, { merge: true })
      setHasProfile(true)
    } catch (err) {
      console.error('Error creating landlord profile:', err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandlordNav />
      {!user ? null : hasProfile === false ? (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <strong className="block">Create your Landlord profile</strong>
              <div className="text-sm text-muted-foreground">Create a landlord profile to list and manage properties.</div>
            </div>
            <div>
              <Button onClick={createLandlordProfile} disabled={creating}>
                {creating ? 'Creating…' : 'Create Landlord Profile'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <main className="pb-20">
        {children}
      </main>
    </div>
  )
}

