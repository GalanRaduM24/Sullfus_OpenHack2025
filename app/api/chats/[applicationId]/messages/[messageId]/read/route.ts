// PUT /api/chats/:applicationId/messages/:messageId/read - Mark message as read
import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { markMessageAsRead } from '@/lib/firebase/chat'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { ERROR_CODES } from '@/lib/firebase/types'

export async function PUT(
  request: NextRequest,
  { params }: { params: { applicationId: string; messageId: string } }
) {
  try {
    const { applicationId, messageId } = params
    const body = await request.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        {
          error: 'Missing user_id',
          message: 'user_id is required',
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
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

    // Verify user is a participant
    if (user_id !== application.tenant_id && user_id !== application.landlord_id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You are not a participant in this chat',
          code: ERROR_CODES.PERMISSION_DENIED,
        },
        { status: 403 }
      )
    }

    // Mark as read in Realtime Database
    await markMessageAsRead(applicationId, messageId)

    // Also update in Firestore if message exists
    try {
      const messageRef = doc(db, COLLECTIONS.MESSAGES, messageId)
      const messageSnap = await getDoc(messageRef)
      
      if (messageSnap.exists()) {
        await updateDoc(messageRef, {
          read_at: serverTimestamp(),
        })
      }
    } catch (error) {
      // Message might not exist in Firestore, that's okay
      console.log('Message not found in Firestore, only updating Realtime DB')
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json(
      {
        error: 'Failed to mark message as read',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      { status: 500 }
    )
  }
}
