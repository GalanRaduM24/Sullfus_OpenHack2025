'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import Image from 'next/image'
import { MessageCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Application } from '@/lib/firebase/types'
import type { RealtimeLastMessage } from '@/lib/firebase/chat'

interface ChatListItem extends Application {
  property?: {
    id: string
    title: string
    address: { city: string; area: string }
    media: { photos: string[] }
  }
  otherParty?: {
    id: string
    name: string
    photo?: string
    role: 'tenant' | 'landlord'
  }
  lastMessage?: RealtimeLastMessage
  unreadCount?: number
}

interface ChatListProps {
  chats: ChatListItem[]
  currentUserId: string
  isLoading?: boolean
}

export function ChatList({ chats, currentUserId, isLoading }: ChatListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No conversations yet
        </h3>
        <p className="text-gray-500">
          Start by liking properties or approving applicants
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          currentUserId={currentUserId}
          onClick={() => router.push(`/chat/${chat.id}`)}
        />
      ))}
    </div>
  )
}

interface ChatListItemProps {
  chat: ChatListItem
  currentUserId: string
  onClick: () => void
}

function ChatListItem({ chat, currentUserId, onClick }: ChatListItemProps) {
  const otherParty = chat.otherParty
  const property = chat.property
  const lastMessage = chat.lastMessage
  const unreadCount = chat.unreadCount || 0

  const lastMessageTime = lastMessage
    ? formatDistanceToNow(new Date(lastMessage.timestamp), { addSuffix: true })
    : null

  const isLastMessageFromMe = lastMessage?.sender_id === currentUserId

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md',
        unreadCount > 0 && 'bg-blue-50 border-blue-200'
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {otherParty?.photo ? (
            <Image
              src={otherParty.photo}
              alt={otherParty.name || 'User'}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-lg font-medium text-gray-700">
                {otherParty?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {otherParty?.name || 'Unknown User'}
              </h3>
              {property && (
                <p className="text-sm text-gray-500 truncate">
                  {property.title}
                </p>
              )}
            </div>
            {lastMessageTime && (
              <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                {lastMessageTime}
              </span>
            )}
          </div>

          {/* Last Message */}
          {lastMessage && (
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  'text-sm truncate',
                  unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                )}
              >
                {isLastMessageFromMe && (
                  <span className="text-gray-400 mr-1">You:</span>
                )}
                {lastMessage.text}
              </p>
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white">
                  {unreadCount}
                </Badge>
              )}
            </div>
          )}

          {/* Status Badge */}
          {chat.status === 'chat_open' && !lastMessage && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <MessageCircle className="w-4 h-4" />
              <span>Chat unlocked</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
