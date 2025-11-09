'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, TrendingUp, FileText, Sparkles } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface InterviewProcessingProps {
  interviewId: string
  onComplete?: (score: number) => void
}

type ProcessingStep = 'uploading' | 'transcribing' | 'analyzing' | 'scoring' | 'complete'

/**
 * Interview Processing Component
 * 
 * Shows a loading screen while the interview is being processed:
 * 1. Upload complete
 * 2. Transcribing audio
 * 3. Analyzing responses
 * 4. Calculating Seriosity Score
 * 5. Complete!
 */
export function InterviewProcessing({ interviewId, onComplete }: InterviewProcessingProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('uploading')
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState<number | null>(null)

  // Simulate processing steps
  useEffect(() => {
    const steps: ProcessingStep[] = ['uploading', 'transcribing', 'analyzing', 'scoring', 'complete']
    let stepIndex = 0

    const interval = setInterval(() => {
      stepIndex++
      if (stepIndex < steps.length) {
        setCurrentStep(steps[stepIndex])
        setProgress((stepIndex / (steps.length - 1)) * 100)
      } else {
        clearInterval(interval)
        // Simulate score (in real app, this comes from API)
        const mockScore = Math.floor(Math.random() * 2) + 4 // 4 or 5
        setScore(mockScore)
        if (onComplete) {
          onComplete(mockScore)
        }
      }
    }, 2000) // 2 seconds per step

    return () => clearInterval(interval)
  }, [interviewId, onComplete])

  const getStepInfo = (step: ProcessingStep) => {
    switch (step) {
      case 'uploading':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin" />,
          title: 'Uploading your recording',
          description: 'Securely uploading your interview to our servers...',
        }
      case 'transcribing':
        return {
          icon: <FileText className="h-8 w-8 animate-pulse" />,
          title: 'Transcribing audio',
          description: 'Converting your speech to text using AI...',
        }
      case 'analyzing':
        return {
          icon: <Sparkles className="h-8 w-8 animate-pulse" />,
          title: 'Analyzing your responses',
          description: 'Evaluating content quality and completeness...',
        }
      case 'scoring':
        return {
          icon: <TrendingUp className="h-8 w-8 animate-pulse" />,
          title: 'Calculating your Seriosity Score',
          description: 'Determining your tenant reliability score...',
        }
      case 'complete':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-600" />,
          title: 'Processing complete!',
          description: 'Your interview has been successfully processed.',
        }
    }
  }

  const stepInfo = getStepInfo(currentStep)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Processing Your Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Current Step */}
          <div className="text-center space-y-4">
            <div className="flex justify-center text-primary">
              {stepInfo.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{stepInfo.title}</h3>
              <p className="text-muted-foreground">{stepInfo.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Processing Steps Checklist */}
          <div className="space-y-3">
            <ProcessingStepItem
              label="Upload recording"
              isComplete={currentStep !== 'uploading'}
              isCurrent={currentStep === 'uploading'}
            />
            <ProcessingStepItem
              label="Transcribe audio"
              isComplete={['analyzing', 'scoring', 'complete'].includes(currentStep)}
              isCurrent={currentStep === 'transcribing'}
            />
            <ProcessingStepItem
              label="Analyze responses"
              isComplete={['scoring', 'complete'].includes(currentStep)}
              isCurrent={currentStep === 'analyzing'}
            />
            <ProcessingStepItem
              label="Calculate score"
              isComplete={currentStep === 'complete'}
              isCurrent={currentStep === 'scoring'}
            />
          </div>

          {/* Score Display (when complete) */}
          {currentStep === 'complete' && score !== null && (
            <div className="text-center space-y-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Seriosity Score</p>
                <div className="text-6xl font-bold text-primary">{score}</div>
                <p className="text-sm text-muted-foreground mt-2">out of 5</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  {score >= 4
                    ? '🎉 Excellent! Your interview shows strong commitment and professionalism.'
                    : 'Great job! Your interview demonstrates good communication.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      {currentStep !== 'complete' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="font-medium text-sm">What happens next?</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Your interview will be analyzed using AI</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>You'll receive a Seriosity Score (1-5)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Landlords will see your score when you apply</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Higher scores = 5x more responses!</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * Processing Step Item Component
 */
function ProcessingStepItem({
  label,
  isComplete,
  isCurrent,
}: {
  label: string
  isComplete: boolean
  isCurrent: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          isComplete
            ? 'bg-green-600 text-white'
            : isCurrent
            ? 'bg-primary text-white'
            : 'bg-gray-200 text-gray-400'
        }`}
      >
        {isComplete ? (
          <CheckCircle className="h-4 w-4" />
        ) : isCurrent ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-current" />
        )}
      </div>
      <span
        className={`text-sm ${
          isComplete || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
