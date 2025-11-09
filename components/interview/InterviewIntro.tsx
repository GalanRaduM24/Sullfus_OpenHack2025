'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Mic, Clock, CheckCircle } from 'lucide-react'

interface InterviewIntroProps {
  onStart: () => void
  isLoading?: boolean
}

export function InterviewIntro({ onStart, isLoading = false }: InterviewIntroProps) {
  return (
    <Card className="border-blue-500/50 bg-blue-50/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-6 w-6 text-blue-600" />
          Complete Your AI Interview
        </CardTitle>
        <CardDescription>
          Boost your Seriosity Score by completing a short video interview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our AI interview helps landlords understand you better and increases your chances of getting approved. 
            The interview takes about 5 minutes and can significantly improve your profile score.
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">What to expect:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">5 simple questions</p>
                  <p className="text-xs text-muted-foreground">
                    Answer questions about yourself, your budget, and your rental needs
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">15-30 seconds per question</p>
                  <p className="text-xs text-muted-foreground">
                    Each question has a time limit to keep responses concise
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Video className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Video or audio recording</p>
                  <p className="text-xs text-muted-foreground">
                    You can choose to record video or audio-only responses
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mic className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">One retake allowed</p>
                  <p className="text-xs text-muted-foreground">
                    You can preview and retake each answer before moving on
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Tip:</strong> Be honest and clear in your responses. Our AI analyzes clarity, 
              consistency, and completeness to calculate your score.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onStart} 
            disabled={isLoading}
            size="lg"
            className="flex-1"
          >
            {isLoading ? 'Starting...' : 'Start Interview'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
