// POST /api/chats/:applicationId/upload - Upload chat attachment
import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { uploadChatAttachment, validateFile } from '@/lib/firebase/storage-helpers'
import { validateFileUpload } from '@/lib/utils/virus-scan'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { ERROR_CODES } from '@/lib/firebase/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const { applicationId } = params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('user_id') as string

    if (!file) {
      return NextResponse.json(
        {
          error: 'No file provided',
          message: 'File is required',
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: 'Missing user_id',
          message: 'user_id is required',
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const validation = validateFile(file, allowedTypes, 10) // 10MB max

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid file',
          message: validation.error,
          code: ERROR_CODES.INVALID_FILE_TYPE,
        },
        { status: 400 }
      )
    }

    // Scan file for viruses
    const scanResult = await validateFileUpload(file)
    if (!scanResult.valid) {
      return NextResponse.json(
        {
          error: 'File failed security scan',
          message: scanResult.error || 'File may contain malicious content',
          code: ERROR_CODES.ATTACHMENT_FAILED,
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

    // Verify user is a participant
    if (userId !== application.tenant_id && userId !== application.landlord_id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You are not a participant in this chat',
          code: ERROR_CODES.PERMISSION_DENIED,
        },
        { status: 403 }
      )
    }

    // Upload file to Firebase Storage
    const attachment = await uploadChatAttachment(applicationId, file)

    return NextResponse.json({
      success: true,
      attachment,
    })
  } catch (error) {
    console.error('Error uploading attachment:', error)
    return NextResponse.json(
      {
        error: 'Failed to upload attachment',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: ERROR_CODES.ATTACHMENT_FAILED,
      },
      { status: 500 }
    )
  }
}

// Configure max file size for Next.js
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
