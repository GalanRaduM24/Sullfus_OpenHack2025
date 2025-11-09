/**
 * POST /api/interview/upload
 * 
 * Upload and process a tenant interview video using Gemini API
 */

import { NextRequest, NextResponse } from 'next/server'
import { evaluateInterviewBuffer } from '@/VideoInterview/lib/evaluateInterview'

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

    // Convert file to buffer
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
    
    // Evaluate interview using Gemini API
    console.log('Starting interview evaluation with Gemini API...')
    const evaluation = await evaluateInterviewBuffer(videoBuffer, videoFile.type)
    
    console.log('Evaluation complete:', {
      score: evaluation.score,
      transcriptLength: evaluation.transcript.length,
      breakdown: evaluation.breakdown,
    })

    // Return success response
    return NextResponse.json(
      {
        success: true,
        interview_id: interviewId,
        transcript: evaluation.transcript,
        score: evaluation.score,
        score_explanation: evaluation.scoreExplanation,
        breakdown: evaluation.breakdown,
        suggestions: evaluation.suggestions,
        details: evaluation.details,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing interview upload:', error)
    
    return NextResponse.json(
      {
        error: 'Internal Error',
        message: error instanceof Error ? error.message : 'Failed to process interview',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
