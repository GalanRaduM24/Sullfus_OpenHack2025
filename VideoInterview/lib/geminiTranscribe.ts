/**
 * Gemini Audio Transcription Service
 * 
 * Uses Google's Gemini API to transcribe audio from video files.
 * This is more cost-effective than OpenAI Whisper for high-volume applications.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
// IMPORTANT: Never hardcode API keys. Always use environment variables.
function getGeminiAPI() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set')
  }

  return new GoogleGenerativeAI(GEMINI_API_KEY)
}

/**
 * Extract audio from video file
 * 
 * In a production environment, you would use FFmpeg to extract audio.
 * For now, we work directly with the video file since Gemini can handle it.
 * 
 * @param videoPath - Path to the video file
 * @returns Path to extracted audio file (or original video)
 */
export async function extractAudio(videoPath: string): Promise<string> {
  // Gemini API can handle video files directly
  return videoPath
}

/**
 * Transcribe audio from a Buffer (for uploaded files)
 * 
 * This is useful when working with file uploads in Next.js API routes.
 * 
 * @param audioBuffer - Audio file as Buffer
 * @param mimeType - MIME type of the audio file
 * @returns Transcribed text
 */
export async function transcribeAudioBuffer(
  audioBuffer: Buffer,
  mimeType: string = 'audio/webm'
): Promise<string> {
  try {
    const genAI = getGeminiAPI()
    const base64Audio = audioBuffer.toString('base64')

    console.log('Transcribing with Gemini API...')
    console.log('Buffer size:', audioBuffer.length, 'bytes')
    console.log('MIME type:', mimeType)

    // Use Gemini 1.5 Pro for multimodal transcription (supports audio/video)
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro-latest' })

    // Create the prompt for transcription
    const prompt = `
Please transcribe the audio from this recording. 
Provide only the transcription text, without any additional commentary or formatting.
If the audio is unclear or inaudible, indicate that with [inaudible].
`

    // Generate content with the audio file
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType,
        },
      },
      prompt,
    ])

    const response = await result.response
    const transcript = response.text()

    console.log('Transcription received:', transcript.substring(0, 100) + '...')

    // Clean up the transcript
    const cleanedTranscript = transcript.trim()

    if (!cleanedTranscript || cleanedTranscript.length < 10) {
      throw new Error('Transcription failed or audio is too short')
    }

    return cleanedTranscript
  } catch (error) {
    console.error('Error transcribing audio buffer with Gemini:', error)
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
