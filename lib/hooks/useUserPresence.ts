'use client'

import { useEffect, useState } from 'react'
import {
  setUserOnlineStatus,
  onUserPresenceChange,
} from '@/lib/firebase/chat'

interface UseUserPresenceOptions {
  userId: string
  enabled?: boolean
}

interface UseUserPresenceReturn {
  online: boolean
  lastSeen: number
}

/**
 * Hook to track user online/offline status
 */
export function useUserPresence({
  userId,
  enabled = true,
}: UseUserPresenceOptions): UseUserPresenceReturn {
  const [online, setOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(Date.now())

  useEffect(() => {
    if (!enabled || !userId) return

    const unsubscribe = onUserPresenceChange(userId, (isOnline, lastSeenTime) => {
      setOnline(isOnline)
      setLastSeen(lastSeenTime)
    })

    return () => unsubscribe()
  }, [userId, enabled])

  return { online, lastSeen }
}

/**
 * Hook to set current user's online status
 */
export function useSetUserPresence(userId: string | null) {
  useEffect(() => {
    if (!userId) return

    // Set user online when component mounts
    setUserOnlineStatus(userId, true)

    // Set user offline when component unmounts or page closes
    return () => {
      setUserOnlineStatus(userId, false)
    }
  }, [userId])

  // Handle page visibility changes
  useEffect(() => {
    if (!userId) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserOnlineStatus(userId, false)
      } else {
        setUserOnlineStatus(userId, true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [userId])

  // Handle beforeunload event
  useEffect(() => {
    if (!userId) return

    const handleBeforeUnload = () => {
      setUserOnlineStatus(userId, false)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [userId])
}
