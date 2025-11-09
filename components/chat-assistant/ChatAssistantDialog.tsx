'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Send, Sparkles } from 'lucide-react'
import { ChatMessage } from './ChatMessage'
import { FilterSummary } from './FilterSummary'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ExtractedFilters {
  budgetMin?: number
  budgetMax?: number
  locations?: string[]
  amenities?: string[]
  petsAllowed?: boolean
  moveInDate?: string
  propertyType?: string[]
}

interface ChatAssistantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onFiltersApplied?: (filters: ExtractedFilters) => void
}

export function ChatAssistantDialog({
  open,
  onOpenChange,
  onFiltersApplied,
}: ChatAssistantDialogProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm here to help you find the perfect place. What's your budget range?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [extractedFilters, setExtractedFilters] = useState<ExtractedFilters>({})
  const [showApplyButton, setShowApplyButton] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Focus input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !user) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      const response = await fetch('/api/chat-assistant/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: user.uid,
          message: input.trim(),
          conversation_history: conversationHistory,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Update extracted filters if provided
      if (data.extractedFilters) {
        setExtractedFilters((prev) => ({
          ...prev,
          ...data.extractedFilters,
        }))
      }

      // Show apply button if action is apply_filters
      if (data.action === 'apply_filters') {
        setShowApplyButton(true)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleApplyFilters = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/chat-assistant/apply-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: user.uid,
          filters: extractedFilters,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to apply filters')
      }

      const data = await response.json()

      if (data.success) {
        // Notify parent component
        onFiltersApplied?.(extractedFilters)

        // Add confirmation message
        const confirmationMessage: Message = {
          role: 'assistant',
          content:
            'Great! Your search preferences have been saved. You can now browse properties that match your criteria.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, confirmationMessage])
        setShowApplyButton(false)

        // Close dialog after a short delay
        setTimeout(() => {
          onOpenChange(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Error applying filters:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Failed to save your preferences. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }
  }

  const handleClearFilters = () => {
    setExtractedFilters({})
    setShowApplyButton(false)
  }

  const handleRemoveFilter = (filterKey: string, value?: string) => {
    setExtractedFilters((prev) => {
      const updated = { ...prev }
      
      if (value && Array.isArray(updated[filterKey as keyof ExtractedFilters])) {
        // Remove specific value from array
        const arr = updated[filterKey as keyof ExtractedFilters] as string[]
        updated[filterKey as keyof ExtractedFilters] = arr.filter((v) => v !== value) as any
        
        // Remove key if array is empty
        if ((updated[filterKey as keyof ExtractedFilters] as string[]).length === 0) {
          delete updated[filterKey as keyof ExtractedFilters]
        }
      } else {
        // Remove entire key
        delete updated[filterKey as keyof ExtractedFilters]
      }
      
      return updated
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Search Assistant
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Filter Summary */}
          {Object.keys(extractedFilters).length > 0 && (
            <div className="px-6 py-3 border-t bg-muted/30">
              <FilterSummary
                filters={extractedFilters}
                onApply={showApplyButton ? handleApplyFilters : undefined}
                onClear={handleClearFilters}
                onRemoveFilter={handleRemoveFilter}
              />
            </div>
          )}

          {/* Input */}
          <div className="px-6 py-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
