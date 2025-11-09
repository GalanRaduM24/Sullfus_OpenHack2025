'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, MoreVertical, Phone, Video, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import {
  onMessagesChange,
  onTypingStatusChange,
  sendRealtimeMessage,
  setTypingStatus,
  markAllMessagesAsRead,
  type RealtimeMessage,
  type RealtimeTypingStatus,
} from '@/lib/firebase/chat'
import { uploadChatAttachment } from '@/lib/firebase/storage-helpers'
import type { Application, TenantProfile, LandlordProfile, Property } from '@/lib/firebase/types'

interface ChatInterfaceProps {
  application: Application & {
    property?: Property
    tenant?: TenantProfile
    landlord?: LandlordProfile
  }
  onBack?: () => void
}

export function ChatInterface({ application, onBack }: ChatInterfaceProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [typingStatus, setTypingStatus] = useState<RealtimeTypingStatus>({})
  const [isLoading, setIsLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isLandlord = user?.role === 'landlord'
  const otherParty = isLandlord ? application.tenant : application.landlord
  const otherPartyId = isLandlord ? application.tenant_id : application.landlord_id

  // Check if chat is unlocked
  const isChatUnlocked = application.status === 'chat_open'

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load messages
  useEffect(() => {
    if (!isChatUnlocked) {
      setIsLoading(false)
      return
    }

    const unsubscribe = onMessagesChange(
      application.id,
      (newMessages) => {
        setMessages(newMessages)
        setIsLoading(false)
        scrollToBottom()
      },
      100 // Load last 100 messages
    )

    return () => unsubscribe()
  }, [application.id, isChatUnlocked, scrollToBottom])

  // Listen to typing status
  useEffect(() => {
    if (!isChatUnlocked) return

    const unsubscribe = onTypingStatusChange(application.id, (status) => {
      setTypingStatus(status)
    })

    return () => unsubscribe()
  }, [application.id, isChatUnlocked])

  // Mark messages as read when viewing
  useEffect(() => {
    if (!isChatUnlocked || !user?.id) return

    const markAsRead = async () => {
      await markAllMessagesAsRead(application.id, user.id)
    }

    markAsRead()
  }, [application.id, isChatUnlocked, user?.id, messages])

  // Handle send message
  const handleSendMessage = async (text: string, files: File[]) => {
    if (!user?.id) return

    try {
      // Upload attachments if any
      let attachments: Array<{ type: string; url: string; name: string; size: number }> = []
      
      if (files.length > 0) {
        const uploadPromises = files.map((file) =>
          uploadChatAttachment(application.id, file)
        )
        attachments = await Promise.all(uploadPromises)
      }

      // Send message to Realtime DB
      await sendRealtimeMessage(application.id, user.id, text, attachments)

      // Also store in Firestore for persistence (handled by API)
      await fetch(`/api/chats/${application.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          text,
          attachments,
        }),
      })

      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  // Handle typing indicator
  const handleTyping = async (isTyping: boolean) => {
    if (!user?.id) return
    await setTypingStatus(application.id, user.id, isTyping)
  }

  const isOtherPartyTyping = typingStatus[otherPartyId] === true

  if (!isChatUnlocked) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <ChatHeader
          otherParty={otherParty}
          property={application.property}
          onBack={onBack}
        />

        {/* Locked Message */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chat Not Available
            </h3>
            <p className="text-gray-600">
              {isLandlord
                ? 'Approve this applicant to unlock the chat'
                : 'Waiting for landlord approval to unlock chat'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <ChatHeader
        otherParty={otherParty}
        property={application.property}
        onBack={onBack}
      />

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No messages yet</p>
              <p className="text-sm text-gray-400">
                Start the conversation by sending a message
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender_id === user?.id
              const showAvatar =
                index === 0 ||
                messages[index - 1].sender_id !== message.sender_id

              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  senderName={
                    isOwnMessage
                      ? 'You'
                      : otherParty?.name || otherParty?.company_name || 'User'
                  }
                  senderPhoto={
                    isOwnMessage ? undefined : otherParty?.profile_photo_url
                  }
                  showAvatar={showAvatar}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Typing Indicator */}
        {isOtherPartyTyping && (
          <TypingIndicator
            userName={otherParty?.name || otherParty?.company_name || 'User'}
          />
        )}
      </ScrollArea>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={!isChatUnlocked}
        placeholder={
          isChatUnlocked
            ? 'Type a message...'
            : 'Chat is locked'
        }
      />
    </div>
  )
}

interface ChatHeaderProps {
  otherParty?: TenantProfile | LandlordProfile | null
  property?: Property
  onBack?: () => void
}

function ChatHeader({ otherParty, property, onBack }: ChatHeaderProps) {
  const name = otherParty
    ? 'company_name' in otherParty
      ? otherParty.company_name
      : otherParty.name
    : 'Unknown User'

  return (
    <div className="border-b bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}

          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{name}</h2>
            {property && (
              <p className="text-sm text-gray-500">{property.title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
