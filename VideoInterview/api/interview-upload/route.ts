/**
 * POST /api/interview/upload
 * 
 * Upload and process a tenant interview video.
 * 
 * Steps:
 * 1. Receive video file upload
 * 2. Save to Firebase Storage
 * 3. Transcribe using Gemini API
 * 4. Calculate Seriosity Score
 * 5. Update tenant profile
 * 6. Return results
 */

import { NextRequest, NextResponse } from 'next/server'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase/config'
import { evaluateInterviewBuffer } from '../../lib/evaluateInterview'

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData()
    const videoFile = formData.get('video') as File | null
    const tenantId = formData.get('tenant_id') as string | null
    const interviewId = formData.get('interview_id') as string | null

    // Validate required fields
    if (!videoFile) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Video file is required',
          code: 'validation/missing-file',
        },
        { status: 400 }
      )
    }

    if (!tenantId) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'tenant_id is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      )
    }

    if (!interviewId) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'interview_id is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      )
    }

    console.log('Processing interview upload:', {
      tenantId,
      interviewId,
      fileSize: videoFile.size,
      fileType: videoFile.type,
    })

    // Step 1: Upload video to Firebase Storage
    const videoPath = `interviews/${tenantId}/${interviewId}.webm`
    const videoRef = ref(storage, videoPath)
    
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
    await uploadBytes(videoRef, videoBuffer, {
      contentType: videoFile.type,
    })

    const videoUrl = await getDownloadURL(videoRef)
    console.log('Video uploaded to:', videoUrl)

    // Step 2: Evaluate interview using Gemini API
    console.log('Starting interview evaluation...')
    const evaluation = await evaluateInterviewBuffer(videoBuffer, videoFile.type)
    
    console.log('Evaluation complete:', {
      score: evaluation.score,
      transcriptLength: evaluation.transcript.length,
    })

    // Step 3: Update tenant profile with results
    const tenantRef = doc(db, 'tenant_profiles', tenantId)
    const tenantSnap = await getDoc(tenantRef)

    if (!tenantSnap.exists()) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Tenant profile not found',
          code: 'tenant/not-found',
        },
        { status: 404 }
      )
    }

    // Update tenant profile
    await updateDoc(tenantRef, {
      interview_completed: true,
      interview_id: interviewId,
      interview_video_url: videoUrl,
      interview_transcript: evaluation.transcript,
      seriosity_score: evaluation.score,
      seriosity_breakdown: evaluation.breakdown,
      verification_status: 'interview_verified',
      updated_at: new Date(),
    })

    console.log('Tenant profile updated successfully')

    // Step 4: Create interview record
    const interviewRef = doc(db, 'interviews', interviewId)
    await updateDoc(interviewRef, {
      status: 'done',
      video_url: videoUrl,
      transcript: evaluation.transcript,
      score: evaluation.score,
      score_breakdown: evaluation.breakdown,
      score_explanation: evaluation.scoreExplanation,
      details: evaluation.details,
      completed_at: new Date(),
      updated_at: new Date(),
    })

    // Step 5: Return success response
    return NextResponse.json(
      {
        success: true,
        interview_id: interviewId,
        video_url: videoUrl,
        transcript: evaluation.transcript,
        score: evaluation.score,
        score_explanation: evaluation.scoreExplanation,
        breakdown: evaluation.breakdown,
        suggestions: evaluation.suggestions,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing interview upload:', error)
    
    return NextResponse.json(
      {
        error: 'Internal Error',
        message: error instanceof Error ? error.message : 'Failed to process interview',
        code: 'internal/error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/interview/upload
 * 
 * Get interview status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const interviewId = searchParams.get('interview_id')

    if (!interviewId) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'interview_id is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      )
    }

    // Get interview from Firestore
    const interviewRef = doc(db, 'interviews', interviewId)
    const interviewSnap = await getDoc(interviewRef)

    if (!interviewSnap.exists()) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Interview not found',
          code: 'interview/not-found',
        },
        { status: 404 }
      )
    }

    const interview = interviewSnap.data()

    return NextResponse.json(
      {
        interview_id: interviewId,
        status: interview.status,
        score: interview.score,
        transcript: interview.transcript,
        video_url: interview.video_url,
        completed_at: interview.completed_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error getting interview status:', error)
    
    return NextResponse.json(
      {
        error: 'Internal Error',
        message: 'Failed to get interview status',
        code: 'internal/error',
      },
      { status: 500 }
      )
  }
}
