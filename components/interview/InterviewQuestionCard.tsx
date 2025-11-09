'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, HelpCircle } from 'lucide-react'
import { InterviewQuestionConfig } from '@/lib/firebase/types'

interface InterviewQuestionCardProps {
  question: InterviewQuestionConfig
  timeRemaining?: number
  showTimer?: boolean
}

export function InterviewQuestionCard({ 
  question, 
  timeRemaining,
  showTimer = false 
}: InterviewQuestionCardProps) {
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'open':
        return 'Open-ended'
      case 'factual':
        return 'Factual'
      case 'yes_no_brief':
        return 'Yes/No with brief explanation'
      case 'tags':
        return 'Tags/Keywords'
      case 'yes_no':
        return 'Yes/No'
      default:
        return 'Question'
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'open':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20'
      case 'factual':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20'
      case 'yes_no_brief':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20'
      case 'tags':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20'
      case 'yes_no':
        return 'text-pink-600 bg-pink-50 dark:bg-pink-950/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950/20'
    }
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getQuestionTypeColor(question.type)}`}>
                {getQuestionTypeLabel(question.type)}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {question.duration}s
              </span>
            </div>
            <CardTitle className="text-2xl leading-tight">
              Question {question.id}
            </CardTitle>
          </div>
          
          {showTimer && timeRemaining !== undefined && (
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground mb-1">Time left</span>
              <div className={`
                text-3xl font-bold tabular-nums
                ${timeRemaining <= 5 ? 'text-red-600 animate-pulse' : 'text-primary'}
              `}>
                {timeRemaining}s
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-6">
            <p className="text-xl font-medium leading-relaxed">
              {question.text}
            </p>
          </div>

          {/* Question tips based on type */}
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <HelpCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              {question.type === 'open' && (
                <p>Take your time to introduce yourself and explain your situation clearly.</p>
              )}
              {question.type === 'factual' && (
                <p>Provide specific details like dates and numbers.</p>
              )}
              {question.type === 'yes_no_brief' && (
                <p>Answer yes or no, then briefly explain your answer.</p>
              )}
              {question.type === 'tags' && (
                <p>List any relevant items or requirements you have.</p>
              )}
              {question.type === 'yes_no' && (
                <p>A simple yes or no answer is sufficient.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
