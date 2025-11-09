/**
 * Landlord Profile Score System
 * Calculate landlord reputation score based on profile completeness and quality
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface LandlordScoreBreakdown {
  total: number;
  maxPossible: number;
  percentage: number;
  breakdown: {
    profileCompletion: number;
    idVerification: number;
    propertyQuality: number;
    descriptionQuality: number;
  };
  details: {
    hasName: boolean;
    hasAge: boolean;
    hasDescription: boolean;
    descriptionIsQuality: boolean;
    hasIdCard: boolean;
    idCardVerified: boolean;
    propertyCount: number;
    averagePropertyScore: number;
  };
  badge: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface PropertyScoreBreakdown {
  total: number;
  maxPossible: number;
  percentage: number;
  breakdown: {
    basicInfo: number;
    detailedInfo: number;
    location: number;
    media: number;
    amenities: number;
  };
  details: {
    hasTitle: boolean;
    hasDescription: boolean;
    hasPrice: boolean;
    hasLocation: boolean;
    hasAreaDetails: boolean;
    hasFloorInfo: boolean;
    hasYearBuilt: boolean;
    hasImages: number;
    hasVideo: boolean;
    amenityCount: number;
  };
}

/**
 * Analyze description quality using Gemini AI
 */
export async function analyzeDescriptionQuality(description: string): Promise<{
  isQuality: boolean;
  score: number;
  feedback: string;
}> {
  if (!genAI || !description || description.length < 20) {
    return {
      isQuality: false,
      score: 0,
      feedback: 'Description too short or AI not configured',
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this landlord/property description and rate its quality:

"${description}"

Evaluate based on:
1. Is it a genuine, thoughtful description (not generic/template)?
2. Does it provide useful information?
3. Is it professional and well-written?
4. Does it seem authentic (not spam/joke)?

Respond with JSON only:
{
  "isQuality": true/false,
  "score": 0-100,
  "feedback": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        isQuality: analysis.isQuality && analysis.score >= 60,
        score: analysis.score,
        feedback: analysis.feedback,
      };
    }

    // Fallback: basic checks
    return fallbackDescriptionAnalysis(description);
  } catch (error) {
    console.error('Error analyzing description:', error);
    return fallbackDescriptionAnalysis(description);
  }
}

/**
 * Fallback description analysis without AI
 */
function fallbackDescriptionAnalysis(description: string): {
  isQuality: boolean;
  score: number;
  feedback: string;
} {
  const length = description.length;
  const wordCount = description.split(/\s+/).length;
  const hasCapitalization = /[A-Z]/.test(description);
  const hasPunctuation = /[.!?,;:]/.test(description);

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (length >= 100) {
    score += 30;
    feedback.push('Good length');
  } else if (length >= 50) {
    score += 15;
    feedback.push('Acceptable length');
  } else {
    feedback.push('Too short');
  }

  // Word count
  if (wordCount >= 20) {
    score += 20;
  } else if (wordCount >= 10) {
    score += 10;
  }

  // Formatting
  if (hasCapitalization) score += 10;
  if (hasPunctuation) score += 10;

  // Sentence structure
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 3) {
    score += 20;
    feedback.push('Well structured');
  }

  // Check for spam patterns
  const spamPatterns = /test|asdf|qwerty|12345|lorem ipsum/i;
  if (spamPatterns.test(description)) {
    score = Math.max(0, score - 50);
    feedback.push('Contains spam-like content');
  }

  return {
    isQuality: score >= 50,
    score,
    feedback: feedback.join(', '),
  };
}

/**
 * Calculate landlord profile score
 */
export async function calculateLandlordScore(profileData: {
  name?: string;
  age?: number;
  description?: string;
  idVerificationStatus?: 'not_verified' | 'pending' | 'verified' | 'rejected';
  properties?: any[];
}): Promise<LandlordScoreBreakdown> {
  const breakdown = {
    profileCompletion: 0,
    idVerification: 0,
    propertyQuality: 0,
    descriptionQuality: 0,
  };

  const details = {
    hasName: !!profileData.name,
    hasAge: !!profileData.age,
    hasDescription: !!profileData.description,
    descriptionIsQuality: false,
    hasIdCard: profileData.idVerificationStatus !== 'not_verified',
    idCardVerified: profileData.idVerificationStatus === 'verified',
    propertyCount: profileData.properties?.length || 0,
    averagePropertyScore: 0,
  };

  // 1. Basic Profile Completion (30 points max)
  if (details.hasName) breakdown.profileCompletion += 10;
  if (details.hasAge) breakdown.profileCompletion += 10;
  if (details.hasDescription) breakdown.profileCompletion += 10;

  // 2. Description Quality (20 points max)
  if (profileData.description) {
    const descAnalysis = await analyzeDescriptionQuality(profileData.description);
    details.descriptionIsQuality = descAnalysis.isQuality;
    breakdown.descriptionQuality = Math.round((descAnalysis.score / 100) * 20);
  }

  // 3. ID Verification (30 points max)
  if (details.idCardVerified) {
    breakdown.idVerification = 30;
  } else if (details.hasIdCard) {
    breakdown.idVerification = 10; // Pending
  }

  // 4. Property Quality (20 points max)
  if (profileData.properties && profileData.properties.length > 0) {
    const propertyScores = profileData.properties.map(property =>
      calculatePropertyScore(property).total
    );
    const avgScore = propertyScores.reduce((a, b) => a + b, 0) / propertyScores.length;
    details.averagePropertyScore = Math.round(avgScore);
    breakdown.propertyQuality = Math.round((avgScore / 100) * 20);
  }

  const total =
    breakdown.profileCompletion +
    breakdown.descriptionQuality +
    breakdown.idVerification +
    breakdown.propertyQuality;

  const maxPossible = 100;
  const percentage = Math.round((total / maxPossible) * 100);

  // Determine badge
  let badge: 'bronze' | 'silver' | 'gold' | 'platinum';
  if (percentage >= 90) badge = 'platinum';
  else if (percentage >= 75) badge = 'gold';
  else if (percentage >= 50) badge = 'silver';
  else badge = 'bronze';

  return {
    total,
    maxPossible,
    percentage,
    breakdown,
    details,
    badge,
  };
}

/**
 * Calculate property listing score
 */
export function calculatePropertyScore(propertyData: {
  title?: string;
  description?: string;
  price?: number;
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  area?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  images?: string[];
  videoUrl?: string;
  amenities?: string[];
  bedrooms?: number;
  bathrooms?: number;
}): PropertyScoreBreakdown {
  const breakdown = {
    basicInfo: 0,
    detailedInfo: 0,
    location: 0,
    media: 0,
    amenities: 0,
  };

  const details = {
    hasTitle: !!propertyData.title,
    hasDescription: !!propertyData.description,
    hasPrice: !!propertyData.price,
    hasLocation: !!(propertyData.location?.address),
    hasAreaDetails: !!propertyData.area,
    hasFloorInfo: !!(propertyData.floor !== undefined && propertyData.totalFloors),
    hasYearBuilt: !!propertyData.yearBuilt,
    hasImages: propertyData.images?.length || 0,
    hasVideo: !!propertyData.videoUrl,
    amenityCount: propertyData.amenities?.length || 0,
  };

  // 1. Basic Info (25 points max)
  if (details.hasTitle) breakdown.basicInfo += 8;
  if (details.hasDescription && propertyData.description!.length >= 50) breakdown.basicInfo += 10;
  if (details.hasPrice) breakdown.basicInfo += 7;

  // 2. Detailed Info (25 points max)
  if (details.hasAreaDetails) breakdown.detailedInfo += 8;
  if (details.hasFloorInfo) breakdown.detailedInfo += 7;
  if (details.hasYearBuilt) breakdown.detailedInfo += 5;
  if (propertyData.bedrooms) breakdown.detailedInfo += 3;
  if (propertyData.bathrooms) breakdown.detailedInfo += 2;

  // 3. Location (20 points max)
  if (details.hasLocation) breakdown.location += 10;
  if (propertyData.location?.lat && propertyData.location?.lng) {
    breakdown.location += 10; // GPS coordinates provided
  }

  // 4. Media (20 points max)
  if (details.hasImages > 0) {
    const imageScore = Math.min(details.hasImages * 3, 15); // Max 15 points for images
    breakdown.media += imageScore;
  }
  if (details.hasVideo) breakdown.media += 5;

  // 5. Amenities (10 points max)
  if (details.amenityCount > 0) {
    const amenityScore = Math.min(details.amenityCount * 2, 10);
    breakdown.amenities += amenityScore;
  }

  const total =
    breakdown.basicInfo +
    breakdown.detailedInfo +
    breakdown.location +
    breakdown.media +
    breakdown.amenities;

  const maxPossible = 100;
  const percentage = Math.round((total / maxPossible) * 100);

  return {
    total,
    maxPossible,
    percentage,
    breakdown,
    details,
  };
}

/**
 * Get badge color and label
 */
export function getBadgeInfo(badge: 'bronze' | 'silver' | 'gold' | 'platinum') {
  const badges = {
    bronze: {
      color: 'bg-amber-700',
      label: 'Bronze',
      icon: '🥉',
    },
    silver: {
      color: 'bg-gray-400',
      label: 'Silver',
      icon: '🥈',
    },
    gold: {
      color: 'bg-yellow-500',
      label: 'Gold',
      icon: '🥇',
    },
    platinum: {
      color: 'bg-gradient-to-r from-purple-500 to-blue-500',
      label: 'Platinum',
      icon: '💎',
    },
  };

  return badges[badge];
}
