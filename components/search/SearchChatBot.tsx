'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react'
import { SearchFilters } from './SearchForRentPage'

interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  suggestedFilters?: Partial<SearchFilters>
}

interface ChatBotProps {
  onFiltersUpdate: (filters: any) => void
  currentFilters: any
}

export function SearchChatBot({ onFiltersUpdate, currentFilters }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hi! I'm your property search assistant. Tell me what you're looking for and I'll help you find the perfect rental. For example: 'I need a 2-bedroom apartment in Herastrau under €1000' or 'Show me pet-friendly houses with parking'.",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const processMessageWithGemini = async (userMessage: string): Promise<{
    response: string
    suggestedFilters?: Partial<SearchFilters>
  }> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        throw new Error('Gemini API key not configured')
      }

      const prompt = `
You are a helpful real estate search assistant. Analyze the user's request and:
1. Provide a friendly, helpful response
2. Extract search filters from their message
3. Return both response and filters in JSON format

User message: "${userMessage}"

Current filters: ${JSON.stringify(currentFilters, null, 2)}

Extract and return in this exact JSON format:
{
  "response": "Your helpful response here",
  "filters": {
    "query": "extracted search terms",
    "location": "city/neighborhood if mentioned",
    "priceRange": {"min": number, "max": number},
    "propertyType": ["apartment", "house", "studio", "room"] (only if mentioned),
    "bedrooms": {"min": number, "max": number},
    "bathrooms": {"min": number, "max": number},  
    "area": {"min": number, "max": number},
    "amenities": ["wifi", "parking", "tv", "kitchen", "gym", "balcony", "garden", "elevator"],
    "petFriendly": true/false/null,
    "smokingAllowed": true/false/null,
    "furnished": true/false/null
  }
}

Guidelines:
- Only include filters that are explicitly mentioned or clearly implied
- For price, convert RON to EUR (divide by 5), handle "under", "below", "max", "up to"
- For bedrooms: "studio" = 0, "1BR/1-bedroom" = 1, etc.
- Common amenities: parking, wifi, gym, balcony, garden, elevator
- Pet-friendly if they mention pets, dogs, cats
- Extract neighborhoods from Bucharest: Herastrau, Old Town, Pipera, Calea Victoriei, etc.
- If they say "cheap" set max price to 500, "expensive" set min to 1000
- Area in square meters: "small" = max 50, "large" = min 100

Examples:
- "2BR apartment in Herastrau under 1000 euros" → bedrooms: {min:2,max:2}, location: "Herastrau", priceRange: {max:1000}
- "pet-friendly house with garden" → propertyType: ["house"], petFriendly: true, amenities: ["garden"]
- "studio with parking near Old Town" → propertyType: ["studio"], location: "Old Town", amenities: ["parking"]
`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Gemini API Error:', response.status, errorData)
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!generatedText) {
        console.error('No response generated from Gemini:', data)
        throw new Error('No response generated')
      }

      // Try to parse JSON from the response
      try {
        // Extract JSON from the response (handle markdown code blocks)
        const jsonMatch = generatedText.match(/```json\n(.*)\n```/s) || generatedText.match(/\{.*\}/s)
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedText
        
        const parsed = JSON.parse(jsonStr)
        
        return {
          response: parsed.response || "I've updated your search filters based on your request!",
          suggestedFilters: parsed.filters || {}
        }
      } catch (parseError) {
        // If JSON parsing fails, return a simple response
        return {
          response: generatedText.replace(/```json|```/g, '').trim(),
          suggestedFilters: {}
        }
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      
      // Fallback to simple rule-based parsing
      const fallbackResult = parseMessageWithRules(userMessage)
      return {
        response: fallbackResult.filters && Object.keys(fallbackResult.filters).length > 0 
          ? `I understand you're looking for ${userMessage}. I've applied some filters based on your request, but I'm having trouble with the AI service right now.`
          : "I'm having trouble understanding your request right now. Could you try rephrasing it? For example: 'I need a 2-bedroom apartment under €800' or 'Show me pet-friendly properties'.",
        suggestedFilters: fallbackResult.filters || {}
      }
    }
  }

  const parseMessageWithRules = (message: string): { filters: Partial<SearchFilters> } => {
    const lowerMessage = message.toLowerCase()
    const filters: Partial<SearchFilters> = {}

    // Extract bedrooms
    const bedroomMatch = lowerMessage.match(/(\d+)\s*(?:br|bed|bedroom)/) || 
                        lowerMessage.match(/(?:studio|one|two|three|four|five)\s*(?:bed|bedroom)/)
    if (bedroomMatch) {
      const numMap: { [key: string]: number } = { 
        'studio': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5 
      }
      const bedrooms = numMap[bedroomMatch[1]] || parseInt(bedroomMatch[1]) || 0
      filters.bedrooms = { min: bedrooms, max: bedrooms }
    }

    // Extract price
    const priceMatch = lowerMessage.match(/(?:under|below|max|up to)\s*[€$]?(\d+)/) ||
                      lowerMessage.match(/[€$](\d+)/)
    if (priceMatch) {
      const price = parseInt(priceMatch[1])
      if (lowerMessage.includes('under') || lowerMessage.includes('below') || lowerMessage.includes('max')) {
        filters.priceRange = { min: 0, max: price }
      } else {
        filters.priceRange = { min: price, max: 2000 }
      }
    }

    // Extract location
    const locations = ['herastrau', 'old town', 'pipera', 'calea victoriei', 'floreasca', 'dorobanti', 'amzei']
    const foundLocation = locations.find(loc => lowerMessage.includes(loc))
    if (foundLocation) {
      filters.location = foundLocation.charAt(0).toUpperCase() + foundLocation.slice(1)
    }

    // Extract property type
    if (lowerMessage.includes('apartment')) filters.propertyType = ['apartment']
    if (lowerMessage.includes('house')) filters.propertyType = ['house']
    if (lowerMessage.includes('studio')) filters.propertyType = ['studio']
    if (lowerMessage.includes('room')) filters.propertyType = ['room']

    // Extract amenities
    const amenities = []
    if (lowerMessage.includes('parking')) amenities.push('parking')
    if (lowerMessage.includes('wifi') || lowerMessage.includes('internet')) amenities.push('wifi')
    if (lowerMessage.includes('gym') || lowerMessage.includes('fitness')) amenities.push('gym')
    if (lowerMessage.includes('balcony')) amenities.push('balcony')
    if (lowerMessage.includes('garden')) amenities.push('garden')
    if (lowerMessage.includes('elevator')) amenities.push('elevator')
    if (amenities.length > 0) filters.amenities = amenities

    // Extract pet-friendly
    if (lowerMessage.includes('pet') || lowerMessage.includes('dog') || lowerMessage.includes('cat')) {
      filters.petFriendly = true
    }

    // Extract furnished
    if (lowerMessage.includes('furnished')) {
      filters.furnished = true
    }

    return { filters }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const result = await processMessageWithGemini(inputMessage)
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: result.response,
        timestamp: new Date(),
        suggestedFilters: result.suggestedFilters
      }

      setMessages(prev => [...prev, botMessage])

      // Apply filters if any were extracted
      if (result.suggestedFilters && Object.keys(result.suggestedFilters).length > 0) {
        onFiltersUpdate(result.suggestedFilters)
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Sorry, I encountered an error. Please try again or contact support if the problem persists.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
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

  const applyFilters = (filters: Partial<SearchFilters>) => {
    onFiltersUpdate(filters)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          AI Search Assistant
        </Button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96'
    }`}>
      <Card className="shadow-2xl border-0 bg-gradient-to-b from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <CardTitle className="text-lg">AI Search Assistant</CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    }`}>
                      {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className="space-y-2">
                      <div className={`rounded-lg px-3 py-2 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white ml-auto'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Show filter suggestions */}
                      {message.suggestedFilters && Object.keys(message.suggestedFilters).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">Suggested filters:</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(message.suggestedFilters).map(([key, value]) => {
                              if (value === null || value === undefined || 
                                  (Array.isArray(value) && value.length === 0) ||
                                  (typeof value === 'object' && Object.keys(value).length === 0)) {
                                return null
                              }
                              
                              return (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="text-xs cursor-pointer hover:bg-blue-100"
                                  onClick={() => applyFilters({ [key]: value })}
                                >
                                  {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </Badge>
                              )
                            })}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyFilters(message.suggestedFilters!)}
                            className="text-xs h-7"
                          >
                            Apply All Filters
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about properties... (e.g., '2BR in Herastrau under €1000')"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick examples */}
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-blue-50"
                  onClick={() => setInputMessage("2 bedroom apartment in Herastrau under 1000 euros")}
                >
                  2BR in Herastrau
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-blue-50"
                  onClick={() => setInputMessage("pet-friendly house with garden")}
                >
                  Pet-friendly house
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-blue-50"
                  onClick={() => setInputMessage("studio with parking near Old Town")}
                >
                  Studio Old Town
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}