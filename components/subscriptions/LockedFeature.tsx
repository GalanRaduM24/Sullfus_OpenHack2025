'use client'

import { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LockedFeatureProps {
  locked: boolean
  children: ReactNode
  blurAmount?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function LockedFeature({ 
  locked, 
  children, 
  blurAmount = 'md',
  showIcon = true,
  className 
}: LockedFeatureProps) {
  if (!locked) {
    return <>{children}</>
  }

  const blurClass = {
    sm: 'blur-[2px]',
    md: 'blur-[4px]',
    lg: 'blur-[8px]'
  }[blurAmount]

  return (
    <div className={cn("relative", className)}>
      <div className={cn("pointer-events-none select-none", blurClass)}>
        {children}
      </div>
      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full border-2 border-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  )
}
