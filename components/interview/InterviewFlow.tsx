'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InterviewProgress } from './InterviewProgress'
import { InterviewQuestionCard } from './InterviewQuestionCard'
import { InterviewRecorder } from './InterviewRecorder'
import { INTERVIEW_QUESTIONS, InterviewQuestionConfig } from '@/lib/firebase/types'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface InterviewFlowProps {
  interviewId: string
  onComplete: () => void
  onCancel?: () => void
}

interface RecordedAnswer {
  questionId: number
  blob: Blob
  url: string
}

export function InterviewFlow({ interviewId, onComplete, onCancel }: InterviewFlowProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [recordedAnswers, setRecordedAnswers] = useState<RecordedAnswer[]>([])
  const [recordingMode, setRecordingMode] = useState<'video' | 'audio'>('video')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = INTERVIEW_QUESTIONS[currentQuestionIndex]
  const totalQuestions = INTERVIEW_QUESTIONS.length
  const completedQuestions = recordedAnswers.map(a => a.questionId)
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const canGoNext = recordedAnswers.some(a => a.questionId === currentQuestion.id)
  const canGoPrevious = currentQuestionIndex > 0

  // Handle recording completion
  const handleRecordingComplete = (blob: Blob, url: string) => {
    const newAnswer: RecordedAnswer = {
      questionId: currentQuestion.id,
      blob,
      url
    }

    // Replace existing answer for this question or add new
    setRecordedAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id)
      return [...filtered, newAnswer]
    })
  }

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  // Submit interview
  const handleSubmit = async () => {
    if (recordedAnswers.length !== totalQuestions) {
      setError('Please answer all questions before submitting.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: Upload recordings to server
      // For now, just simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Call completion handler
      onComplete()
    } catch (err) {
      console.error('Error submitting interview:', err)
      setError('Failed to submit interview. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      recordedAnswers.forEach(answer => {
        URL.revokeObjectURL(answer.url)
      })
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>AI Interview</CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewProgress
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
            completedQuestions={completedQuestions}
          />
        </CardContent>
      </Card>

      {/* Recording Mode Selection (only show before first recording) */}
      {recordedAnswers.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="text-sm font-medium">Choose recording mode:</p>
              <div className="flex gap-3">
                <Button
                  variant={recordingMode === 'video' ? 'default' : 'outline'}
                  onClick={() => setRecordingMode('video')}
                  className="flex-1"
                >
                  Video Recording
                </Button>
                <Button
                  variant={recordingMode === 'audio' ? 'default' : 'outline'}
                  onClick={() => setRecordingMode('audio')}
                  className="flex-1"
                >
                  Audio Only
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You can record video or audio-only responses. This choice applies to all questions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Question */}
      <InterviewQuestionCard question={currentQuestion} />

      {/* Recorder */}
      <InterviewRecorder
        questionId={currentQuestion.id}
        questionText={currentQuestion.text}
        duration={currentQuestion.duration}
        recordingMode={recordingMode}
        onRecordingComplete={handleRecordingComplete}
        onNext={!isLastQuestion ? handleNext : undefined}
      />

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!canGoPrevious || isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {recordedAnswers.length} of {totalQuestions} answered
              </p>
            </div>

            {!isLastQuestion ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext || isSubmitting}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={recordedAnswers.length !== totalQuestions || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Interview
                  </>
                )}
              </Button>
            )}
          </div>

          {onCancel && (
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel Interview
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completion Status */}
      {recordedAnswers.length === totalQuestions && !isLastQuestion && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All questions answered! Navigate to the last question to submit your interview.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
