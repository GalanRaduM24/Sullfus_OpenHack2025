/**
 * Sentiment Analysis Module
 * 
 * Analyzes the sentiment of text to determine if it's positive, negative, or neutral.
 * Uses the 'sentiment' npm package for lightweight analysis.
 */

import Sentiment from 'sentiment'

// Initialize sentiment analyzer
const sentiment = new Sentiment()

/**
 * Analyze sentiment of text
 * 
 * Returns a score:
 * - Positive number = positive sentiment
 * - Negative number = negative sentiment
 * - Zero = neutral sentiment
 * 
 * @param text - Text to analyze
 * @returns Sentiment analysis result
 */
export function analyzeSentiment(text: string): {
  score: number
  comparative: number
  isPositive: boolean
  isNeutral: boolean
  isNegative: boolean
} {
  const result = sentiment.analyze(text)

  return {
    score: result.score,
    comparative: result.comparative,
    isPositive: result.score > 0,
    isNeutral: result.score === 0,
    isNegative: result.score < 0,
  }
}

/**
 * Check if text contains offensive language
 * 
 * This is a simple implementation. In production, you might want to use
 * a more sophisticated profanity filter or content moderation API.
 * 
 * @param text - Text to check
 * @returns True if offensive language detected
 */
export function containsOffensiveLanguage(text: string): boolean {
  // Common offensive words (simplified list)
  // In production, use a comprehensive profanity filter library
  const offensiveWords = [
    'fuck',
    'shit',
    'damn',
    'bitch',
    'asshole',
    'bastard',
    'crap',
    'piss',
    // Add more as needed
  ]

  const lowerText = text.toLowerCase()

  // Check for offensive words
  for (const word of offensiveWords) {
    // Use word boundaries to avoid false positives
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lowerText)) {
      return true
    }
  }

  return false
}

/**
 * Check if text contains complete sentences
 * 
 * Determines if the response is well-formed with complete sentences
 * rather than one-word or fragmented answers.
 * 
 * @param text - Text to check
 * @returns True if contains complete sentences
 */
export function hasCompleteSentences(text: string): boolean {
  // Remove extra whitespace
  const cleaned = text.trim()

  // Check minimum length (at least 20 characters for a complete sentence)
  if (cleaned.length < 20) {
    return false
  }

  // Check for sentence-ending punctuation
  const hasPunctuation = /[.!?]/.test(cleaned)

  // Count words
  const wordCount = cleaned.split(/\s+/).length

  // A complete sentence should have at least 5 words
  const hasEnoughWords = wordCount >= 5

  // Check for common one-word answers
  const oneWordAnswers = ['yes', 'no', 'maybe', 'sure', 'ok', 'okay', 'fine']
  const isOneWord = oneWordAnswers.includes(cleaned.toLowerCase())

  return hasPunctuation && hasEnoughWords && !isOneWord
}

/**
 * Analyze text completeness and quality
 * 
 * Provides a comprehensive analysis of the text quality.
 * 
 * @param text - Text to analyze
 * @returns Quality analysis result
 */
export function analyzeTextQuality(text: string): {
  wordCount: number
  sentenceCount: number
  avgWordsPerSentence: number
  hasCompleteSentences: boolean
  containsOffensiveLanguage: boolean
  sentiment: ReturnType<typeof analyzeSentiment>
} {
  const wordCount = text.split(/\s+/).length
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentenceCount = sentences.length
  const avgWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0

  return {
    wordCount,
    sentenceCount,
    avgWordsPerSentence,
    hasCompleteSentences: hasCompleteSentences(text),
    containsOffensiveLanguage: containsOffensiveLanguage(text),
    sentiment: analyzeSentiment(text),
  }
}
