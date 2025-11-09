'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle, Circle } from 'lucide-react'

interface InterviewProgressProps {
  currentQuestion: number
  totalQuestions: number
  completedQuestions?: number[]
}

export function InterviewProgress({ 
  currentQuestion, 
  totalQuestions,
  completedQuestions = []
}: InterviewProgressProps) {
  const progressPercentage = (currentQuestion / totalQuestions) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            Question {currentQuestion} of {totalQuestions}
          </p>
          <p className="text-xs text-muted-foreground">
            {totalQuestions - currentQuestion} remaining
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {Math.round(progressPercentage)}%
          </p>
          <p className="text-xs text-muted-foreground">Complete</p>
        </div>
      </div>

      <Progress value={progressPercentage} className="h-2" />

      {/* Question indicators */}
      <div className="flex items-center justify-between gap-2">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const questionNumber = i + 1
          const isCompleted = completedQuestions.includes(questionNumber)
          const isCurrent = questionNumber === currentQuestion
          
          return (
            <div
              key={questionNumber}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <div
                className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                  ${isCompleted 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : isCurrent
                    ? 'bg-primary border-primary text-white'
                    : 'bg-background border-muted-foreground/30 text-muted-foreground'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-semibold">{questionNumber}</span>
                )}
              </div>
              <div
                className={`
                  h-1 w-full rounded-full transition-all
                  ${isCompleted 
                    ? 'bg-green-500' 
                    : isCurrent
                    ? 'bg-primary'
                    : 'bg-muted'
                  }
                `}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
