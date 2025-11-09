'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  propertyId: string
  tenantId: string
  isLiked: boolean
  onLikeToggle?: (propertyId: string, isLiked: boolean) => void
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
  disabled?: boolean
  className?: string
}

export function LikeButton({
  propertyId,
  tenantId,
  isLiked,
  onLikeToggle,
  variant = 'default',
  size = 'default',
  showText = true,
  disabled = false,
  className
}: LikeButtonProps) {
  const [loading, setLoading] = useState(false)
  const [liked, setLiked] = useState(isLiked)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click events
    
    if (loading || disabled) return

    setLoading(true)
    const newLikedState = !liked

    try {
      if (newLikedState) {
        // Like the property
        const response = await fetch(`/api/properties/${propertyId}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: tenantId })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to like property')
        }

        setLiked(true)
        onLikeToggle?.(propertyId, true)
      } else {
        // Unlike the property
        const response = await fetch(`/api/properties/${propertyId}/like`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenant_id: tenantId })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to unlike property')
        }

        setLiked(false)
        onLikeToggle?.(propertyId, false)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert the optimistic update on error
      setLiked(liked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={liked ? 'secondary' : variant}
      size={size}
      onClick={handleClick}
      disabled={loading || disabled}
      className={cn(
        'transition-all',
        liked && 'border-red-500/50 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900',
        className
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4',
          showText && 'mr-2',
          liked && 'fill-red-500 text-red-500',
          loading && 'animate-pulse'
        )}
      />
      {showText && (liked ? 'Liked' : 'Like')}
    </Button>
  )
}
