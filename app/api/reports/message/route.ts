// POST /api/reports/message - Report a message
import { NextRequest, NextResponse } from 'next/server'
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { ERROR_CODES } from '@/lib/firebase/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message_id, application_id, reason, description, reporter_id } = body

    // Validate input
    if (!message_id || !reason) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'message_id and reason are required',
          code: ERROR_CODES.MISSING_REQUIRED_FIELD,
        },
        { status: 400 }
      )
    }

    // Verify application exists
    if (application_id) {
      const applicationRef = doc(db, COLLECTIONS.APPLICATIONS, application_id)
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
    }

    // Create report
    const reportsRef = collection(db, COLLECTIONS.REPORTS)
    const reportData = {
      reporter_id: reporter_id || 'anonymous',
      reported_message_id: message_id,
      type: 'message',
      reason,
      description: description || '',
      status: 'pending',
      created_at: serverTimestamp(),
    }

    const reportRef = await addDoc(reportsRef, reportData)

    // TODO: Send notification to admin
    // TODO: Auto-flag message if severity is high

    return NextResponse.json({
      success: true,
      report_id: reportRef.id,
    })
  } catch (error) {
    console.error('Error creating report:', error)
    return NextResponse.json(
      {
        error: 'Failed to create report',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      { status: 500 }
    )
  }
}
