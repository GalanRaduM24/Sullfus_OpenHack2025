// Shared Firebase functions for matches
// Used by both tenant and landlord interfaces

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  or,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export interface Match {
  id?: string
  tenantId: string
  landlordId: string
  propertyId: string
  status: 'matched' | 'chatting' | 'closed'
  tenantLiked: boolean
  landlordLiked: boolean
  createdAt?: any
  updatedAt?: any
}

/**
 * Create a like (tenant likes property or landlord likes tenant)
 */
export async function createLike(
  tenantId: string,
  landlordId: string,
  propertyId: string,
  likedBy: 'tenant' | 'landlord'
): Promise<Match | null> {
  try {
    // Check if a match already exists
    const matchesRef = collection(db, 'matches')
    const existingMatchQuery = query(
      matchesRef,
      where('tenantId', '==', tenantId),
      where('landlordId', '==', landlordId),
      where('propertyId', '==', propertyId)
    )
    const existingMatches = await getDocs(existingMatchQuery)
    
    if (!existingMatches.empty) {
      // Update existing match
      const matchDoc = existingMatches.docs[0]
      const matchData = matchDoc.data() as Match
      
      const updateData: any = {
        [`${likedBy}Liked`]: true,
        updatedAt: serverTimestamp(),
      }
      
      // If both liked, create a match
      if (
        (likedBy === 'tenant' && matchData.landlordLiked) ||
        (likedBy === 'landlord' && matchData.tenantLiked)
      ) {
        updateData.status = 'matched'
      }
      
      await updateDoc(doc(db, 'matches', matchDoc.id), updateData)
      return { id: matchDoc.id, ...matchData, ...updateData } as Match
    } else {
      // Create new like record
      const newMatchData: Omit<Match, 'id'> = {
        tenantId,
        landlordId,
        propertyId,
        status: 'matched', // Will be updated if mutual
        tenantLiked: likedBy === 'tenant',
        landlordLiked: likedBy === 'landlord',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      
      const docRef = await addDoc(matchesRef, newMatchData)
      return { id: docRef.id, ...newMatchData } as Match
    }
  } catch (error) {
    console.error('Error creating like:', error)
    throw error
  }
}

/**
 * Get matches for a user (tenant or landlord)
 */
export async function getMatches(userId: string, role: 'tenant' | 'landlord'): Promise<Match[]> {
  try {
    const matchesRef = collection(db, 'matches')
    const field = role === 'tenant' ? 'tenantId' : 'landlordId'
    const q = query(
      matchesRef,
      where(field, '==', userId),
      where('status', '==', 'matched')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Match[]
  } catch (error) {
    console.error('Error getting matches:', error)
    throw error
  }
}

/**
 * Get a specific match
 */
export async function getMatch(matchId: string): Promise<Match | null> {
  try {
    const matchRef = doc(db, 'matches', matchId)
    const matchSnap = await getDoc(matchRef)
    
    if (matchSnap.exists()) {
      return { id: matchSnap.id, ...matchSnap.data() } as Match
    }
    return null
  } catch (error) {
    console.error('Error getting match:', error)
    throw error
  }
}

/**
 * Update match status
 */
export async function updateMatchStatus(
  matchId: string,
  status: Match['status']
): Promise<void> {
  try {
    const matchRef = doc(db, 'matches', matchId)
    await updateDoc(matchRef, {
      status,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating match status:', error)
    throw error
  }
}

