/**
 * Example Integration of Video Interview System
 * 
 * This file shows how to integrate the video interview components
 * into your tenant dashboard or onboarding flow.
 */

'use client'

import { useState } from 'react'
import { InterviewIntro } from './components/InterviewIntro'
import { InterviewRecorder } from './components/InterviewRecorder'
import { InterviewReview } from './components/InterviewReview'
import { InterviewProcessing } from './components/InterviewProcessing'
import { useAuth } from '@/contexts/AuthContext'

type InterviewStep = 'intro' | 'record' | 'review' | 'processing' | 'complete'

export function VideoInterviewFlow() {
  const { user } = useAuth()
  const [step, setStep] = useState<InterviewStep>('intro')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [interviewId, setInterviewId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)

  /**
   * Step 1: Start interview
   */
  const handleStart = () => {
    // Generate interview ID
    const newInterviewId = `interview_${user?.uid}_${Date.now()}`
    setInterviewId(newInterviewId)
    setStep('record')
  }

  /**
   * Step 2: Recording complete
   */
  const handleRecordingComplete = (blob: Blob, url: string) => {
    setRecordedBlob(blob)
    setRecordedUrl(url)
    setStep('review')
  }

  /**
   * Step 3: Retake recording
   */
  const handleRetake = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setStep('record')
  }

  /**
   * Step 4: Confirm and upload
   */
  const handleConfirm = async () => {
    if (!recordedBlob || !user) return

    setIsUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('video', recordedBlob, 'interview.webm')
      formData.append('tenant_id', user.uid)
      formData.append('interview_id', interviewId)

      // Upload to API
      const response = await fetch('/api/interview/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      console.log('Interview uploaded successfully:', result)

      // Move to processing screen
      setStep('processing')
    } catch (error) {
      console.error('Error uploading interview:', error)
      alert('Failed to upload interview. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Step 5: Processing complete
   */
  const handleProcessingComplete = (score: number) => {
    setFinalScore(score)
    setStep('complete')
  }

  /**
   * Skip interview
   */
  const handleSkip = () => {
    // Navigate back to dashboard or next step
    console.log('Interview skipped')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Step 1: Introduction */}
      {step === 'intro' && (
        <InterviewIntro
          onStart={handleStart}
          onSkip={handleSkip}
        />
      )}

      {/* Step 2: Recording */}
      {step === 'record' && (
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Record Your Interview</h2>
            <p className="text-muted-foreground">
              Tell us about yourself and what you're looking for in a rental property.
            </p>
          </div>
          <InterviewRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={120} // 2 minutes
            recordingMode="video"
          />
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && recordedBlob && recordedUrl && (
        <InterviewReview
          videoUrl={recordedUrl}
          videoBlob={recordedBlob}
          recordingMode="video"
          onRetake={handleRetake}
          onConfirm={handleConfirm}
          isUploading={isUploading}
        />
      )}

      {/* Step 4: Processing */}
      {step === 'processing' && (
        <InterviewProcessing
          interviewId={interviewId}
          onComplete={handleProcessingComplete}
        />
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && finalScore !== null && (
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold">Interview Complete!</h2>
          <p className="text-lg text-muted-foreground">
            Your Seriosity Score: <span className="text-4xl font-bold text-primary">{finalScore}/5</span>
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-green-800">
              Great job! Your interview has been processed and your profile is now complete.
              You're now 5x more likely to get responses from landlords!
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/tenant'}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Alternative: Simplified Integration
 * 
 * If you just want to add the interview to an existing page:
 */
export function SimpleInterviewButton() {
  const [showInterview, setShowInterview] = useState(false)

  if (!showInterview) {
    return (
      <button
        onClick={() => setShowInterview(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        Complete Video Interview (5x More Responses!)
      </button>
    )
  }

  return <VideoInterviewFlow />
}

/**
 * Backend Usage Example
 * 
 * How to use the evaluation function in your backend:
 */

/*
import { evaluateInterview } from './VideoInterview/lib/evaluateInterview'

// Example 1: Evaluate from file path
const result = await evaluateInterview('/path/to/video.webm')
console.log('Score:', result.score)
console.log('Transcript:', result.transcript)

// Example 2: Evaluate from buffer (API route)
import { evaluateInterviewBuffer } from './VideoInterview/lib/evaluateInterview'

const videoBuffer = Buffer.from(await file.arrayBuffer())
const result = await evaluateInterviewBuffer(videoBuffer, 'video/webm')

// Example 3: Get landlord-safe version (no flags/suggestions)
import { evaluateInterviewForLandlord } from './VideoInterview/lib/evaluateInterview'

const landlordResult = await evaluateInterviewForLandlord('/path/to/video.webm')
// This excludes sensitive tenant-only information
*/
