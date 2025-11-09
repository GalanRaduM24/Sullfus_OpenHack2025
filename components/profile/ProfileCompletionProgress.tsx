'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { TenantProfile } from '@/lib/firebase/users'

interface ProfileCompletionProgressProps {
  profile: Partial<TenantProfile>
}

interface CompletionItem {
  id: string
  label: string
  description: string
  completed: boolean
  required: boolean
  points: number
}

export function ProfileCompletionProgress({ profile }: ProfileCompletionProgressProps) {
  // Define completion items
  const items: CompletionItem[] = [
    {
      id: 'basic_info',
      label: 'Basic Information',
      description: 'Name, age, occupation, and budget',
      completed: !!(
        profile.name &&
        profile.age &&
        profile.occupation &&
        profile.budgetMin !== undefined &&
        profile.budgetMax !== undefined
      ),
      required: true,
      points: 0, // No points, but required
    },
    {
      id: 'id_verification',
      label: 'ID Verification',
      description: 'Upload and verify your ID document',
      completed: profile.idVerificationStatus === 'verified',
      required: false,
      points: 15,
    },
    {
      id: 'income_proof',
      label: 'Income Proof',
      description: 'Upload employment or income documents',
      completed: !!(profile.documents?.income_proof && profile.documents.income_proof.length > 0),
      required: false,
      points: 25,
    },
    {
      id: 'interview',
      label: 'AI Interview',
      description: 'Complete the video/audio interview',
      completed: profile.interviewCompleted === true,
      required: false,
      points: 35, // clarity + consistency
    },
    {
      id: 'references',
      label: 'References',
      description: 'Upload reference letters',
      completed: !!(profile.documents?.references && profile.documents.references.length > 0),
      required: false,
      points: 10,
    },
  ]

  // Calculate completion percentage
  const totalItems = items.length
  const completedItems = items.filter(item => item.completed).length
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  // Calculate required items
  const requiredItems = items.filter(item => item.required)
  const completedRequiredItems = requiredItems.filter(item => item.completed)
  const requiredComplete = completedRequiredItems.length === requiredItems.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>
              Complete your profile to improve your chances with landlords
            </CardDescription>
          </div>
          <Badge
            variant={requiredComplete ? 'default' : 'secondary'}
            className="text-lg px-4 py-2"
          >
            {completionPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground">
            {completedItems} of {totalItems} items completed
          </p>
        </div>

        {/* Required Items Alert */}
        {!requiredComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                Complete required items to activate your profile
              </p>
              <p className="text-sm text-amber-700 mt-1">
                You need to complete basic information before you can browse properties.
              </p>
            </div>
          </div>
        )}

        {/* Completion Items List */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                item.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{item.label}</h4>
                  {item.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                  {!item.required && item.points > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.points} pts
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Score Info */}
        {requiredComplete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Tip:</strong> Complete optional items to increase your Seriosity Score
              and stand out to landlords. A higher score means better chances of approval!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
