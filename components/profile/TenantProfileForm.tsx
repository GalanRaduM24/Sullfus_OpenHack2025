'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Briefcase } from 'lucide-react'
import { TenantProfile } from '@/lib/firebase/users'
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { IDVerificationPrompt } from './IDVerificationPrompt'

interface TenantProfileFormProps {
  userId: string
  initialData?: Partial<TenantProfile>
  onComplete: () => void
}

export function TenantProfileForm({ userId, initialData, onComplete }: TenantProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: initialData?.age || '',
    occupation: initialData?.occupation || '',
    description: initialData?.description || '',
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
        occupation: formData.occupation,
        description: formData.description,
        role: 'tenant',
        email: initialData?.email || '',
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      }

      // Save to tenantProfiles collection (use setDoc with merge)
      const tenantProfileRef = doc(db, 'tenantProfiles', userId)
      await setDoc(tenantProfileRef, profileData, { merge: true })

      // Update users collection with basic info
      const userRef = doc(db, 'users', userId)
      await setDoc(userRef, {
        name: formData.name,
        role: 'tenant',
        profileCompleted: true,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      console.log('✅ Tenant profile saved successfully')
      onComplete()
    } catch (error: any) {
      console.error('Error updating tenant profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Tenant Profile</CardTitle>
        <CardDescription>
          Help landlords get to know you better by completing your profile
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
                placeholder="25"
                min="18"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="occupation"
                type="text"
                placeholder="Software Engineer"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Tell us about yourself, your lifestyle, hobbies, and what you're looking for in a rental..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
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
              userType="tenant" 
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
              'Complete Tenant Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

