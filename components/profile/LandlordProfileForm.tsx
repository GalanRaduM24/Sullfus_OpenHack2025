'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Mail, FileText } from 'lucide-react'
import { LandlordProfile } from '@/lib/firebase/users'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { IDVerificationPrompt } from './IDVerificationPrompt'

interface LandlordProfileFormProps {
  userId: string
  initialData?: Partial<LandlordProfile>
  onComplete: () => void
}

export function LandlordProfileForm({ userId, initialData, onComplete }: LandlordProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: initialData?.age || '',
    description: initialData?.description || '',
    partnerAgencies: initialData?.partnerAgencies || '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const profileData = {
        name: formData.name,
        age: parseInt(formData.age.toString()),
        description: formData.description,
        partnerAgencies: formData.partnerAgencies,
        role: 'landlord',
        email: initialData?.email || '',
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      }

      // Save to landlordProfiles collection (use setDoc with merge)
      const landlordProfileRef = doc(db, 'landlordProfiles', userId)
      await setDoc(landlordProfileRef, profileData, { merge: true })

      // Update users collection with basic info
      const userRef = doc(db, 'users', userId)
      await setDoc(userRef, {
        name: formData.name,
        role: 'landlord',
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      console.log('✅ Landlord profile saved successfully')
      onComplete()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Landlord Profile</CardTitle>
        <CardDescription>
          Tell tenants about yourself and your properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                placeholder="35"
                min="18"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Tell tenants about yourself, your experience as a landlord, and your properties..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="partnerAgencies">Partner Agencies</Label>
            <Input
              id="partnerAgencies"
              type="text"
              placeholder="e.g., RE/MAX, Century 21, Coldwell Banker (optional)"
              value={formData.partnerAgencies}
              onChange={(e) => setFormData({ ...formData, partnerAgencies: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              List any real estate agencies you work with (optional)
            </p>
          </div>

          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Start Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Let's validate you are a real person
                </p>
              </div>
            </div>
            <IDVerificationPrompt 
              userId={userId} 
              userType="landlord" 
              isOptional={true}
              onComplete={() => {}}
              onSkip={() => {}}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#2a6698] hover:bg-[#3a7db8] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Complete Landlord Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

