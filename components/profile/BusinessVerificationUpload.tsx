'use client'

import { useState } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase/config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, CheckCircle2, FileText, X } from 'lucide-react'

interface BusinessVerificationUploadProps {
  userId: string
  onUploadComplete: (documentUrl: string) => void
  initialDocumentUrl?: string
}

export function BusinessVerificationUpload({ 
  userId, 
  onUploadComplete,
  initialDocumentUrl 
}: BusinessVerificationUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [documentUrl, setDocumentUrl] = useState(initialDocumentUrl || '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG) or PDF file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Create a reference to the storage location
      const timestamp = Date.now()
      const fileExtension = selectedFile.name.split('.').pop()
      const storageRef = ref(
        storage,
        `business-verification/${userId}/${timestamp}.${fileExtension}`
      )

      // Upload the file
      await uploadBytes(storageRef, selectedFile)

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef)

      setDocumentUrl(downloadUrl)
      onUploadComplete(downloadUrl)
      setSelectedFile(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      setError('Failed to upload document. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setDocumentUrl('')
    setSelectedFile(null)
    setError('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Business Verification (Optional)
        </CardTitle>
        <CardDescription>
          Upload your business registration document to get verified. This helps build trust with tenants.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {documentUrl ? (
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Business document uploaded
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Your business verification is pending review
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="business-document">
                Upload Business Registration Document
              </Label>
              <div className="flex items-center gap-2">
                <input
                  id="business-document"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileSelect}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2a6698] file:text-white hover:file:bg-[#3a7db8] file:cursor-pointer"
                  disabled={isUploading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Accepted formats: JPG, PNG, PDF (max 10MB)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-[#2a6698] hover:bg-[#3a7db8] text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
