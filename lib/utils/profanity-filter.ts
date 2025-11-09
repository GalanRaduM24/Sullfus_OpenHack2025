// Profanity filter utility
// This is a basic implementation. For production, consider using a library like 'bad-words' or an API service

const PROFANITY_LIST = [
  // Add profanity words here
  // This is a minimal list for demonstration
  'badword1',
  'badword2',
  'offensive',
  // Add more as needed
]

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  
  return PROFANITY_LIST.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    return regex.test(lowerText)
  })
}

/**
 * Filter profanity from text by replacing with asterisks
 */
export function filterProfanity(text: string): string {
  let filteredText = text
  
  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const replacement = '*'.repeat(word.length)
    filteredText = filteredText.replace(regex, replacement)
  })
  
  return filteredText
}

/**
 * Get list of profane words found in text
 */
export function findProfanity(text: string): string[] {
  const lowerText = text.toLowerCase()
  const found: string[] = []
  
  PROFANITY_LIST.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i')
    if (regex.test(lowerText)) {
      found.push(word)
    }
  })
  
  return found
}

/**
 * Calculate profanity severity score (0-1)
 */
export function getProfanitySeverity(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  const profaneWords = findProfanity(text)
  
  if (profaneWords.length === 0) return 0
  
  // Calculate ratio of profane words to total words
  const ratio = profaneWords.length / words.length
  
  // Return a score between 0 and 1
  return Math.min(1, ratio * 2)
}

/**
 * Check if message should be auto-flagged for moderation
 */
export function shouldFlagMessage(text: string): boolean {
  const severity = getProfanitySeverity(text)
  const profaneWords = findProfanity(text)
  
  // Flag if severity is high or contains multiple profane words
  return severity > 0.3 || profaneWords.length >= 3
}
