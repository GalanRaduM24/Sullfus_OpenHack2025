'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  onMessagesChange,
  onTypingStatusChange,
  onLastMessageChange,
  sendRealtimeMessage,
  setTypingStatus,
  markAllMessagesAsRead,
  getUnreadCount,
  type RealtimeMessage,
  type RealtimeTypingStatus,
  type RealtimeLastMessage,
} from '@/lib/firebase/chat'

interface UseRealtimeChatOptions {
  applicationId: string
  userId: string
  enabled?: boolean
  messageLimit?: number
}

interface UseRealtimeChatReturn {
  messages: RealtimeMessage[]
  typingStatus: RealtimeTypingStatus
  lastMessage: RealtimeLastMessage | null
  unreadCount: number
  isLoading: boolean
  sendMessage: (text?: string, attachments?: any[]) => Promise<string>
  setTyping: (isTyping: boolean) => Promise<void>
  markAsRead: () => Promise<void>
}

export function useRealtimeChat({
  applicationId,
  userId,
  enabled = true,
  messageLimit = 50,
}: UseRealtimeChatOptions): UseRealtimeChatReturn {
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [typingStatus, setTypingStatusState] = useState<RealtimeTypingStatus>({})
  const [lastMessage, setLastMessage] = useState<RealtimeLastMessage | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Listen to messages
  useEffect(() => {
    if (!enabled || !applicationId) {
      setIsLoading(false)
      return
    }

    const unsubscribe = onMessagesChange(
      applicationId,
      (newMessages) => {
        setMessages(newMessages)
        setIsLoading(false)
      },
      messageLimit
    )

    return () => unsubscribe()
  }, [applicationId, enabled, messageLimit])

  // Listen to typing status
  useEffect(() => {
    if (!enabled || !applicationId) return

    const unsubscribe = onTypingStatusChange(applicationId, (status) => {
      setTypingStatusState(status)
    })

    return () => unsubscribe()
  }, [applicationId, enabled])

  // Listen to last message
  useEffect(() => {
    if (!enabled || !applicationId) return

    const unsubscribe = onLastMessageChange(applicationId, (message) => {
      setLastMessage(message)
    })

    return () => unsubscribe()
  }, [applicationId, enabled])

  // Update unread count
  useEffect(() => {
    if (!enabled || !applicationId || !userId) return

    const updateUnreadCount = async () => {
      const count = await getUnreadCount(applicationId, userId)
      setUnreadCount(count)
    }

    updateUnreadCount()

    // Update every time messages change
    const interval = setInterval(updateUnreadCount, 5000)

    return () => clearInterval(interval)
  }, [applicationId, userId, enabled, messages])

  // Send message
  const sendMessage = useCallback(
    async (text?: string, attachments?: any[]): Promise<string> => {
      if (!applicationId || !userId) {
        throw new Error('Missing applicationId or userId')
      }

      const messageId = await sendRealtimeMessage(
        applicationId,
        userId,
        text,
        attachments
      )

      return messageId
    },
    [applicationId, userId]
  )

  // Set typing status
  const setTyping = useCallback(
    async (isTyping: boolean): Promise<void> => {
      if (!applicationId || !userId) return

      await setTypingStatus(applicationId, userId, isTyping)
    },
    [applicationId, userId]
  )

  // Mark all messages as read
  const markAsRead = useCallback(async (): Promise<void> => {
    if (!applicationId || !userId) return

    await markAllMessagesAsRead(applicationId, userId)
    setUnreadCount(0)
  }, [applicationId, userId])

  return {
    messages,
    typingStatus,
    lastMessage,
    unreadCount,
    isLoading,
    sendMessage,
    setTyping,
    markAsRead,
  }
}
