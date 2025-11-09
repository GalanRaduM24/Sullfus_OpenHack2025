'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IDCardUpload } from '@/components/id-verification/IDCardUpload'
import { Shield, X, CheckCircle } from 'lucide-react'
import { IDVerificationResponse } from '@/lib/services/id-verification.service'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

interface IDVerificationPromptProps {
  userId: string
  userType: 'tenant' | 'landlord'
  onComplete?: () => void
  onSkip?: () => void
}

export function IDVerificationPrompt({
  userId,
  userType,
  onComplete,
  onSkip,
}: IDVerificationPromptProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | null>(null)

  const handleVerificationComplete = async (result: IDVerificationResponse) => {
    if (result.success) {
      setVerificationStatus('verified')
      
      // Update user document
      try {
        const userRef = doc(db, 'users', userId)
        await updateDoc(userRef, {
          idVerificationStatus: 'verified',
          idVerificationId: result.verificationId,
          updatedAt: serverTimestamp(),
        })
        
        // Update profile
        const profileRef = doc(db, `${userType}Profiles`, userId)
        await updateDoc(profileRef, {
          idVerificationStatus: 'verified',
          updatedAt: serverTimestamp(),
        })

        if (onComplete) {
          setTimeout(() => {
            onComplete()
          }, 2000)
        }
      } catch (error) {
        console.error('Error updating verification status:', error)
      }
    } else {
      setVerificationStatus('pending')
    }
  }

  if (verificationStatus === 'verified') {
    return (
      <Card className="border-green-500/50 bg-green-50/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">ID Verification Successful!</p>
              <p className="text-sm text-muted-foreground">
                Your identity has been verified. You can now use all platform features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showUpload) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verify Your Identity (Optional)</CardTitle>
          <CardDescription>
            Upload your ID card to verify your identity. This helps build trust with other users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IDCardUpload
            userId={userId}
            userType={userType}
            onVerificationComplete={handleVerificationComplete}
            onVerificationError={(error) => console.error('Verification error:', error)}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setShowUpload(false)
              if (onSkip) onSkip()
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Skip for Now
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-500/50 bg-blue-50/10">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <CardTitle>Verify Your Identity (Optional)</CardTitle>
            <CardDescription>
              Verify your ID to build trust and access all platform features
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex gap-4">
        <Button
          onClick={() => setShowUpload(true)}
          className="flex-1"
        >
          <Shield className="mr-2 h-4 w-4" />
          Verify ID
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            if (onSkip) onSkip()
          }}
        >
          Skip for Now
        </Button>
      </CardContent>
    </Card>
  )
}

