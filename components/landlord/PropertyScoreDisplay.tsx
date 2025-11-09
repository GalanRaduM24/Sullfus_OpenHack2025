'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  PropertyScoreBreakdown, 
  calculatePropertyScore 
} from '@/lib/utils/landlord-score'
import { 
  TrendingUp,
  Home,
  MapPin,
  Image as ImageIcon,
  Video,
  List,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface PropertyScoreDisplayProps {
  propertyData: {
    title?: string
    description?: string
    price?: number
    location?: {
      address?: string
      lat?: number
      lng?: number
    }
    area?: number
    floor?: number
    totalFloors?: number
    yearBuilt?: number
    images?: string[]
    videoUrl?: string
    amenities?: string[]
    bedrooms?: number
    bathrooms?: number
  }
}

export function PropertyScoreDisplay({ propertyData }: PropertyScoreDisplayProps) {
  const [score, setScore] = useState<PropertyScoreBreakdown | null>(null)

  useEffect(() => {
    const calculatedScore = calculatePropertyScore(propertyData)
    setScore(calculatedScore)
  }, [propertyData])

  if (!score) return null

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="border border-gray-800 bg-gray-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" />
              Property Quality Score
            </CardTitle>
            <CardDescription className="text-gray-400">
              Complete more fields to increase your score
            </CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(score.percentage)}`}>
              {score.total}
            </div>
            <div className="text-sm text-gray-500">/ {score.maxPossible} points</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-white">Overall Completion</span>
            <span className={`font-bold ${getScoreColor(score.percentage)}`}>
              {score.percentage}%
            </span>
          </div>
          <Progress value={score.percentage} className="h-3" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <ScoreStat 
            icon={<Home className="h-4 w-4" />}
            label="Basic Info"
            value={score.breakdown.basicInfo}
            max={25}
          />
          <ScoreStat 
            icon={<Home className="h-4 w-4" />}
            label="Details"
            value={score.breakdown.detailedInfo}
            max={25}
          />
          <ScoreStat 
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={score.breakdown.location}
            max={20}
          />
          <ScoreStat 
            icon={<ImageIcon className="h-4 w-4" />}
            label="Media"
            value={score.breakdown.media}
            max={20}
          />
          <ScoreStat 
            icon={<List className="h-4 w-4" />}
            label="Amenities"
            value={score.breakdown.amenities}
            max={10}
          />
        </div>

        {/* Detailed Checklist */}
        <div className="space-y-2 pt-2 border-t border-gray-800">
          <h4 className="font-semibold text-sm text-white">Checklist:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <CheckItem checked={score.details.hasTitle} label="Title" />
            <CheckItem checked={score.details.hasDescription} label="Description (50+ chars)" />
            <CheckItem checked={score.details.hasPrice} label="Price" />
            <CheckItem checked={score.details.hasLocation} label="Address" />
            <CheckItem checked={score.details.hasAreaDetails} label="Area (m²)" />
            <CheckItem checked={score.details.hasFloorInfo} label="Floor Info" />
            <CheckItem checked={score.details.hasYearBuilt} label="Year Built" />
            <CheckItem 
              checked={score.details.hasImages > 0} 
              label={`Images (${score.details.hasImages}/5)`} 
            />
            <CheckItem checked={score.details.hasVideo} label="Video" />
            <CheckItem 
              checked={score.details.amenityCount > 0} 
              label={`Amenities (${score.details.amenityCount})`} 
            />
          </div>
        </div>

        {/* Tips */}
        {score.percentage < 100 && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg space-y-1">
            <h5 className="font-semibold text-xs text-blue-400">🎯 Quick Tips:</h5>
            <ul className="text-xs text-gray-300 space-y-1">
              {!score.details.hasVideo && <li>• Add a video tour to get +5 points!</li>}
              {score.details.hasImages < 5 && <li>• Add more images (each image: +3 points)</li>}
              {!score.details.hasYearBuilt && <li>• Add year built to get +5 points</li>}
              {score.details.amenityCount < 5 && <li>• Add more amenities (each: +2 points)</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ScoreStat({ icon, label, value, max }: { 
  icon: React.ReactNode
  label: string
  value: number
  max: number
}) {
  const percentage = (value / max) * 100
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex flex-col items-center p-2 bg-gray-800 rounded-lg border border-gray-700">
      <div className="text-gray-400 mb-1">{icon}</div>
      <div className="font-bold text-sm text-white">{value}/{max}</div>
      <div className="text-[10px] text-center text-gray-400">{label}</div>
      <div className="w-full h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
        <div className={`h-full ${getColor()}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1">
      {checked ? (
        <CheckCircle className="h-3 w-3 text-green-400" />
      ) : (
        <XCircle className="h-3 w-3 text-gray-600" />
      )}
      <span className={checked ? 'text-green-400' : 'text-gray-500'}>{label}</span>
    </div>
  )
}
