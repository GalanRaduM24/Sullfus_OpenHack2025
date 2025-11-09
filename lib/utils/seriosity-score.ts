/**
 * Seriosity Score Calculation Engine
 * Calculates a tenant's Seriosity Score (0-100) based on multiple factors
 */

import type { TenantProfile, Interview, SeriosityBreakdown } from '@/lib/firebase/types';

/**
 * Calculate the Seriosity Score for a tenant
 * 
 * Score Components:
 * - ID Verification: 0 or 15 points
 * - Income Proof: 0-25 points
 * - Interview Clarity: 0-20 points
 * - Response Consistency: 0-15 points
 * - App Responsiveness: 0-15 points
 * - References: 0-10 points
 * 
 * Total: 0-100 points
 */
export async function calculateSeriosityScore(
  tenantProfile: TenantProfile,
  interview: Interview
): Promise<{
  score: number;
  breakdown: SeriosityBreakdown;
}> {
  const breakdown: SeriosityBreakdown = {
    id_verified: 0,
    income_proof: 0,
    interview_clarity: 0,
    response_consistency: 0,
    responsiveness: 0,
    references: 0,
  };

  // 1. ID Verification (15 points)
  breakdown.id_verified = calculateIDVerificationScore(tenantProfile);

  // 2. Income Proof (0-25 points)
  breakdown.income_proof = calculateIncomeProofScore(tenantProfile);

  // 3. Interview Clarity (0-20 points)
  breakdown.interview_clarity = calculateInterviewClarityScore(interview);

  // 4. Response Consistency (0-15 points)
  breakdown.response_consistency = calculateConsistencyScore(interview);

  // 5. App Responsiveness (0-15 points)
  breakdown.responsiveness = calculateResponsivenessScore(tenantProfile);

  // 6. References (0-10 points)
  breakdown.references = calculateReferencesScore(tenantProfile);

  // Calculate total score
  const totalScore = Math.min(
    100,
    breakdown.id_verified +
      breakdown.income_proof +
      breakdown.interview_clarity +
      breakdown.response_consistency +
      breakdown.responsiveness +
      breakdown.references
  );

  return {
    score: Math.round(totalScore),
    breakdown,
  };
}

/**
 * Calculate ID verification score (0 or 15 points)
 */
function calculateIDVerificationScore(profile: TenantProfile): number {
  if (profile.id_verification_status === 'verified') {
    return 15;
  }
  return 0;
}

/**
 * Calculate income proof score (0-25 points)
 * - No income proof: 0 points
 * - 1 document uploaded: 15 points
 * - 1 verified document: 20 points
 * - 2+ verified documents: 25 points
 */
function calculateIncomeProofScore(profile: TenantProfile): number {
  const incomeProofDocs = profile.documents?.income_proof || [];

  if (incomeProofDocs.length === 0) {
    return 0;
  }

  const verifiedDocs = incomeProofDocs.filter(doc => doc.verified);

  if (verifiedDocs.length >= 2) {
    return 25;
  }

  if (verifiedDocs.length === 1) {
    return 20;
  }

  // Has documents but not verified yet
  return 15;
}

/**
 * Calculate interview clarity score (0-20 points)
 * Based on AI analysis of how clear and articulate the responses are
 */
function calculateInterviewClarityScore(interview: Interview): number {
  if (!interview.raw_response?.clarity_score) {
    return 0;
  }

  // Convert 0-1 score to 0-20 points
  const clarityPoints = Math.round(interview.raw_response.clarity_score * 20);

  // Penalize if evasiveness is detected
  if (interview.raw_response.evasiveness_detected) {
    return Math.max(0, clarityPoints - 5);
  }

  return clarityPoints;
}

/**
 * Calculate response consistency score (0-15 points)
 * Based on AI analysis of internal consistency and alignment with profile
 */
function calculateConsistencyScore(interview: Interview): number {
  if (!interview.raw_response?.consistency_score) {
    return 0;
  }

  // Convert 0-1 score to 0-15 points
  return Math.round(interview.raw_response.consistency_score * 15);
}

/**
 * Calculate app responsiveness score (0-15 points)
 * Based on how quickly the tenant completes profile and interview
 * 
 * Factors:
 * - Profile completion speed
 * - Interview completion speed
 * - Time between registration and interview
 */
function calculateResponsivenessScore(profile: TenantProfile): number {
  let score = 0;

  // Base score for completing the interview
  if (profile.interview_completed) {
    score += 5;
  }

  // Calculate time from profile creation to interview completion
  if (profile.created_at && profile.updated_at) {
    const createdTime = profile.created_at.toMillis();
    const updatedTime = profile.updated_at.toMillis();
    const daysDiff = (updatedTime - createdTime) / (1000 * 60 * 60 * 24);

    // Award points based on speed
    if (daysDiff <= 1) {
      score += 10; // Completed within 1 day
    } else if (daysDiff <= 3) {
      score += 7; // Completed within 3 days
    } else if (daysDiff <= 7) {
      score += 5; // Completed within 1 week
    } else {
      score += 2; // Took longer than a week
    }
  }

  return Math.min(15, score);
}

/**
 * Calculate references score (0-10 points)
 * - 1 reference: 5 points
 * - 2+ references: 10 points
 */
function calculateReferencesScore(profile: TenantProfile): number {
  const references = profile.documents?.references || [];

  if (references.length === 0) {
    return 0;
  }

  if (references.length === 1) {
    return 5;
  }

  return 10;
}

/**
 * Get a human-readable description of the score
 */
export function getScoreDescription(score: number): string {
  if (score >= 90) {
    return 'Excellent - Highly verified and reliable tenant';
  } else if (score >= 75) {
    return 'Very Good - Well-verified tenant with strong credentials';
  } else if (score >= 60) {
    return 'Good - Verified tenant with adequate documentation';
  } else if (score >= 45) {
    return 'Fair - Some verification completed, more documentation recommended';
  } else if (score >= 30) {
    return 'Limited - Minimal verification, proceed with caution';
  } else {
    return 'Unverified - Insufficient verification and documentation';
  }
}

/**
 * Get color coding for score display
 */
export function getScoreColor(score: number): string {
  if (score >= 75) {
    return 'green';
  } else if (score >= 60) {
    return 'blue';
  } else if (score >= 45) {
    return 'yellow';
  } else if (score >= 30) {
    return 'orange';
  } else {
    return 'red';
  }
}

/**
 * Get breakdown explanation for each component
 */
export function getBreakdownExplanations(): Record<keyof SeriosityBreakdown, string> {
  return {
    id_verified: 'ID Document Verification (0-15 pts): Verified government-issued ID',
    income_proof: 'Income Proof (0-25 pts): Uploaded and verified income documentation',
    interview_clarity: 'Interview Clarity (0-20 pts): Clear and articulate responses in AI interview',
    response_consistency: 'Response Consistency (0-15 pts): Consistent information across profile and interview',
    responsiveness: 'App Responsiveness (0-15 pts): Speed of completing profile and interview',
    references: 'References (0-10 pts): Number of reference documents provided',
  };
}

/**
 * Calculate what score improvements are possible
 */
export function getScoreImprovementSuggestions(
  profile: TenantProfile,
  breakdown: SeriosityBreakdown
): string[] {
  const suggestions: string[] = [];

  if (breakdown.id_verified === 0) {
    suggestions.push('Complete ID verification to gain 15 points');
  }

  if (breakdown.income_proof < 25) {
    const potentialGain = 25 - breakdown.income_proof;
    suggestions.push(`Upload and verify income proof documents to gain up to ${potentialGain} points`);
  }

  if (breakdown.references < 10) {
    const potentialGain = 10 - breakdown.references;
    suggestions.push(`Add reference documents to gain up to ${potentialGain} points`);
  }

  if (!profile.interview_completed) {
    suggestions.push('Complete the AI interview to unlock clarity and consistency points (up to 35 points)');
  }

  return suggestions;
}
