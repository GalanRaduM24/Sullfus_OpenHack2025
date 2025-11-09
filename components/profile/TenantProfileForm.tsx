'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, DollarSign, MapPin, Briefcase } from 'lucide-react'
import { TenantProfile } from '@/lib/firebase/users'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

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
    budgetMin: initialData?.budgetMin || '',
    budgetMax: initialData?.budgetMax || '',
    preferredLocations: initialData?.preferredLocations?.join(', ') || '',
    hasPets: initialData?.hasPets || false,
    bio: '', // Optional field
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
        budgetMin: parseInt(formData.budgetMin.toString()),
        budgetMax: parseInt(formData.budgetMax.toString()),
        preferredLocations: formData.preferredLocations
          .split(',')
          .map(loc => loc.trim())
          .filter(loc => loc.length > 0),
        hasPets: formData.hasPets,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      }

      const profileRef = doc(db, 'tenantProfiles', userId)
      await updateDoc(profileRef, profileData)

      // Update user document
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        name: formData.name,
        updatedAt: serverTimestamp(),
      })

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">Minimum Budget (RON/month) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="budgetMin"
                  type="number"
                  placeholder="1000"
                  min="0"
                  value={formData.budgetMin}
                  onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetMax">Maximum Budget (RON/month) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="budgetMax"
                  type="number"
                  placeholder="2000"
                  min="0"
                  value={formData.budgetMax}
                  onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredLocations">Preferred Locations</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="preferredLocations"
                type="text"
                placeholder="Bucharest, Cluj, Timisoara (comma separated)"
                value={formData.preferredLocations}
                onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value })}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter cities separated by commas
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasPets"
              checked={formData.hasPets}
              onChange={(e) => setFormData({ ...formData, hasPets: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="hasPets">I have pets</Label>
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
              'Complete Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

