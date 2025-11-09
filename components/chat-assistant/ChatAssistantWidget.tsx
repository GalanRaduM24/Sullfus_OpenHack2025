'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'
import { ChatAssistantDialog } from './ChatAssistantDialog'
import { cn } from '@/lib/utils'

interface ChatAssistantWidgetProps {
  onFiltersApplied?: (filters: any) => void
  className?: string
}

export function ChatAssistantWidget({
  onFiltersApplied,
  className,
}: ChatAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        size="lg"
        className={cn(
          'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all',
          'bg-gradient-to-r from-primary to-primary/80',
          'hover:scale-110',
          'z-50',
          className
        )}
        aria-label="Open AI Search Assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Dialog */}
      <ChatAssistantDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        onFiltersApplied={(filters) => {
          onFiltersApplied?.(filters)
          setIsOpen(false)
        }}
      />
    </>
  )
}
