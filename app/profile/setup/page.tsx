'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { TenantProfileForm } from '@/components/profile/TenantProfileForm'
import { LandlordProfileForm } from '@/components/profile/LandlordProfileForm'
import { IDVerificationPrompt } from '@/components/profile/IDVerificationPrompt'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'

export default function ProfileSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | null>(null)
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showVerification, setShowVerification] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      try {
        const tenantRef = doc(db, 'tenantProfiles', user.uid)
        const tenantSnap = await getDoc(tenantRef)
        const landlordRef = doc(db, 'landlordProfiles', user.uid)
        const landlordSnap = await getDoc(landlordRef)

        // if user already has one profile, preselect it
        if (tenantSnap.exists()) {
          setSelectedRole('tenant')
          setInitialData(tenantSnap.data())
        } else if (landlordSnap.exists()) {
          setSelectedRole('landlord')
          setInitialData(landlordSnap.data())
        }
      } catch (err) {
        console.error('Error fetching profiles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  if (!user) return null

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Profile setup</h1>
        <p className="text-sm text-muted-foreground">Create and complete your tenant and/or landlord profiles. Verify your ID to increase trust.</p>

        <div className="flex gap-4">
          <Button variant={selectedRole === 'tenant' ? undefined : 'outline'} onClick={() => setSelectedRole('tenant')}>Tenant profile</Button>
          <Button variant={selectedRole === 'landlord' ? undefined : 'outline'} onClick={() => setSelectedRole('landlord')}>Landlord profile</Button>
        </div>

        <div>
          {loading && <div>Loading...</div>}

          {!loading && selectedRole === 'tenant' && (
            <div>
              <TenantProfileForm userId={user.uid} initialData={initialData} onComplete={() => setShowVerification(true)} />
            </div>
          )}

          {!loading && selectedRole === 'landlord' && (
            <div>
              <LandlordProfileForm userId={user.uid} initialData={initialData} onComplete={() => setShowVerification(true)} />
            </div>
          )}

          {showVerification && selectedRole && (
            <div className="mt-6">
              <IDVerificationPrompt userId={user.uid} userType={selectedRole} onComplete={() => {
                // after verification, send to the role dashboard
                router.push(`/${selectedRole}`)
              }} onSkip={() => router.push(`/${selectedRole}`)} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
