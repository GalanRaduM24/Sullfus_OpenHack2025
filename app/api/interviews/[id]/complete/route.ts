/**
 * POST /api/interviews/:id/complete
 * Mark interview as complete and trigger background processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { CompleteInterviewResponse } from '@/lib/firebase/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;

    // Check if interview exists
    const interviewRef = doc(db, COLLECTIONS.INTERVIEWS, interviewId);
    const interviewSnap = await getDoc(interviewRef);

    if (!interviewSnap.exists()) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Interview not found',
          code: 'interview/not-found',
        },
        { status: 404 }
      );
    }

    const interview = interviewSnap.data();

    // Check if interview is in valid state
    if (interview.status !== 'started') {
      return NextResponse.json(
        {
          error: 'Invalid State',
          message: 'Interview is not in progress',
          code: 'interview/invalid-state',
        },
        { status: 400 }
      );
    }

    // Check if all questions have been answered
    if (!interview.questions || interview.questions.length === 0) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'No questions have been answered',
          code: 'validation/failed',
        },
        { status: 400 }
      );
    }

    // Update interview status to processing
    await updateDoc(interviewRef, {
      status: 'processing',
      completed_at: Timestamp.now(),
    });

    // Trigger background processing
    // In a production environment, this would trigger a Cloud Function or background job
    // For now, we'll process it immediately in the next API call
    // You could also use a queue system like Bull or a serverless function

    // Start processing asynchronously (fire and forget)
    processInterviewAsync(interviewId).catch(error => {
      console.error('Error processing interview:', error);
    });

    const response: CompleteInterviewResponse = {
      status: 'processing',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error completing interview:', error);
    return NextResponse.json(
      {
        error: 'Internal Error',
        message: 'Failed to complete interview',
        code: 'internal/error',
      },
      { status: 500 }
    );
  }
}

/**
 * Process interview asynchronously
 * This function will be called after the interview is marked as complete
 */
async function processInterviewAsync(interviewId: string) {
  try {
    // Import processing functions dynamically to avoid circular dependencies
    const { processInterview } = await import('@/lib/services/interview-processing.service');
    await processInterview(interviewId);
  } catch (error) {
    console.error('Error in async interview processing:', error);
    
    // Update interview status to failed
    const interviewRef = doc(db, COLLECTIONS.INTERVIEWS, interviewId);
    await updateDoc(interviewRef, {
      status: 'failed',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
