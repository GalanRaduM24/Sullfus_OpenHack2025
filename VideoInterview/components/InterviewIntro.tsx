'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, TrendingUp, MessageCircle, CheckCircle, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface InterviewIntroProps {
  onStart: () => void
  onSkip?: () => void
}

/**
 * Interview Introduction Screen
 * 
 * Explains the purpose and benefits of completing the video interview.
 * Key message: This builds trust and increases response rate by 5x.
 */
export function InterviewIntro({ onStart, onSkip }: InterviewIntroProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Complete Your Video Interview</CardTitle>
              <CardDescription className="text-base mt-1">
                Stand out and get 5x more responses from landlords
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Why complete the interview?</h3>
            
            <div className="grid gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">5x More Responses</p>
                  <p className="text-sm text-muted-foreground">
                    Tenants with completed interviews receive significantly more responses from landlords
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Build Trust</p>
                  <p className="text-sm text-muted-foreground">
                    Show landlords you're a serious, reliable tenant before they even meet you
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Stand Out</p>
                  <p className="text-sm text-muted-foreground">
                    Most tenants skip this step. Completing it puts you ahead of the competition
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What to Expect */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">What to expect</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Simple questions about yourself and what you're looking for</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Takes about 2-3 minutes to complete</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>You can review and re-record before submitting</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Your responses are analyzed to create your Seriosity Score</span>
              </li>
            </ul>
          </div>

          {/* Important Note */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>This is not a test!</strong> We're just helping landlords get to know you better. 
              Be yourself and answer honestly.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={onStart} size="lg" className="flex-1">
              <Video className="mr-2 h-5 w-5" />
              Start Interview
            </Button>
            {onSkip && (
              <Button onClick={onSkip} size="lg" variant="outline">
                Skip for Now
              </Button>
            )}
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-center text-muted-foreground">
            Your interview is private and only shared with landlords when you apply to their properties.
          </p>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tips for a great interview</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Find a quiet place with good lighting</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Speak clearly and take your time</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Mention your job, studies, or why you're looking for a place</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Be positive and professional</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>Give detailed answers (not just "yes" or "no")</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
