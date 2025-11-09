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
      <Card className="border border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Award className="h-5 w-5" />
            Your Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Calculating...</p>
        </CardContent>
      </Card>
    )
  }

  if (!score) return null

  const badgeInfo = getBadgeInfo(score.badge)

  return (
    <Card className="border border-gray-800 bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-white text-xl">
              Your Landlord Score
            </CardTitle>
            <CardDescription className="text-gray-400">
              Profile quality and reputation
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Badge className={`${badgeInfo.color} text-white`}>
              {badgeInfo.label}
            </Badge>
            <div className="text-3xl font-bold text-white">
              {score.total}
              <span className="text-lg text-gray-500">/{score.maxPossible}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Overall</span>
            <span>{score.percentage}%</span>
          </div>
          <Progress value={score.percentage} className="h-2" />
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <FileText className="h-4 w-4" />
              Profile
            </div>
            <p className="text-xl font-bold text-white">{score.breakdown.profileCompletion}/30</p>
            <Progress value={(score.breakdown.profileCompletion / 30) * 100} className="h-1 mt-2" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Star className="h-4 w-4" />
              Quality
            </div>
            <p className="text-xl font-bold text-white">{score.breakdown.descriptionQuality}/20</p>
            <Progress value={(score.breakdown.descriptionQuality / 20) * 100} className="h-1 mt-2" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Shield className="h-4 w-4" />
              ID Verified
            </div>
            <p className="text-xl font-bold text-white">{score.breakdown.idVerification}/30</p>
            <Progress value={(score.breakdown.idVerification / 30) * 100} className="h-1 mt-2" />
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Building className="h-4 w-4" />
              Properties
            </div>
            <p className="text-xl font-bold text-white">{score.breakdown.propertyQuality}/20</p>
            <Progress value={(score.breakdown.propertyQuality / 20) * 100} className="h-1 mt-2" />
          </div>
        </div>

        {/* Tips */}
        {score.percentage < 90 && (
          <div className="border border-gray-800 bg-gray-950 p-4 rounded-lg">
            <h5 className="font-medium text-sm text-white mb-2">Improve Your Score</h5>
            <ul className="text-xs text-gray-400 space-y-1">
              {!score.details.hasName && <li>• Complete your name</li>}
              {!score.details.hasAge && <li>• Add your age</li>}
              {!score.details.hasDescription && <li>• Write a description</li>}
              {!score.details.descriptionIsQuality && <li>• Improve description quality</li>}
              {!score.details.idCardVerified && <li>• Verify your ID</li>}
              {score.details.propertyCount === 0 && <li>• Add your first property</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


