'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, Loader2, CheckCircle, X, AlertCircle } from 'lucide-react'
import { Document } from '@/lib/firebase/types'

interface DocumentUploadSectionProps {
  userId: string
  documents?: {
    income_proof?: Document[]
    references?: Document[]
  }
  onUploadComplete?: () => void
}

export function DocumentUploadSection({
  userId,
  documents,
  onUploadComplete
}: DocumentUploadSectionProps) {
  const [uploadingIncome, setUploadingIncome] = useState(false)
  const [uploadingReference, setUploadingReference] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = async (
    file: File,
    documentType: 'income_proof' | 'reference'
  ) => {
    setError('')
    const setUploading = documentType === 'income_proof' ? setUploadingIncome : setUploadingReference
    setUploading(true)

    try {
      // Validate file
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 10MB')
      }

      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only PDF and image files (JPEG, PNG) are allowed')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('document_type', documentType)

      // Upload to API
      const response = await fetch(`/api/tenants/${userId}/documents`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to upload document')
      }

      const data = await response.json()
      
      // Show success message
      if (onUploadComplete) {
        onUploadComplete()
      }

      // Show score update if applicable
      if (data.seriosity_score) {
        // Could show a toast notification here
        console.log('Seriosity score updated:', data.seriosity_score)
      }
    } catch (err: any) {
      console.error('Error uploading document:', err)
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: 'income_proof' | 'reference'
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file, documentType)
    }
    // Reset input
    event.target.value = ''
  }

  const handleDeleteDocument = async (documentUrl: string, documentType: 'income_proof' | 'reference') => {
    try {
      const response = await fetch(`/api/tenants/${userId}/documents`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_url: documentUrl, document_type: documentType }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete document')
      }

      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err: any) {
      console.error('Error deleting document:', err)
      setError(err.message || 'Failed to delete document')
    }
  }

  const incomeProofDocs = documents?.income_proof || []
  const referenceDocs = documents?.references || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supporting Documents</CardTitle>
        <CardDescription>
          Upload income proof and references to improve your Seriosity Score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Income Proof Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Income Proof</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload pay stubs, employment letter, or bank statements (up to 25 points)
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {incomeProofDocs.length} uploaded
            </Badge>
          </div>

          {incomeProofDocs.length > 0 && (
            <div className="space-y-2">
              {incomeProofDocs.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Income Document {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(doc.uploaded_at.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                    {doc.verified && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.url, 'income_proof')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              type="file"
              id="income-proof-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, 'income_proof')}
              disabled={uploadingIncome}
            />
            <Label htmlFor="income-proof-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploadingIncome}
                onClick={() => document.getElementById('income-proof-upload')?.click()}
              >
                {uploadingIncome ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Income Proof
                  </>
                )}
              </Button>
            </Label>
          </div>
        </div>

        {/* References Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">References</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Upload reference letters from previous landlords (up to 10 points)
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {referenceDocs.length} uploaded
            </Badge>
          </div>

          {referenceDocs.length > 0 && (
            <div className="space-y-2">
              {referenceDocs.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">
                        Reference {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {new Date(doc.uploaded_at.toDate()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.url, 'reference')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              type="file"
              id="reference-upload"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e, 'reference')}
              disabled={uploadingReference}
            />
            <Label htmlFor="reference-upload">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploadingReference}
                onClick={() => document.getElementById('reference-upload')?.click()}
              >
                {uploadingReference ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Reference
                  </>
                )}
              </Button>
            </Label>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Uploading verified documents significantly improves your
            Seriosity Score and increases your chances of being approved by landlords.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
