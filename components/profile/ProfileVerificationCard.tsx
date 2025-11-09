'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Shield, User, CheckCircle, X } from 'lucide-react'
import { useProfileVerification, getVerificationMessage, UserRole } from '@/hooks/useProfileVerification'

interface ProfileVerificationCardProps {
  userRole: UserRole
  onCompleteProfile?: () => void
  onVerifyIdentity?: () => void
  onDismiss?: () => void
  showDismiss?: boolean
  compact?: boolean
  className?: string
}

export function ProfileVerificationCard({
  userRole,
  onCompleteProfile,
  onVerifyIdentity,
  onDismiss,
  showDismiss = false,
  compact = false,
  className = ''
}: ProfileVerificationCardProps) {
  const {
    needsProfileCompletion,
    needsIdVerification,
    idVerificationStatus,
    loading
  } = useProfileVerification(userRole)

  // Don't show anything if no verification is needed or still loading
  if (loading || (!needsProfileCompletion && !needsIdVerification)) {
    return null
  }

  const { title, description, actionText } = getVerificationMessage(
    needsProfileCompletion,
    needsIdVerification,
    userRole
  )

  const getStatusInfo = () => {
    if (needsProfileCompletion) {
      return {
        icon: User,
        color: 'amber',
        bgColor: 'bg-amber-50/10',
        borderColor: 'border-amber-500/50',
        textColor: 'text-amber-600',
        iconColor: 'text-amber-400'
      }
    }
    
    if (needsIdVerification) {
      const statusColors = {
        'not_verified': { color: 'blue', bgColor: 'bg-blue-50/10', borderColor: 'border-blue-500/50', textColor: 'text-blue-600', iconColor: 'text-blue-400' },
        'pending': { color: 'yellow', bgColor: 'bg-yellow-50/10', borderColor: 'border-yellow-500/50', textColor: 'text-yellow-600', iconColor: 'text-yellow-400' },
        'rejected': { color: 'red', bgColor: 'bg-red-50/10', borderColor: 'border-red-500/50', textColor: 'text-red-600', iconColor: 'text-red-400' },
        'verified': { color: 'green', bgColor: 'bg-green-50/10', borderColor: 'border-green-500/50', textColor: 'text-green-600', iconColor: 'text-green-400' }
      }
      
      return {
        icon: Shield,
        ...statusColors[idVerificationStatus]
      }
    }

    return {
      icon: AlertCircle,
      color: 'gray',
      bgColor: 'bg-gray-50/10',
      borderColor: 'border-gray-500/50',
      textColor: 'text-gray-600',
      iconColor: 'text-gray-400'
    }
  }

  const statusInfo = getStatusInfo()
  const IconComponent = statusInfo.icon

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} ${className}`}>
        <IconComponent className={`h-5 w-5 ${statusInfo.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${statusInfo.textColor} text-sm`}>{title}</p>
          {idVerificationStatus === 'pending' && (
            <Badge variant="outline" className="text-xs mt-1">
              Under Review
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {needsProfileCompletion && onCompleteProfile && (
            <Button size="sm" onClick={onCompleteProfile}>
              {actionText}
            </Button>
          )}
          {needsIdVerification && onVerifyIdentity && (
            <Button size="sm" onClick={onVerifyIdentity}>
              {actionText}
            </Button>
          )}
          {showDismiss && onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={`${statusInfo.borderColor} ${statusInfo.bgColor} ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className={`h-6 w-6 ${statusInfo.iconColor}`} />
            <div>
              <CardTitle className={statusInfo.textColor}>{title}</CardTitle>
              {idVerificationStatus === 'pending' && (
                <Badge variant="outline" className="mt-1">
                  Under Review
                </Badge>
              )}
              {idVerificationStatus === 'rejected' && (
                <Badge variant="outline" className="mt-1 border-red-400 text-red-400">
                  Please Retry
                </Badge>
              )}
            </div>
          </div>
          {showDismiss && onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription className={statusInfo.textColor}>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        {needsProfileCompletion && onCompleteProfile && (
          <Button onClick={onCompleteProfile}>
            <User className="mr-2 h-4 w-4" />
            {actionText}
          </Button>
        )}
        {needsIdVerification && onVerifyIdentity && (
          <Button onClick={onVerifyIdentity}>
            <Shield className="mr-2 h-4 w-4" />
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}