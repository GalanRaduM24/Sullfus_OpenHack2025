/**
 * Interview Processing Service
 * Handles the complete interview processing pipeline:
 * 1. Extract audio from video
 * 2. Transcribe audio using Whisper
 * 3. Analyze transcript with GPT-4
 * 4. Calculate Seriosity Score
 * 5. Update tenant profile
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import { transcribeAudio, analyzeInterviewTranscript } from './openai.service';
import { calculateSeriosityScore } from '@/lib/utils/seriosity-score';
import type { Interview, TenantProfile, InterviewQuestion } from '@/lib/firebase/types';

/**
 * Main function to process a completed interview
 */
export async function processInterview(interviewId: string): Promise<void> {
  console.log(`Starting interview processing for: ${interviewId}`);

  try {
    // 1. Get interview data
    const interviewRef = doc(db, COLLECTIONS.INTERVIEWS, interviewId);
    const interviewSnap = await getDoc(interviewRef);

    if (!interviewSnap.exists()) {
      throw new Error('Interview not found');
    }

    const interview = interviewSnap.data() as Interview;

    // 2. Get tenant profile for context
    const tenantRef = doc(db, COLLECTIONS.TENANT_PROFILES, interview.tenant_id);
    const tenantSnap = await getDoc(tenantRef);

    if (!tenantSnap.exists()) {
      throw new Error('Tenant profile not found');
    }

    const tenantProfile = tenantSnap.data() as TenantProfile;

    // 3. Process each question and transcribe
    const transcripts: string[] = [];
    const processedQuestions: InterviewQuestion[] = [];

    for (const question of interview.questions) {
      try {
        const transcript = await transcribeQuestion(question);
        transcripts.push(transcript);

        processedQuestions.push({
          ...question,
          transcript,
        });
      } catch (error) {
        console.error(`Error transcribing question ${question.question_id}:`, error);
        // Continue with other questions even if one fails
        processedQuestions.push({
          ...question,
          transcript: question.text_answer || '[Transcription failed]',
        });
      }
    }

    // 4. Combine all transcripts
    const fullTranscript = transcripts.join('\n\n');

    // 5. Analyze transcript with GPT-4
    const analysis = await analyzeInterviewTranscript(fullTranscript, {
      name: tenantProfile.name,
      age: tenantProfile.age,
      profession: tenantProfile.profession,
    });

    // 6. Calculate Seriosity Score
    const scoreResult = await calculateSeriosityScore(
      tenantProfile,
      {
        ...interview,
        raw_response: {
          full_transcript: fullTranscript,
          extracted_entities: analysis.extractedEntities,
          clarity_score: analysis.clarityScore,
          consistency_score: analysis.consistencyScore,
          evasiveness_detected: analysis.evasivenessDetected,
        },
      }
    );

    // 7. Update interview with results
    await updateDoc(interviewRef, {
      status: 'done',
      questions: processedQuestions,
      raw_response: {
        full_transcript: fullTranscript,
        extracted_entities: analysis.extractedEntities,
        clarity_score: analysis.clarityScore,
        consistency_score: analysis.consistencyScore,
        evasiveness_detected: analysis.evasivenessDetected,
      },
      score: scoreResult.score,
      score_breakdown: scoreResult.breakdown,
    });

    // 8. Update tenant profile
    await updateDoc(tenantRef, {
      interview_completed: true,
      interview_id: interviewId,
      verification_status: 'interview_verified',
      seriosity_score: scoreResult.score,
      seriosity_breakdown: scoreResult.breakdown,
      updated_at: new Date(),
    });

    // 9. Send notification to tenant
    // TODO: Implement notification service
    console.log(`Interview processing completed for: ${interviewId}`);
    console.log(`Seriosity Score: ${scoreResult.score}`);
  } catch (error) {
    console.error('Error processing interview:', error);
    throw error;
  }
}

/**
 * Transcribe a single interview question
 */
async function transcribeQuestion(question: InterviewQuestion): Promise<string> {
  // If text answer is provided, use it directly
  if (question.text_answer) {
    return question.text_answer;
  }

  // Determine which file to transcribe (prefer audio, fallback to video)
  const fileUrl = question.audio_url || question.video_url;

  if (!fileUrl) {
    throw new Error('No audio or video file found for question');
  }

  try {
    // Download the file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();

    // If it's a video file, we would need to extract audio first
    // For now, we'll assume the file is already audio or the Whisper API can handle it
    // In production, you might want to use FFmpeg to extract audio from video

    // Create a File object for the Whisper API
    const file = new File([blob], 'audio.webm', { type: blob.type });

    // Transcribe using Whisper
    const transcript = await transcribeAudio(file);

    return transcript;
  } catch (error) {
    console.error('Error transcribing question:', error);
    throw error;
  }
}

/**
 * Extract audio from video file (placeholder)
 * In production, this would use FFmpeg or a similar tool
 */
async function extractAudioFromVideo(videoBlob: Blob): Promise<Blob> {
  // This is a placeholder implementation
  // In production, you would:
  // 1. Use FFmpeg.wasm in the browser
  // 2. Or send to a server-side service that has FFmpeg installed
  // 3. Or use a cloud service like AWS MediaConvert

  // For now, we'll just return the video blob and let Whisper handle it
  // Whisper API can actually handle video files directly
  return videoBlob;
}

/**
 * Download file from Firebase Storage
 */
async function downloadFile(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  return response.blob();
}
