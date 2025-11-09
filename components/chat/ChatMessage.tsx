'use client'

import { formatDistanceToNow } from 'date-fns'
import { Check, CheckCheck, FileText, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { RealtimeMessage } from '@/lib/firebase/chat'
import type { MessageAttachment } from '@/lib/firebase/types'

interface ChatMessageProps {
  message: RealtimeMessage
  isOwnMessage: boolean
  senderName: string
  senderPhoto?: string
  showAvatar?: boolean
}

export function ChatMessage({
  message,
  isOwnMessage,
  senderName,
  senderPhoto,
  showAvatar = true,
}: ChatMessageProps) {
  const attachments: MessageAttachment[] = message.attachments
    ? JSON.parse(message.attachments)
    : []

  const timestamp = new Date(message.timestamp)
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {senderPhoto ? (
            <Image
              src={senderPhoto}
              alt={senderName}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {senderName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[70%]',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        {/* Sender Name (only for other's messages) */}
        {!isOwnMessage && (
          <span className="text-xs text-gray-500 mb-1 px-1">{senderName}</span>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          )}
        >
          {/* Text Content */}
          {message.text && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map((attachment, index) => (
                <AttachmentPreview
                  key={index}
                  attachment={attachment}
                  isOwnMessage={isOwnMessage}
                />
              ))}
            </div>
          )}
        </div>

        {/* Timestamp and Read Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 px-1',
            isOwnMessage ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className="text-xs text-gray-400">{timeAgo}</span>
          {isOwnMessage && (
            <span className="text-xs">
              {message.read_at ? (
                <CheckCheck className="w-3 h-3 text-blue-500" />
              ) : (
                <Check className="w-3 h-3 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface AttachmentPreviewProps {
  attachment: MessageAttachment
  isOwnMessage: boolean
}

function AttachmentPreview({ attachment, isOwnMessage }: AttachmentPreviewProps) {
  if (attachment.type === 'image') {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Image
          src={attachment.url}
          alt={attachment.name}
          width={200}
          height={200}
          className="rounded-lg object-cover max-w-full h-auto"
        />
      </a>
    )
  }

  // PDF or Document
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg border',
        isOwnMessage
          ? 'bg-blue-700 border-blue-500'
          : 'bg-white border-gray-300'
      )}
    >
      {attachment.type === 'pdf' ? (
        <FileText className="w-5 h-5" />
      ) : (
        <ImageIcon className="w-5 h-5" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <p className="text-xs opacity-75">
          {(attachment.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </a>
  )
}
