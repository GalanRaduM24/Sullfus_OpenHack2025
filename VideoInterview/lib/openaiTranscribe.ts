/**
 * OpenAI Whisper Transcription Service
 * 
 * Uses OpenAI's Whisper API to transcribe audio from video files.
 * More reliable than Gemini for audio transcription.
 */

import OpenAI from 'openai'
import { File as OpenAIFile } from 'openai/uploads'

// Initialize OpenAI API
function getOpenAI() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  return new OpenAI({
    apiKey: OPENAI_API_KEY,
  })
}

/**
 * Transcribe audio from a Buffer (for uploaded files)
 * 
 * This is useful when working with file uploads in Next.js API routes.
 * 
 * @param audioBuffer - Audio/Video file as Buffer
 * @param mimeType - MIME type of the file
 * @returns Transcribed text
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  mimeType: string = 'video/webm'
): Promise<string> {
  try {
    const openai = getOpenAI()

    console.log('Transcribing with OpenAI Whisper API...')
    console.log('Buffer size:', audioBuffer.length, 'bytes')
    console.log('MIME type:', mimeType)

    // Convert buffer to File object for OpenAI
    const file = new File([audioBuffer], 'interview.webm', { type: mimeType })

    // Transcribe using Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Specify English for better accuracy
      response_format: 'text',
    })

    console.log('Transcription received:', transcription.substring(0, 100) + '...')

    // Clean up the transcript
    const cleanedTranscript = transcription.trim()

    if (!cleanedTranscript || cleanedTranscript.length < 10) {
      throw new Error('Transcription failed or audio is too short')
    }

    return cleanedTranscript
  } catch (error) {
    console.error('Error transcribing audio buffer with OpenAI Whisper:', error)
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get estimated duration of audio from transcript
 * 
 * Rough estimation: average speaking rate is ~150 words per minute
 * 
 * @param transcript - Transcribed text
 * @returns Estimated duration in seconds
 */
export function estimateAudioDuration(transcript: string): number {
  const wordCount = transcript.split(/\s+/).length
  const wordsPerSecond = 150 / 60 // ~2.5 words per second
  return Math.round(wordCount / wordsPerSecond)
}
