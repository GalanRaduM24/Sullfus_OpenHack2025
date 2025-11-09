'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, XCircle, Brain, FileAudio, BarChart3 } from 'lucide-react';
import { useInterviewStatus } from '@/lib/hooks/useInterviewStatus';
import { InterviewResults } from './InterviewResults';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InterviewProcessingProps {
  interviewId: string;
  onComplete?: () => void;
}

export function InterviewProcessing({ interviewId, onComplete }: InterviewProcessingProps) {
  const { status, loading, error, isDone, isFailed, isProcessing } = useInterviewStatus({
    interviewId,
    enabled: true,
    pollInterval: 3000,
    onComplete: () => {
      // Optionally call onComplete callback after a delay to show results
      if (onComplete) {
        setTimeout(onComplete, 5000);
      }
    },
  });

  // Show results if interview is done
  if (isDone && status?.score !== undefined && status?.breakdown) {
    return (
      <InterviewResults
        score={status.score}
        breakdown={status.breakdown}
        onClose={onComplete}
      />
    );
  }

  // Show error if interview failed
  if (isFailed) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Processing Failed</AlertTitle>
        <AlertDescription>
          {status?.error_message || error?.message || 'An error occurred while processing your interview. Please try again or contact support.'}
        </AlertDescription>
      </Alert>
    );
  }

  // Show processing status
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
        <CardTitle className="text-2xl">Processing Your Interview</CardTitle>
        <CardDescription>
          Our AI is analyzing your responses. This usually takes 30-60 seconds.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          <ProcessingStep
            icon={<FileAudio className="h-5 w-5" />}
            title="Transcribing Audio"
            description="Converting your voice responses to text"
            completed={isProcessing}
            active={isProcessing}
          />
          <ProcessingStep
            icon={<Brain className="h-5 w-5" />}
            title="Analyzing Responses"
            description="AI is evaluating clarity and consistency"
            completed={false}
            active={isProcessing}
          />
          <ProcessingStep
            icon={<BarChart3 className="h-5 w-5" />}
            title="Calculating Score"
            description="Computing your Seriosity Score"
            completed={false}
            active={isProcessing}
          />
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={isProcessing ? 50 : 0} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            Please don't close this page...
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium text-sm mb-2">What happens next?</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Your responses are transcribed using AI</li>
            <li>We analyze clarity, consistency, and completeness</li>
            <li>Your Seriosity Score is calculated and added to your profile</li>
            <li>Landlords can see your verified score when you apply</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProcessingStepProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

function ProcessingStep({ icon, title, description, completed, active }: ProcessingStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          completed
            ? 'bg-green-100 text-green-600'
            : active
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {completed ? <CheckCircle2 className="h-5 w-5" /> : icon}
      </div>
      <div className="flex-1 pt-1">
        <h4 className={`font-medium text-sm ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
          {title}
        </h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
