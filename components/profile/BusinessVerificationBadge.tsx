'use client'

import { CheckCircle2, Clock, XCircle, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BusinessVerificationBadgeProps {
  verified: boolean
  status?: 'not_verified' | 'pending' | 'verified' | 'rejected'
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function BusinessVerificationBadge({ 
  verified, 
  status = 'not_verified',
  showLabel = true,
  size = 'md'
}: BusinessVerificationBadgeProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const iconSize = sizeClasses[size]

  if (status === 'verified' || verified) {
    return (
      <Badge 
        variant="outline" 
        className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
      >
        <CheckCircle2 className={`${iconSize} mr-1`} />
        {showLabel && 'Business Verified'}
      </Badge>
    )
  }

  if (status === 'pending') {
    return (
      <Badge 
        variant="outline" 
        className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
      >
        <Clock className={`${iconSize} mr-1`} />
        {showLabel && 'Verification Pending'}
      </Badge>
    )
  }

  if (status === 'rejected') {
    return (
      <Badge 
        variant="outline" 
        className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
      >
        <XCircle className={`${iconSize} mr-1`} />
        {showLabel && 'Verification Rejected'}
      </Badge>
    )
  }

  return (
    <Badge 
      variant="outline" 
      className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
    >
      <Shield className={`${iconSize} mr-1`} />
      {showLabel && 'Not Verified'}
    </Badge>
  )
}
