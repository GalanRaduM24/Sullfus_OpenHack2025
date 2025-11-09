/**
 * Main Interview Evaluation Function
 * 
 * This is the primary entry point for evaluating a tenant interview video.
 * It orchestrates the entire pipeline:
 * 1. Extract audio from video
 * 2. Transcribe using Gemini API
 * 3. Calculate Seriosity Score
 * 4. Return results
 */

import { transcribeAudioBuffer, estimateAudioDuration } from './openaiTranscribe'
import { calculateSeriosityScore, getScoreExplanation, getImprovementSuggestions } from './scoringRules'

/**
 * Interview evaluation result
 */
export interface InterviewEvaluationResult {
  transcript: string
  score: number
  scoreExplanation: string
  breakdown: {
    lengthScore: number
    keywordScore: number
    languageScore: number
    sentimentScore: number
    completenessScore: number
  }
  flags?: {
    tooShort: boolean
    noKeywords: boolean
    offensive: boolean
    negative: boolean
    incomplete: boolean
  }
  suggestions?: string[]
  details: {
    estimatedDuration: number
    wordCount: number
    keywordsFound: string[]
    sentimentScore: number
  }
}

/**
 * Evaluate a tenant interview video
 * 
 * Note: This function is deprecated. Use evaluateInterviewBuffer instead.
 * Kept for backwards compatibility.
 * 
 * @param videoPath - Path or URL to the video file
 * @returns Evaluation result with transcript and score
 */
export async function evaluateInterview(
  videoPath: string
): Promise<InterviewEvaluationResult> {
  throw new Error('evaluateInterview is deprecated. Use evaluateInterviewBuffer for file uploads.')
}

/**
 * Evaluate interview from a Buffer (for uploaded files)
 * 
 * This version is useful for Next.js API routes where you receive
 * file uploads as Buffers.
 * 
 * @param videoBuffer - Video file as Buffer
 * @param mimeType - MIME type of the video file
 * @returns Evaluation result with transcript and score
 */
export async function evaluateInterviewBuffer(
  videoBuffer: Buffer,
  mimeType: string = 'video/webm'
): Promise<InterviewEvaluationResult> {
  try {
    console.log('Starting interview evaluation from buffer...')
    console.log('Buffer size:', videoBuffer.length, 'bytes')
    console.log('MIME type:', mimeType)

    // Step 1: Transcribe audio using OpenAI Whisper API
    // Whisper can handle video files directly, no need to extract audio
    console.log('Transcribing audio with OpenAI Whisper...')
    const transcript = await transcribeAudioBuffer(videoBuffer, mimeType)
    console.log('Transcription complete. Length:', transcript.length, 'characters')

    // Step 2: Calculate Seriosity Score
    console.log('Calculating Seriosity Score...')
    const scoreResult = calculateSeriosityScore(transcript)

    // Step 3: Generate explanation and suggestions
    const scoreExplanation = getScoreExplanation(scoreResult.score)
    const suggestions = getImprovementSuggestions(scoreResult.flags)

    console.log('Evaluation complete. Score:', scoreResult.score)

    // Return complete result
    return {
      transcript,
      score: scoreResult.score,
      scoreExplanation,
      breakdown: scoreResult.breakdown,
      flags: scoreResult.flags,
      suggestions,
      details: scoreResult.details,
    }
  } catch (error) {
    console.error('Error evaluating interview from buffer:', error)
    throw new Error(
      `Interview evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Evaluate interview for landlord view
 * 
 * This version returns only the information that should be visible to landlords.
 * It excludes detailed flags and suggestions (tenant-only information).
 * 
 * @param videoPath - Path or URL to the video file
 * @returns Landlord-safe evaluation result
 */
export async function evaluateInterviewForLandlord(
  videoPath: string
): Promise<Omit<InterviewEvaluationResult, 'flags' | 'suggestions'>> {
  const fullResult = await evaluateInterview(videoPath)

  // Return only landlord-visible information
  return {
    transcript: fullResult.transcript,
    score: fullResult.score,
    scoreExplanation: fullResult.scoreExplanation,
    breakdown: fullResult.breakdown,
    details: fullResult.details,
  }
}
