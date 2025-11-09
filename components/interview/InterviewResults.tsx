'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, TrendingUp, FileText, Award } from 'lucide-react';
import { getScoreColor, getScoreDescription, getBreakdownExplanations } from '@/lib/utils/seriosity-score';
import type { SeriosityBreakdown } from '@/lib/firebase/types';

interface InterviewResultsProps {
  score: number;
  breakdown: SeriosityBreakdown;
  onClose?: () => void;
}

export function InterviewResults({ score, breakdown, onClose }: InterviewResultsProps) {
  const scoreColor = getScoreColor(score);
  const scoreDescription = getScoreDescription(score);
  const explanations = getBreakdownExplanations();

  // Calculate percentage for each component
  const maxScores = {
    id_verified: 15,
    income_proof: 25,
    interview_clarity: 20,
    response_consistency: 15,
    responsiveness: 15,
    references: 10,
  };

  return (
    <div className="space-y-6">
      {/* Header with Score */}
      <Card className="border-2">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl">Interview Complete!</CardTitle>
          <CardDescription>Your Seriosity Score has been calculated</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <div className={`text-6xl font-bold text-${scoreColor}-600 mb-2`}>
              {score}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <Badge
              variant={score >= 75 ? 'default' : score >= 45 ? 'secondary' : 'destructive'}
              className="text-sm px-4 py-1"
            >
              {scoreDescription}
            </Badge>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Your profile has been updated with your new score</span>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Score Breakdown
          </CardTitle>
          <CardDescription>See how your score was calculated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(breakdown).map(([key, value]) => {
            const componentKey = key as keyof SeriosityBreakdown;
            const maxScore = maxScores[componentKey];
            const percentage = (value / maxScore) * 100;

            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {explanations[componentKey].split(':')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {explanations[componentKey].split(':')[1]}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className="text-sm font-bold">
                      {value}/{maxScore}
                    </span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* What This Means */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            What This Means
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">For Landlords:</h4>
            <p className="text-sm text-muted-foreground">
              Your Seriosity Score helps landlords assess your reliability as a tenant. A higher
              score increases your chances of being approved for properties.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">How to Improve:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {breakdown.id_verified === 0 && (
                <li>Complete ID verification (+15 points)</li>
              )}
              {breakdown.income_proof < 25 && (
                <li>Upload and verify income proof documents (+{25 - breakdown.income_proof} points)</li>
              )}
              {breakdown.references < 10 && (
                <li>Add reference documents (+{10 - breakdown.references} points)</li>
              )}
              {breakdown.interview_clarity < 20 && (
                <li>Provide clear and detailed responses in future interviews</li>
              )}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Next Steps:</h4>
            <p className="text-sm text-muted-foreground">
              Start browsing properties and apply to ones that match your preferences. Landlords
              with Pro subscriptions can see your Seriosity Score and detailed breakdown.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      {onClose && (
        <div className="flex justify-center">
          <Button onClick={onClose} size="lg" className="w-full sm:w-auto">
            Continue to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
