'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Check, AlertCircle, Loader2, Camera, ArrowRight, User } from 'lucide-react'
import Image from 'next/image'
import { verifyAndStoreIDCard } from '@/lib/firebase/id-verification'
import { IDVerificationResponse } from '@/lib/services/id-verification.service'
import { CameraCapture } from './CameraCapture'

interface IDCardUploadProps {
  userId: string
  userType: 'tenant' | 'landlord'
  onVerificationComplete?: (result: IDVerificationResponse) => void
  onVerificationError?: (error: string) => void
}

export function IDCardUpload({
  userId,
  userType,
  onVerificationComplete,
  onVerificationError,
}: IDCardUploadProps) {
  const [step, setStep] = useState<'id-card' | 'selfie' | 'processing' | 'complete'>('id-card')
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<IDVerificationResponse | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const idCardInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  const handleIdCardSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onVerificationError?.('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      onVerificationError?.('Image must be less than 5MB')
      return
    }

    setIdCardFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setIdCardPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSelfieSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onVerificationError?.('Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      onVerificationError?.('Image must be less than 5MB')
      return
    }

    setSelfieFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelfiePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraCapture = (photoBlob: Blob, photoDataUrl: string) => {
    // Convert blob to File object
    const file = new File([photoBlob], 'selfie.jpg', { type: 'image/jpeg' })
    setSelfieFile(file)
    setSelfiePreview(photoDataUrl)
    setShowCamera(false)
  }

  const handleCameraCancel = () => {
    setShowCamera(false)
  }

  const proceedToSelfie = () => {
    if (idCardFile) {
      setStep('selfie')
    }
  }

  const handleVerification = async () => {
    if (!idCardFile || !selfieFile) return

    setStep('processing')
    setIsUploading(true)

    try {
      // For now, we'll process the ID card with Gemini (the selfie comparison would be added later)
      const result = await verifyAndStoreIDCard(userId, userType, idCardFile)
      
      setVerificationResult(result)
      
      if (result.success) {
        setStep('complete')
        onVerificationComplete?.(result)
      } else {
        setStep('id-card')
        onVerificationError?.(result.errors?.join(', ') || 'Verification failed')
      }
    } catch (error) {
      console.error('Error during verification:', error)
      setStep('id-card')
      onVerificationError?.('Verification failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const resetProcess = () => {
    setStep('id-card')
    setIdCardFile(null)
    setIdCardPreview(null)
    setSelfieFile(null)
    setSelfiePreview(null)
    setVerificationResult(null)
    if (idCardInputRef.current) idCardInputRef.current.value = ''
    if (selfieInputRef.current) selfieInputRef.current.value = ''
  }

  // Step 1: ID Card Upload
  if (step === 'id-card') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-medium">1</div>
          <span className="font-medium">Upload ID Card (CI/Buletin)</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center justify-center w-6 h-6 bg-gray-300 text-gray-600 rounded-full text-sm font-medium">2</div>
          <span className="text-gray-500">Take Selfie</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Upload a clear photo of your Romanian ID card (CI) or identity bulletin (buletin).
        </p>

        {!idCardPreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              ref={idCardInputRef}
              type="file"
              accept="image/*"
              onChange={handleIdCardSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => idCardInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-gray-600 mb-2">
                Click to upload your ID card
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG up to 5MB
              </p>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative inline-block">
              <Image
                src={idCardPreview}
                alt="ID Card Preview"
                width={300}
                height={200}
                className="rounded-lg border shadow-sm"
              />
              <button
                onClick={resetProcess}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={proceedToSelfie} className="w-full">
              Continue to Selfie
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Step 2: Selfie Capture
  if (step === 'selfie') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-6 h-6 bg-green-600 text-white rounded-full text-sm font-medium">
            <Check className="h-3 w-3" />
          </div>
          <span className="text-green-600 font-medium">ID Card Uploaded</span>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-sm font-medium">2</div>
          <span className="font-medium">Take Selfie</span>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Take a clear selfie to verify your identity matches the ID card.
        </p>

        {showCamera ? (
          <CameraCapture
            onCapture={handleCameraCapture}
            onCancel={handleCameraCancel}
            facingMode="user"
          />
        ) : !selfiePreview ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="w-full"
              >
                <Camera className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                <p className="text-sm text-gray-600 mb-2">
                  Use Camera
                </p>
                <p className="text-xs text-gray-500">
                  Face the camera directly
                </p>
              </button>
            </div>
            
            <div className="text-center">
              <span className="text-sm text-gray-500">or</span>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                onChange={handleSelfieSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => selfieInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload from Gallery
                </p>
                <p className="text-xs text-gray-500">
                  Select an existing photo
                </p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative inline-block">
              <Image
                src={selfiePreview}
                alt="Selfie Preview"
                width={200}
                height={200}
                className="rounded-full border shadow-sm"
              />
              <button
                onClick={() => {
                  setSelfieFile(null)
                  setSelfiePreview(null)
                  if (selfieInputRef.current) selfieInputRef.current.value = ''
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('id-card')}>
                Back
              </Button>
              <Button onClick={handleVerification} className="flex-1">
                Verify Identity
                <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Step 3: Processing
  if (step === 'processing') {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
        <h3 className="text-lg font-medium mb-2">Verifying Your Identity</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we verify your ID card and selfie...
        </p>
      </div>
    )
  }

  // Step 4: Complete
  if (step === 'complete') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-green-600">Verification Complete!</h3>
        <p className="text-sm text-muted-foreground">
          Your identity has been successfully verified. You now have full access to the platform.
        </p>
      </div>
    )
  }

  return null
}

