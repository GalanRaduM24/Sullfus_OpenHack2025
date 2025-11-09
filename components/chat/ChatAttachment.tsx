'use client'

import { Download, FileText, Image as ImageIcon, File } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { MessageAttachment } from '@/lib/firebase/types'

interface ChatAttachmentProps {
  attachment: MessageAttachment
  isOwnMessage?: boolean
  className?: string
}

export function ChatAttachment({
  attachment,
  isOwnMessage = false,
  className,
}: ChatAttachmentProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(attachment.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = attachment.name
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download file:', error)
      alert('Failed to download file')
    }
  }

  // Image attachment
  if (attachment.type === 'image') {
    return (
      <div className={cn('relative group', className)}>
        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Image
            src={attachment.url}
            alt={attachment.name}
            width={300}
            height={300}
            className="rounded-lg object-cover max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
          />
        </a>
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  // PDF or Document attachment
  const icon = attachment.type === 'pdf' ? FileText : File
  const Icon = icon

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-opacity-90 transition-all',
        isOwnMessage
          ? 'bg-blue-700 border-blue-500 text-white'
          : 'bg-white border-gray-300 text-gray-900',
        className
      )}
      onClick={handleDownload}
    >
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          isOwnMessage ? 'bg-blue-600' : 'bg-gray-100'
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.name}</p>
        <div className="flex items-center gap-2 text-xs opacity-75">
          <span>{formatFileSize(attachment.size)}</span>
          <span>•</span>
          <span className="uppercase">{attachment.type}</span>
        </div>
      </div>

      <Button
        size="icon"
        variant="ghost"
        className={cn(
          'flex-shrink-0',
          isOwnMessage ? 'text-white hover:bg-blue-600' : 'text-gray-600 hover:bg-gray-100'
        )}
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
