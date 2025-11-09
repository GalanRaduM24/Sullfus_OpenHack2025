/**
 * POST /api/interviews/start
 * Initialize a new interview session for a tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { INTERVIEW_QUESTIONS } from '@/lib/firebase/types';
import type { StartInterviewRequest, StartInterviewResponse } from '@/lib/firebase/types';

export async function POST(request: NextRequest) {
  try {
    const body: StartInterviewRequest = await request.json();
    const { tenant_id } = body;

    // Validate required fields
    if (!tenant_id) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'tenant_id is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      );
    }

    // Generate interview ID
    const interviewId = `interview_${tenant_id}_${Date.now()}`;

    // Create interview document
    const interviewData = {
      id: interviewId,
      tenant_id,
      started_at: Timestamp.now(),
      status: 'started' as const,
      questions: [],
    };

    // Save to Firestore
    const interviewRef = doc(db, COLLECTIONS.INTERVIEWS, interviewId);
    await setDoc(interviewRef, interviewData);

    // Return interview ID and questions
    const response: StartInterviewResponse = {
      interview_id: interviewId,
      questions: INTERVIEW_QUESTIONS.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        duration: q.duration,
      })),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error starting interview:', error);
    return NextResponse.json(
      {
        error: 'Internal Error',
        message: 'Failed to start interview',
        code: 'internal/error',
      },
      { status: 500 }
    );
  }
}
