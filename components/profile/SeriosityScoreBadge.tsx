'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, Info } from 'lucide-react'
import { SeriosityBreakdown } from '@/lib/firebase/types'

interface SeriosityScoreBadgeProps {
  score: number
  breakdown?: SeriosityBreakdown
  showBreakdown?: boolean
  onShowDetails?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function SeriosityScoreBadge({
  score,
  breakdown,
  showBreakdown = false,
  onShowDetails,
  size = 'md'
}: SeriosityScoreBadgeProps) {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 hover:bg-green-600 text-white'
    if (score >= 60) return 'bg-blue-500 hover:bg-blue-600 text-white'
    if (score >= 40) return 'bg-yellow-500 hover:bg-yellow-600 text-white'
    return 'bg-orange-500 hover:bg-orange-600 text-white'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={`${getScoreColor(score)} ${sizeClasses[size]} font-semibold cursor-default`}
      >
        <Shield className={`${iconSizes[size]} mr-1.5`} />
        Seriosity Score: {score}/100
      </Badge>
      
      <span className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
        ({getScoreLabel(score)})
      </span>

      {showBreakdown && onShowDetails && (
        <button
          onClick={onShowDetails}
          className="text-blue-600 hover:text-blue-700 transition-colors"
          aria-label="Show score breakdown"
        >
          <Info className={iconSizes[size]} />
        </button>
      )}
    </div>
  )
}
