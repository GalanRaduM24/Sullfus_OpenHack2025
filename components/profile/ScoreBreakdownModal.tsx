'use client'

import { SeriosityBreakdown } from '@/lib/firebase/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Shield, FileText, Mic, CheckCircle, Clock, Users } from 'lucide-react'

interface ScoreBreakdownModalProps {
  isOpen: boolean
  onClose: () => void
  score: number
  breakdown: SeriosityBreakdown
}

export function ScoreBreakdownModal({
  isOpen,
  onClose,
  score,
  breakdown
}: ScoreBreakdownModalProps) {
  const components = [
    {
      name: 'ID Verification',
      value: breakdown.id_verified,
      max: 15,
      icon: Shield,
      description: 'Identity document verified',
      color: 'text-green-600'
    },
    {
      name: 'Income Proof',
      value: breakdown.income_proof,
      max: 25,
      icon: FileText,
      description: 'Employment and income documentation',
      color: 'text-blue-600'
    },
    {
      name: 'Interview Clarity',
      value: breakdown.interview_clarity,
      max: 20,
      icon: Mic,
      description: 'Clear and complete interview responses',
      color: 'text-purple-600'
    },
    {
      name: 'Response Consistency',
      value: breakdown.response_consistency,
      max: 15,
      icon: CheckCircle,
      description: 'Consistent information across profile',
      color: 'text-indigo-600'
    },
    {
      name: 'Responsiveness',
      value: breakdown.responsiveness,
      max: 15,
      icon: Clock,
      description: 'Quick response to messages',
      color: 'text-orange-600'
    },
    {
      name: 'References',
      value: breakdown.references,
      max: 10,
      icon: Users,
      description: 'Verified references provided',
      color: 'text-teal-600'
    }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Seriosity Score Breakdown</DialogTitle>
          <DialogDescription>
            Detailed breakdown of how the Seriosity Score is calculated
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Total Score */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Total Score</h3>
              <span className="text-3xl font-bold text-blue-600">{score}/100</span>
            </div>
            <Progress value={score} className="h-3" />
          </div>

          {/* Component Breakdown */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Score Components</h4>
            {components.map((component) => {
              const Icon = component.icon
              const percentage = (component.value / component.max) * 100

              return (
                <div key={component.name} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`h-5 w-5 mt-0.5 ${component.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{component.name}</h5>
                          <span className="text-sm font-semibold">
                            {component.value}/{component.max} pts
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {component.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h5 className="font-semibold text-sm mb-2">How to improve your score:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              {breakdown.id_verified < 15 && (
                <li>• Complete ID verification to earn 15 points</li>
              )}
              {breakdown.income_proof < 25 && (
                <li>• Upload income proof documents to earn up to 25 points</li>
              )}
              {breakdown.interview_clarity < 20 && (
                <li>• Complete the AI interview with clear responses</li>
              )}
              {breakdown.references < 10 && (
                <li>• Add references to earn up to 10 points</li>
              )}
              {breakdown.responsiveness < 15 && (
                <li>• Respond quickly to landlord messages</li>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
