/**
 * GET /api/interviews/:id/status
 * Check the processing status of an interview
 */

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import type { InterviewStatusResponse } from '@/lib/firebase/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;

    // Get interview document
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

    // Build response based on status
    const response: InterviewStatusResponse = {
      status: interview.status,
    };

    // Include score and breakdown if interview is done
    if (interview.status === 'done') {
      response.score = interview.score;
      response.breakdown = interview.score_breakdown;
    }

    // Include error message if interview failed
    if (interview.status === 'failed') {
      response.error_message = interview.error_message;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error getting interview status:', error);
    return NextResponse.json(
      {
        error: 'Internal Error',
        message: 'Failed to get interview status',
        code: 'internal/error',
      },
      { status: 500 }
    );
  }
}
