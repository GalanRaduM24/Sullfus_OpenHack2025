import { NextRequest, NextResponse } from 'next/server'
import { processChatAssistantMessage } from '@/lib/services/openai.service'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { COLLECTIONS } from '@/lib/firebase/collections'

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatAssistantMessageRequest {
  tenant_id: string
  message: string
  conversation_history?: ConversationMessage[]
}

/**
 * POST /api/chat-assistant/message
 * Process chat assistant message and extract search filters
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatAssistantMessageRequest = await request.json()
    const { tenant_id, message, conversation_history = [] } = body

    // Validate required fields
    if (!tenant_id || !message) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'tenant_id and message are required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length > 1000) {
      return NextResponse.json(
        {
          error: 'Message too long',
          message: 'Message must be less than 1000 characters',
          code: 'chat/message-too-long',
        },
        { status: 400 }
      )
    }

    // Process message with OpenAI
    const result = await processChatAssistantMessage(message, conversation_history)

    // Store conversation in Firestore
    const conversationRef = doc(
      db,
      COLLECTIONS.TENANT_PROFILES,
      tenant_id,
      'chat_assistant_conversations',
      'current'
    )

    const updatedHistory = [
      ...conversation_history,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: result.response },
    ]

    await setDoc(
      conversationRef,
      {
        messages: updatedHistory,
        extracted_filters: result.extractedFilters || null,
        last_updated: serverTimestamp(),
      },
      { merge: true }
    )

    // Return response
    return NextResponse.json({
      response: result.response,
      extractedFilters: result.extractedFilters,
      action: result.action,
    })
  } catch (error) {
    console.error('Error processing chat assistant message:', error)

    // Check if it's an OpenAI error
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return NextResponse.json(
        {
          error: 'AI service error',
          message: 'Failed to process your message. Please try again.',
          code: 'ai/service-unavailable',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
        code: 'internal/error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chat-assistant/message
 * Retrieve conversation history for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenant_id = searchParams.get('tenant_id')

    if (!tenant_id) {
      return NextResponse.json(
        {
          error: 'Missing tenant_id',
          message: 'tenant_id query parameter is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      )
    }

    // Retrieve conversation from Firestore
    const conversationRef = doc(
      db,
      COLLECTIONS.TENANT_PROFILES,
      tenant_id,
      'chat_assistant_conversations',
      'current'
    )

    const conversationDoc = await getDoc(conversationRef)

    if (!conversationDoc.exists()) {
      return NextResponse.json({
        messages: [],
        extracted_filters: null,
      })
    }

    const data = conversationDoc.data()

    return NextResponse.json({
      messages: data.messages || [],
      extracted_filters: data.extracted_filters || null,
      last_updated: data.last_updated,
    })
  } catch (error) {
    console.error('Error retrieving conversation:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve conversation',
        code: 'internal/error',
      },
      { status: 500 }
    )
  }
}
