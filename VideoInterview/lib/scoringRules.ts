/**
 * Seriosity Score Calculation Rules
 * 
 * This module implements the rule-based scoring system for tenant interviews.
 * Score range: 1-5 (integer)
 * 
 * Scoring Criteria:
 * 1. Answer length > 20 seconds → +1
 * 2. Contains relevant keywords → +1
 * 3. No offensive language → +1
 * 4. Positive/neutral sentiment → +1
 * 5. Complete sentences (not one-word answers) → +1
 */

import { analyzeTextQuality, analyzeSentiment } from './sentimentAnalysis'
import { estimateAudioDuration } from './geminiTranscribe'

/**
 * Relevant keywords that indicate a serious tenant
 * These keywords show the person is thinking about their living situation
 */
const RELEVANT_KEYWORDS = [
  // Employment
  'job',
  'work',
  'working',
  'employed',
  'employment',
  'career',
  'profession',
  'company',
  'office',
  
  // Education
  'study',
  'studying',
  'student',
  'university',
  'college',
  'school',
  'education',
  'degree',
  'course',
  
  // Housing intent
  'stay',
  'staying',
  'live',
  'living',
  'looking for',
  'searching',
  'need',
  'require',
  'apartment',
  'flat',
  'room',
  'place',
  'home',
  
  // Stability indicators
  'long-term',
  'permanent',
  'stable',
  'settle',
  'relocate',
  'move',
  'family',
  'partner',
  'spouse',
  
  // Financial
  'income',
  'salary',
  'afford',
  'budget',
  'rent',
  'payment',
]

/**
 * Check if transcript contains relevant keywords
 * 
 * @param transcript - Transcribed text
 * @returns True if contains at least 2 relevant keywords
 */
function containsRelevantKeywords(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase()
  let keywordCount = 0

  for (const keyword of RELEVANT_KEYWORDS) {
    if (lowerTranscript.includes(keyword)) {
      keywordCount++
    }
  }

  // Require at least 2 relevant keywords for a point
  return keywordCount >= 2
}

/**
 * Calculate Seriosity Score based on transcript
 * 
 * This is the main scoring function that applies all rules.
 * 
 * @param transcript - Transcribed interview text
 * @returns Score (1-5) and detailed breakdown
 */
export function calculateSeriosityScore(transcript: string): {
  score: number
  breakdown: {
    lengthScore: number
    keywordScore: number
    languageScore: number
    sentimentScore: number
    completenessScore: number
  }
  flags: {
    tooShort: boolean
    noKeywords: boolean
    offensive: boolean
    negative: boolean
    incomplete: boolean
  }
  details: {
    estimatedDuration: number
    wordCount: number
    keywordsFound: string[]
    sentimentScore: number
  }
} {
  // Initialize scores
  let lengthScore = 0
  let keywordScore = 0
  let languageScore = 0
  let sentimentScore = 0
  let completenessScore = 0

  // Analyze text quality
  const quality = analyzeTextQuality(transcript)
  const estimatedDuration = estimateAudioDuration(transcript)

  // Rule 1: Answer length > 20 seconds
  // We estimate duration based on word count (avg 150 words/min = 2.5 words/sec)
  if (estimatedDuration > 20) {
    lengthScore = 1
  }

  // Rule 2: Contains relevant keywords
  const lowerTranscript = transcript.toLowerCase()
  const keywordsFound: string[] = []
  
  for (const keyword of RELEVANT_KEYWORDS) {
    if (lowerTranscript.includes(keyword)) {
      keywordsFound.push(keyword)
    }
  }

  if (containsRelevantKeywords(transcript)) {
    keywordScore = 1
  }

  // Rule 3: No offensive language
  if (!quality.containsOffensiveLanguage) {
    languageScore = 1
  }

  // Rule 4: Sentiment is neutral or positive
  if (quality.sentiment.isPositive || quality.sentiment.isNeutral) {
    sentimentScore = 1
  }

  // Rule 5: Complete sentences (not one-word answers)
  if (quality.hasCompleteSentences) {
    completenessScore = 1
  }

  // Calculate total score (1-5)
  const totalScore = lengthScore + keywordScore + languageScore + sentimentScore + completenessScore

  // Ensure score is at least 1
  const finalScore = Math.max(1, totalScore)

  return {
    score: finalScore,
    breakdown: {
      lengthScore,
      keywordScore,
      languageScore,
      sentimentScore,
      completenessScore,
    },
    flags: {
      tooShort: lengthScore === 0,
      noKeywords: keywordScore === 0,
      offensive: languageScore === 0,
      negative: sentimentScore === 0,
      incomplete: completenessScore === 0,
    },
    details: {
      estimatedDuration,
      wordCount: quality.wordCount,
      keywordsFound,
      sentimentScore: quality.sentiment.score,
    },
  }
}

/**
 * Get human-readable explanation of the score
 * 
 * @param score - Seriosity score (1-5)
 * @returns Explanation text
 */
export function getScoreExplanation(score: number): string {
  switch (score) {
    case 5:
      return 'Excellent! Your interview shows strong commitment and professionalism. Landlords will be very interested in your application.'
    case 4:
      return 'Great! Your interview demonstrates good communication and seriousness. You have a strong profile.'
    case 3:
      return 'Good! Your interview is acceptable, but could be improved with more detail and relevant information.'
    case 2:
      return 'Fair. Your interview needs improvement. Try to provide more detailed answers about your situation and plans.'
    case 1:
      return 'Needs improvement. Please provide more detailed, thoughtful answers to help landlords understand your situation better.'
    default:
      return 'Score unavailable.'
  }
}

/**
 * Get improvement suggestions based on flags
 * 
 * @param flags - Scoring flags
 * @returns Array of improvement suggestions
 */
export function getImprovementSuggestions(flags: {
  tooShort: boolean
  noKeywords: boolean
  offensive: boolean
  negative: boolean
  incomplete: boolean
}): string[] {
  const suggestions: string[] = []

  if (flags.tooShort) {
    suggestions.push('Provide longer, more detailed answers (aim for at least 30 seconds per question)')
  }

  if (flags.noKeywords) {
    suggestions.push('Include relevant information about your job, studies, or why you\'re looking for a place')
  }

  if (flags.offensive) {
    suggestions.push('Use professional language throughout your interview')
  }

  if (flags.negative) {
    suggestions.push('Try to maintain a positive or neutral tone when discussing your situation')
  }

  if (flags.incomplete) {
    suggestions.push('Provide complete, well-formed sentences rather than one-word answers')
  }

  return suggestions
}
