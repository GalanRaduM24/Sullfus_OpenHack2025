// POST /api/chats/:applicationId/messages - Send a new message
import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { sendRealtimeMessage, initializeChatRoom } from '@/lib/firebase/chat'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { ERROR_CODES } from '@/lib/firebase/types'
import { containsProfanity, shouldFlagMessage } from '@/lib/utils/profanity-filter'
import type { MessageAttachment } from '@/lib/firebase/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params
    const body = await request.json()
    const { sender_id, text, attachments } = body

    // Validate input
    if (!sender_id) {
      return NextResponse.json(
        {
          error: 'Missing sender_id',
          message: 'sender_id is required',
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        },
        { status: 400 }
      )
    }

    if (!text && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        {
          error: 'Empty message',
          message: 'Message must contain text or attachments',
          code: ERROR_CODES.VALIDATION_ERROR,
        },
        { status: 400 }
      )
    }

    // Get application to verify access
    const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, applicationId)
    const applicationSnap = await getDoc(applicationRef)

    if (!applicationSnap.exists()) {
      return NextResponse.json(
        {
          error: 'Application not found',
          message: 'The requested application does not exist',
          code: ERROR_CODES.RESOURCE_NOT_FOUND,
        },
        { status: 404 }
      )
    }

    const application = applicationSnap.data()

    // Check if chat is unlocked
    if (application.status !== 'chat_open') {
      return NextResponse.json(
        {
          error: 'Chat not unlocked',
          message: 'Chat is only available after mutual approval',
          code: ERROR_CODES.CHAT_NOT_UNLOCKED,
        },
        { status: 403 }
      )
    }

    // Verify sender is a participant
    if (sender_id !== application.tenant_id && sender_id !== application.landlord_id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You are not a participant in this chat',
          code: ERROR_CODES.PERMISSION_DENIED,
        },
        { status: 403 }
      )
    }

    // Check for profanity
    if (text && containsProfanity(text)) {
      console.warn(`Profanity detected in message from ${sender_id}`)
      
      // Auto-flag if severity is high
      if (shouldFlagMessage(text)) {
        // Create auto-report
        const reportsRef = collection(db, COLLECTIONS.REPORTS)
        await addDoc(reportsRef, {
          reporter_id: 'system',
          reported_message_id: 'pending',
          type: 'message',
          reason: 'profanity',
          description: 'Auto-flagged for profanity',
          status: 'pending',
          created_at: serverTimestamp(),
        })
      }
    }

    // Initialize chat room if not exists
    await initializeChatRoom(
      applicationId,
      application.tenant_id,
      application.landlord_id
    )

    // Send message to Realtime Database
    const messageId = await sendRealtimeMessage(
      applicationId,
      sender_id,
      text,
      attachments as MessageAttachment[]
    )

    // Also store in Firestore for persistence and search
    const messageData = {
      application_id: applicationId,
      sender_user_id: sender_id,
      text: text || null,
      attachments: attachments || [],
      created_at: serverTimestamp(),
      read_at: null,
    }

    const messagesRef = collection(db, COLLECTIONS.MESSAGES)
    const messageRef = await addDoc(messagesRef, messageData)

    // Send notification to other party
    const recipientId =
      sender_id === application.tenant_id
        ? application.landlord_id
        : application.tenant_id

    // Get sender name for notification
    let senderName = 'Someone'
    if (sender_id === application.tenant_id) {
      const tenantRef = doc(db, COLLECTIONS.TENANT_PROFILES, sender_id)
      const tenantSnap = await getDoc(tenantRef)
      if (tenantSnap.exists()) {
        senderName = tenantSnap.data().name
      }
    } else {
      const landlordRef = doc(db, COLLECTIONS.LANDLORD_PROFILES, sender_id)
      const landlordSnap = await getDoc(landlordRef)
      if (landlordSnap.exists()) {
        senderName = landlordSnap.data().company_name || landlordSnap.data().contact_name
      }
    }

    // Create notification
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS)
    await addDoc(notificationsRef, {
      user_id: recipientId,
      type: 'new_message',
      title: 'New Message',
      message: `${senderName}: ${text?.substring(0, 50) || 'Sent an attachment'}`,
      data: {
        application_id: applicationId,
        message_id: messageId,
      },
      read: false,
      created_at: serverTimestamp(),
      action_url: `/chat/${applicationId}`,
    })

    return NextResponse.json({
      success: true,
      message: {
        id: messageRef.id,
        ...messageData,
        created_at: Timestamp.now(),
      },
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      {
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      { status: 500 }
    )
  }
}
