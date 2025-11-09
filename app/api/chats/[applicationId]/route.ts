// GET /api/chats/:applicationId - Get chat messages and participants
import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { getMessages, getChatParticipants } from '@/lib/firebase/chat'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { ERROR_CODES } from '@/lib/firebase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params

    // Get application to verify access and get participant info
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

    // Get messages from Realtime Database
    const messages = await getMessages(applicationId, 100)

    // Get tenant profile
    const tenantRef = doc(db, COLLECTIONS.TENANT_PROFILES, application.tenant_id)
    const tenantSnap = await getDoc(tenantRef)
    const tenant = tenantSnap.exists() ? tenantSnap.data() : null

    // Get landlord profile
    const landlordRef = doc(db, COLLECTIONS.LANDLORD_PROFILES, application.landlord_id)
    const landlordSnap = await getDoc(landlordRef)
    const landlord = landlordSnap.exists() ? landlordSnap.data() : null

    // Get property
    const propertyRef = doc(db, COLLECTIONS.PROPERTIES, application.property_id)
    const propertySnap = await getDoc(propertyRef)
    const property = propertySnap.exists() ? propertySnap.data() : null

    return NextResponse.json({
      messages,
      participants: {
        tenant,
        landlord,
      },
      property,
      application: {
        id: applicationSnap.id,
        ...application,
      },
    })
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch chat',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      { status: 500 }
    )
  }
}
