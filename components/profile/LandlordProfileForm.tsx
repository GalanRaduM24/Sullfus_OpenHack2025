'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, User, Mail, FileText } from 'lucide-react'
import { LandlordProfile } from '@/lib/firebase/users'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { BusinessVerificationUpload } from './BusinessVerificationUpload'

interface LandlordProfileFormProps {
  userId: string
  initialData?: Partial<LandlordProfile>
  onComplete: () => void
}

export function LandlordProfileForm({ userId, initialData, onComplete }: LandlordProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || initialData?.contactName || '',
    contactEmail: initialData?.contactEmail || initialData?.email || '',
    description: initialData?.description || '',
  })

  const [businessDocumentUrl, setBusinessDocumentUrl] = useState(
    initialData?.businessVerificationDocumentUrl || ''
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const profileData: any = {
        name: formData.name,
        contactName: formData.name,
        contactEmail: formData.contactEmail,
        email: formData.contactEmail,
        description: formData.description,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      }

      // Add business verification fields if document was uploaded
      if (businessDocumentUrl) {
        profileData.businessVerificationDocumentUrl = businessDocumentUrl
        profileData.businessVerificationStatus = 'pending'
        profileData.businessVerified = false
      }

      const profileRef = doc(db, 'landlordProfiles', userId)
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
        <CardTitle>Complete Your Landlord Profile</CardTitle>
        <CardDescription>
          Tell tenants about yourself and your properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="contactEmail">Contact Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@example.com"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Textarea
                id="description"
                placeholder="Tell tenants about yourself and your properties..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="pl-10 min-h-[120px]"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Describe your properties and what kind of tenants you're looking for
            </p>
          </div>

          <BusinessVerificationUpload
            userId={userId}
            onUploadComplete={(url) => setBusinessDocumentUrl(url)}
            initialDocumentUrl={businessDocumentUrl}
          />

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

