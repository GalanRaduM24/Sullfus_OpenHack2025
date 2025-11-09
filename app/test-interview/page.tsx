'use client'

import { useState } from 'react'
import { InterviewIntro } from '@/VideoInterview/components/InterviewIntro'
import { InterviewRecorder } from '@/VideoInterview/components/InterviewRecorder'
import { InterviewReview } from '@/VideoInterview/components/InterviewReview'
import { InterviewProcessing } from '@/VideoInterview/components/InterviewProcessing'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Step = 'intro' | 'record' | 'review' | 'processing' | 'complete'

export default function TestInterviewPage() {
  const [step, setStep] = useState<Step>('intro')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)

  const handleStart = () => {
    setStep('record')
  }

  const handleRecordingComplete = (blob: Blob, url: string) => {
    setRecordedBlob(blob)
    setRecordedUrl(url)
    setStep('review')
  }

  const handleRetake = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setStep('record')
  }

  const handleConfirm = async () => {
    if (!recordedBlob) return

    setIsUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('video', recordedBlob, 'interview.webm')
      formData.append('tenant_id', 'demo_tenant_123')
      formData.append('interview_id', `demo_interview_${Date.now()}`)

      // Call the real API
      const response = await fetch('/api/interview/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      console.log('Interview processed:', result)

      // Store the real score
      if (result.score) {
        setFinalScore(result.score)
      }

      setIsUploading(false)
      setStep('processing')
    } catch (error) {
      console.error('Error uploading interview:', error)
      alert('Failed to upload interview. Please try again.')
      setIsUploading(false)
    }
  }

  const handleProcessingComplete = (score: number) => {
    // If we already have a real score from the API, use it
    if (finalScore === null) {
      setFinalScore(score)
    }
    setStep('complete')
  }

  const handleReset = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setFinalScore(null)
    setStep('intro')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Video Interview Demo</h1>
              <p className="text-muted-foreground">
                Test the new video interview system
              </p>
            </div>
            {step !== 'intro' && (
              <Button variant="outline" onClick={handleReset}>
                Reset Demo
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 text-sm">
            <StepIndicator label="Intro" active={step === 'intro'} completed={step !== 'intro'} />
            <div className="h-px flex-1 bg-gray-300" />
            <StepIndicator label="Record" active={step === 'record'} completed={['review', 'processing', 'complete'].includes(step)} />
            <div className="h-px flex-1 bg-gray-300" />
            <StepIndicator label="Review" active={step === 'review'} completed={['processing', 'complete'].includes(step)} />
            <div className="h-px flex-1 bg-gray-300" />
            <StepIndicator label="Processing" active={step === 'processing'} completed={step === 'complete'} />
            <div className="h-px flex-1 bg-gray-300" />
            <StepIndicator label="Complete" active={step === 'complete'} completed={false} />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {step === 'intro' && (
            <InterviewIntro
              onStart={handleStart}
              onSkip={() => alert('Skip functionality - would navigate to dashboard')}
            />
          )}

          {step === 'record' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Record Your Interview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Tell us about yourself and what you're looking for in a rental property.
                    Speak clearly and take your time. You'll have up to 2 minutes.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Mention your job, studies, or why you're looking for a place.
                      This helps landlords understand your situation better.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <InterviewRecorder
                onRecordingComplete={handleRecordingComplete}
                maxDuration={120}
                recordingMode="video"
              />
            </div>
          )}

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

          {step === 'processing' && (
            <InterviewProcessing
              interviewId="demo_interview_123"
              onComplete={handleProcessingComplete}
            />
          )}

          {step === 'complete' && finalScore !== null && (
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-6">
                    <div className="text-6xl">🎉</div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
                      <p className="text-muted-foreground">
                        Your interview has been processed successfully
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-8">
                      <p className="text-sm text-muted-foreground mb-2">Your Seriosity Score</p>
                      <div className="text-7xl font-bold text-primary mb-2">{finalScore}</div>
                      <p className="text-lg text-muted-foreground">out of 5</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <p className="text-green-800 font-medium mb-2">
                        {finalScore >= 4
                          ? '🎉 Excellent! Your interview shows strong commitment and professionalism.'
                          : finalScore >= 3
                          ? '⭐ Great! Your interview demonstrates good communication.'
                          : '✓ Good! Your interview is acceptable.'}
                      </p>
                      <p className="text-sm text-green-700">
                        You're now 5x more likely to get responses from landlords!
                      </p>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <Button onClick={handleReset} variant="outline" size="lg">
                        Try Again
                      </Button>
                      <Button onClick={() => window.location.href = '/tenant'} size="lg">
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Demo Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      This is a demo of the video interview system. In production:
                    </p>
                    <ul className="space-y-1 ml-4">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Video would be uploaded to Firebase Storage</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Audio would be transcribed using Gemini API</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Score would be calculated based on transcript analysis</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Tenant profile would be updated with results</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StepIndicator({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
          completed
            ? 'bg-green-600 text-white'
            : active
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {completed ? '✓' : active ? '●' : '○'}
      </div>
      <span className={`text-xs ${active || completed ? 'font-medium' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </div>
  )
}
