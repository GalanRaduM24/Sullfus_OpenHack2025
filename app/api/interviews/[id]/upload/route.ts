/**
 * POST /api/interviews/:id/upload
 * Upload a question response (video or audio)
 */

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { INTERVIEW_QUESTIONS } from '@/lib/firebase/types';
import type { UploadInterviewQuestionResponse } from '@/lib/firebase/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const interviewId = params.id;
    const formData = await request.formData();

    const questionId = parseInt(formData.get('question_id') as string);
    const videoFile = formData.get('video') as File | null;
    const audioFile = formData.get('audio') as File | null;
    const textAnswer = formData.get('text') as string | null;

    // Validate required fields
    if (!questionId) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'question_id is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      );
    }

    if (!videoFile && !audioFile && !textAnswer) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'At least one of video, audio, or text is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      );
    }

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

    // Check if interview is still in progress
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

    // Find question text
    const questionConfig = INTERVIEW_QUESTIONS.find(q => q.id === questionId);
    if (!questionConfig) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid question_id',
          code: 'validation/invalid-input',
        },
        { status: 400 }
      );
    }

    let videoUrl: string | undefined;
    let audioUrl: string | undefined;

    // Upload video if provided
    if (videoFile) {
      const videoPath = `interviews/${interviewId}/question_${questionId}_video.webm`;
      const videoRef = ref(storage, videoPath);
      await uploadBytes(videoRef, videoFile);
      videoUrl = await getDownloadURL(videoRef);
    }

    // Upload audio if provided
    if (audioFile) {
      const audioPath = `interviews/${interviewId}/question_${questionId}_audio.webm`;
      const audioRef = ref(storage, audioPath);
      await uploadBytes(audioRef, audioFile);
      audioUrl = await getDownloadURL(audioRef);
    }

    // Update interview with question response
    const questionData = {
      question_id: questionId,
      question_text: questionConfig.text,
      video_url: videoUrl,
      audio_url: audioUrl,
      text_answer: textAnswer || undefined,
    };

    await updateDoc(interviewRef, {
      questions: arrayUnion(questionData),
    });

    const response: UploadInterviewQuestionResponse = {
      success: true,
      uploaded_url: videoUrl || audioUrl || '',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error uploading interview question:', error);
    return NextResponse.json(
      {
        error: 'Internal Error',
        message: 'Failed to upload question response',
        code: 'internal/error',
      },
      { status: 500 }
    );
  }
}
