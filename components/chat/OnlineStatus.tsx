'use client'

import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useUserPresence } from '@/lib/hooks/useUserPresence'

interface OnlineStatusProps {
  userId: string
  showText?: boolean
  className?: string
}

export function OnlineStatus({ userId, showText = false, className }: OnlineStatusProps) {
  const { online, lastSeen } = useUserPresence({ userId })

  if (showText) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            online ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
        <span className="text-sm text-gray-600">
          {online
            ? 'Online'
            : `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-3 h-3 rounded-full border-2 border-white',
        online ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
      title={
        online
          ? 'Online'
          : `Last seen ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}`
      }
    />
  )
}
