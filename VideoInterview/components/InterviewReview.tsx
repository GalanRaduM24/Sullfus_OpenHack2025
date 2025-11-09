'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw, Upload, Play } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface InterviewReviewProps {
  videoUrl: string
  videoBlob: Blob
  recordingMode: 'video' | 'audio'
  onRetake: () => void
  onConfirm: () => void
  isUploading?: boolean
}

/**
 * Interview Review Component
 * 
 * Allows the user to:
 * - Preview their recording
 * - Retake if not satisfied
 * - Confirm and upload
 */
export function InterviewReview({
  videoUrl,
  videoBlob,
  recordingMode,
  onRetake,
  onConfirm,
  isUploading = false,
}: InterviewReviewProps) {
  const fileSizeMB = (videoBlob.size / (1024 * 1024)).toFixed(2)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Recording</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video/Audio Player */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            {recordingMode === 'video' ? (
              <video
                src={videoUrl}
                controls
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="text-center space-y-4">
                  <Play className="h-16 w-16 mx-auto text-white/50" />
                  <audio src={videoUrl} controls className="mx-auto" />
                  <p className="text-white/70 text-sm">Audio Recording</p>
                </div>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Recording size: {fileSizeMB} MB</span>
            <span>Format: {recordingMode === 'video' ? 'Video (WebM)' : 'Audio (WebM)'}</span>
          </div>

          {/* Instructions */}
          <Alert>
            <AlertDescription>
              Watch/listen to your recording. If you're happy with it, click "Upload" to continue. 
              Otherwise, you can retake it.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onRetake}
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={isUploading}
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              Retake
            </Button>
            <Button
              onClick={onConfirm}
              size="lg"
              className="flex-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Upload & Continue
                </>
              )}
            </Button>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Uploading your recording... This may take a moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <p className="font-medium text-sm">Before uploading, make sure:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>Your audio is clear and understandable</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>You answered the question completely</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">✓</span>
                <span>You're satisfied with your response</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
