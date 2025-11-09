'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  LandlordScoreBreakdown, 
  calculateLandlordScore,
  getBadgeInfo 
} from '@/lib/utils/landlord-score'
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Building,
  FileText,
  Shield,
  Star
} from 'lucide-react'

interface LandlordScoreCardProps {
  profileData: {
    name?: string
    age?: number
    description?: string
    idVerificationStatus?: 'not_verified' | 'pending' | 'verified' | 'rejected'
    properties?: any[]
  }
}

export function LandlordScoreCard({ profileData }: LandlordScoreCardProps) {
  const [score, setScore] = useState<LandlordScoreBreakdown | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadScore = async () => {
      setLoading(true)
      try {
        const calculatedScore = await calculateLandlordScore(profileData)
        setScore(calculatedScore)
      } catch (error) {
        console.error('Error calculating score:', error)
      } finally {
        setLoading(false)
      }
    }

    loadScore()
  }, [profileData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Landlord Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Calculating your score...</p>
        </CardContent>
      </Card>
    )
  }

  if (!score) return null

  const badgeInfo = getBadgeInfo(score.badge)

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Landlord Score
            </CardTitle>
            <CardDescription>
              Your profile quality and reputation score
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={`${badgeInfo.color} text-white text-lg px-4 py-2`}>
              {badgeInfo.icon} {badgeInfo.label}
            </Badge>
            <div className="text-3xl font-bold text-primary">
              {score.total}
              <span className="text-lg text-muted-foreground">/{score.maxPossible}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Score</span>
            <span className="text-muted-foreground">{score.percentage}%</span>
          </div>
          <Progress value={score.percentage} className="h-3" />
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Score Breakdown
          </h4>

          {/* Profile Completion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Profile Completion</span>
              </div>
              <span className="font-medium">{score.breakdown.profileCompletion}/30</span>
            </div>
            <Progress value={(score.breakdown.profileCompletion / 30) * 100} className="h-2" />
            <div className="flex flex-wrap gap-2 text-xs">
              <StatusBadge checked={score.details.hasName} label="Name" />
              <StatusBadge checked={score.details.hasAge} label="Age" />
              <StatusBadge checked={score.details.hasDescription} label="Description" />
            </div>
          </div>

          {/* Description Quality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Description Quality</span>
              </div>
              <span className="font-medium">{score.breakdown.descriptionQuality}/20</span>
            </div>
            <Progress value={(score.breakdown.descriptionQuality / 20) * 100} className="h-2" />
            <div className="flex flex-wrap gap-2 text-xs">
              <StatusBadge 
                checked={score.details.descriptionIsQuality} 
                label={score.details.descriptionIsQuality ? "Quality Content" : "Needs Improvement"} 
              />
            </div>
          </div>

          {/* ID Verification */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>ID Verification</span>
              </div>
              <span className="font-medium">{score.breakdown.idVerification}/30</span>
            </div>
            <Progress value={(score.breakdown.idVerification / 30) * 100} className="h-2" />
            <div className="flex flex-wrap gap-2 text-xs">
              <StatusBadge checked={score.details.hasIdCard} label="ID Submitted" />
              <StatusBadge checked={score.details.idCardVerified} label="Verified" />
            </div>
          </div>

          {/* Property Quality */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-500" />
                <span>Property Quality</span>
              </div>
              <span className="font-medium">{score.breakdown.propertyQuality}/20</span>
            </div>
            <Progress value={(score.breakdown.propertyQuality / 20) * 100} className="h-2" />
            <div className="flex flex-wrap gap-2 text-xs">
              <StatusBadge 
                checked={score.details.propertyCount > 0} 
                label={`${score.details.propertyCount} Properties`} 
              />
              {score.details.propertyCount > 0 && (
                <StatusBadge 
                  checked={score.details.averagePropertyScore >= 70} 
                  label={`Avg: ${score.details.averagePropertyScore}%`} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Tips to improve */}
        {score.percentage < 90 && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h5 className="font-semibold text-sm text-blue-900">Tips to Improve Your Score:</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              {!score.details.hasName && <li>• Complete your name</li>}
              {!score.details.hasAge && <li>• Add your age</li>}
              {!score.details.hasDescription && <li>• Write a detailed description</li>}
              {!score.details.descriptionIsQuality && <li>• Improve your description quality</li>}
              {!score.details.idCardVerified && <li>• Verify your ID card</li>}
              {score.details.propertyCount === 0 && <li>• Add your first property listing</li>}
              {score.details.averagePropertyScore < 70 && <li>• Improve your property listings with more details</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ checked, label }: { checked: boolean; label: string }) {
  return (
    <Badge variant={checked ? "default" : "outline"} className="text-xs">
      {checked ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {label}
    </Badge>
  )
}
