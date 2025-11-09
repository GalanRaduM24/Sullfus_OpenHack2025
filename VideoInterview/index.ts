/**
 * Video Interview System - Main Export File
 * 
 * Import everything you need from this single file.
 */

// ============= COMPONENTS =============
export { InterviewIntro } from './components/InterviewIntro'
export { InterviewRecorder } from './components/InterviewRecorder'
export { InterviewReview } from './components/InterviewReview'
export { InterviewProcessing } from './components/InterviewProcessing'

// ============= CORE FUNCTIONS =============
export {
  evaluateInterview,
  evaluateInterviewBuffer,
  evaluateInterviewForLandlord,
  type InterviewEvaluationResult,
} from './lib/evaluateInterview'

export {
  extractAudio,
  transcribeAudio,
  transcribeAudioBuffer,
  estimateAudioDuration,
} from './lib/geminiTranscribe'

export {
  calculateSeriosityScore,
  getScoreExplanation,
  getImprovementSuggestions,
} from './lib/scoringRules'

export {
  analyzeSentiment,
  containsOffensiveLanguage,
  hasCompleteSentences,
  analyzeTextQuality,
} from './lib/sentimentAnalysis'

// ============= EXAMPLE FLOWS =============
export {
  VideoInterviewFlow,
  SimpleInterviewButton,
} from './INTEGRATION_EXAMPLE'

// ============= TYPE DEFINITIONS =============

/**
 * Interview step in the flow
 */
export type InterviewStep = 'intro' | 'record' | 'review' | 'processing' | 'complete'

/**
 * Recording mode
 */
export type RecordingMode = 'video' | 'audio'

/**
 * Interview status
 */
export type InterviewStatus = 'started' | 'done' | 'failed'

/**
 * Seriosity score breakdown
 */
export interface ScoreBreakdown {
  lengthScore: number
  keywordScore: number
  languageScore: number
  sentimentScore: number
  completenessScore: number
}

/**
 * Interview flags (tenant-only)
 */
export interface InterviewFlags {
  tooShort: boolean
  noKeywords: boolean
  offensive: boolean
  negative: boolean
  incomplete: boolean
}

/**
 * Interview details
 */
export interface InterviewDetails {
  estimatedDuration: number
  wordCount: number
  keywordsFound: string[]
  sentimentScore: number
}

/**
 * Complete interview data
 */
export interface InterviewData {
  id: string
  tenant_id: string
  status: InterviewStatus
  video_url: string
  transcript: string
  score: number
  score_breakdown: ScoreBreakdown
  score_explanation: string
  details: InterviewDetails
  created_at: Date
  completed_at?: Date
  updated_at: Date
}

// ============= CONSTANTS =============

/**
 * Default maximum recording duration (seconds)
 */
export const DEFAULT_MAX_DURATION = 120 // 2 minutes

/**
 * Minimum answer length for scoring (seconds)
 */
export const MIN_ANSWER_LENGTH = 20

/**
 * Score thresholds
 */
export const SCORE_THRESHOLDS = {
  EXCELLENT: 5,
  GREAT: 4,
  GOOD: 3,
  FAIR: 2,
  POOR: 1,
} as const

/**
 * Response rate multiplier for completed interviews
 */
export const RESPONSE_RATE_MULTIPLIER = 5

// ============= UTILITY FUNCTIONS =============

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get score color for UI display
 */
export function getScoreColor(score: number): string {
  if (score >= 4) return 'text-green-600'
  if (score >= 3) return 'text-blue-600'
  if (score >= 2) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get score badge variant
 */
export function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 4) return 'default'
  if (score >= 2) return 'secondary'
  return 'destructive'
}

/**
 * Check if interview is complete
 */
export function isInterviewComplete(interview: Partial<InterviewData>): boolean {
  return interview.status === 'done' && !!interview.score && !!interview.transcript
}

/**
 * Calculate estimated cost for interview
 */
export function estimateInterviewCost(durationSeconds: number): number {
  // Gemini API: ~$0.00025 per 1K characters
  // Average: 150 words/min = 2.5 words/sec = ~15 chars/sec
  const estimatedChars = durationSeconds * 15
  const costPerChar = 0.00025 / 1000
  return estimatedChars * costPerChar
}

// ============= VALIDATION =============

/**
 * Validate video file
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['video/webm', 'video/mp4', 'audio/webm', 'audio/mp3', 'audio/wav']
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Accepted types: ${validTypes.join(', ')}`,
    }
  }

  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
    }
  }

  return { valid: true }
}

/**
 * Validate interview ID format
 */
export function validateInterviewId(id: string): boolean {
  // Format: interview_{tenantId}_{timestamp}
  const pattern = /^interview_[a-zA-Z0-9]+_\d+$/
  return pattern.test(id)
}

// ============= HOOKS (for React) =============

/**
 * Hook to manage interview state
 * 
 * Usage:
 * const interview = useInterview()
 * interview.start()
 * interview.record(blob)
 * interview.upload()
 */
export function useInterview() {
  // This would be implemented in a React hook file
  // Placeholder for documentation purposes
  throw new Error('useInterview hook not implemented. See INTEGRATION_EXAMPLE.tsx for usage.')
}

// ============= DOCUMENTATION =============

/**
 * Quick Start Guide
 * 
 * 1. Install dependencies:
 *    npm install @google/generative-ai sentiment
 * 
 * 2. Set environment variable:
 *    GEMINI_API_KEY=your_api_key
 * 
 * 3. Import and use:
 *    import { VideoInterviewFlow } from './VideoInterview'
 *    <VideoInterviewFlow />
 * 
 * For detailed documentation, see:
 * - README.md - Feature overview
 * - SETUP_GUIDE.md - Installation guide
 * - INTEGRATION_EXAMPLE.tsx - Usage examples
 * - IMPLEMENTATION_SUMMARY.md - Technical details
 */

export const DOCUMENTATION = {
  readme: './README.md',
  setup: './SETUP_GUIDE.md',
  examples: './INTEGRATION_EXAMPLE.tsx',
  summary: './IMPLEMENTATION_SUMMARY.md',
  comparison: './COMPARISON.md',
} as const
