'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { verifyAndStoreIDCard } from '@/lib/firebase/id-verification'
import { IDVerificationResponse } from '@/lib/services/id-verification.service'

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<IDVerificationResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onVerificationError?.('Please upload an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onVerificationError?.('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    setVerificationResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setImageFile(null)
    setImagePreview(null)
    setVerificationResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!imageFile) return

    setIsUploading(true)
    setVerificationResult(null)

    try {
      const result = await verifyAndStoreIDCard(userId, userType, imageFile)
      
      setVerificationResult(result)
      
      if (result.success) {
        onVerificationComplete?.(result)
      } else {
        onVerificationError?.(result.errors?.join(', ') || 'Verification failed')
      }
    } catch (error) {
      console.error('Error uploading ID card:', error)
      onVerificationError?.('Failed to upload ID card. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="id-card-upload" className="text-base font-semibold mb-2 block">
          Upload ID Card
        </Label>
        <p className="text-sm text-gray-400 mb-4">
          Please upload a clear photo of your ID card. We'll verify it to ensure you're a real person.
        </p>
      </div>

      {!imagePreview ? (
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            id="id-card-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="id-card-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-300 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG up to 5MB
            </p>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
            <div className="relative aspect-[16/10] max-h-64">
              <Image
                src={imagePreview}
                alt="ID Card Preview"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div
              className={`p-4 rounded-lg border ${
                verificationResult.success
                  ? 'bg-green-950/50 border-green-700'
                  : 'bg-red-950/50 border-red-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {verificationResult.success ? (
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">
                    {verificationResult.success
                      ? 'ID Card Verified'
                      : 'Verification Failed'}
                  </h4>
                  {verificationResult.errors && verificationResult.errors.length > 0 && (
                    <ul className="text-sm text-gray-300 list-disc list-inside">
                      {verificationResult.errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  )}
                  {verificationResult.success && verificationResult.data && (
                    <div className="mt-2 text-sm text-gray-300">
                      <p>Name: {verificationResult.data.fullName || `${verificationResult.data.firstName} ${verificationResult.data.lastName}`}</p>
                      {verificationResult.data.cnp && (
                        <p>CNP: {verificationResult.data.cnp}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full bg-[#2a6698] hover:bg-[#3a7db8] text-white"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Verify ID Card
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

