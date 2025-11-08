// Shared Firebase functions for property listings
// Used by both tenant and landlord interfaces

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export interface PropertyListing {
  id?: string
  title: string
  description: string
  price: number
  location: {
    address: string
    lat: number
    lng: number
  }
  images: string[]
  landlordId: string
  rules: {
    petsAllowed: boolean
    smokingAllowed: boolean
    studentsAllowed: boolean
    roommatesAllowed: boolean
  }
  createdAt?: any
  updatedAt?: any
}

/**
 * Get all listings (for tenants to browse)
 */
export async function getAllListings(): Promise<PropertyListing[]> {
  try {
    const listingsRef = collection(db, 'listings')
    const q = query(listingsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as PropertyListing[]
  } catch (error) {
    console.error('Error getting listings:', error)
    throw error
  }
}

/**
 * Get listings by landlord ID
 */
export async function getListingsByLandlord(
  landlordId: string
): Promise<PropertyListing[]> {
  try {
    const listingsRef = collection(db, 'listings')
    const q = query(
      listingsRef,
      where('landlordId', '==', landlordId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as PropertyListing[]
  } catch (error) {
    console.error('Error getting landlord listings:', error)
    throw error
  }
}

/**
 * Get single listing by ID
 */
export async function getListingById(
  listingId: string
): Promise<PropertyListing | null> {
  try {
    const listingRef = doc(db, 'listings', listingId)
    const listingSnap = await getDoc(listingRef)
    
    if (listingSnap.exists()) {
      return { id: listingSnap.id, ...listingSnap.data() } as PropertyListing
    }
    return null
  } catch (error) {
    console.error('Error getting listing:', error)
    throw error
  }
}

/**
 * Create a new listing
 */
export async function createListing(
  listingData: Omit<PropertyListing, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const listingsRef = collection(db, 'listings')
    const docRef = await addDoc(listingsRef, {
      ...listingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating listing:', error)
    throw error
  }
}

/**
 * Update a listing
 */
export async function updateListing(
  listingId: string,
  updateData: Partial<PropertyListing>
): Promise<void> {
  try {
    const listingRef = doc(db, 'listings', listingId)
    await updateDoc(listingRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    throw error
  }
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  try {
    const listingRef = doc(db, 'listings', listingId)
    await deleteDoc(listingRef)
  } catch (error) {
    console.error('Error deleting listing:', error)
    throw error
  }
}

/**
 * Search listings with filters (for tenants)
 */
export async function searchListings(filters: {
  minPrice?: number
  maxPrice?: number
  petsAllowed?: boolean
  location?: string
}): Promise<PropertyListing[]> {
  try {
    let q = query(collection(db, 'listings'), orderBy('price', 'asc'))
    
    // Apply filters
    if (filters.minPrice !== undefined) {
      q = query(q, where('price', '>=', filters.minPrice))
    }
    if (filters.maxPrice !== undefined) {
      q = query(q, where('price', '<=', filters.maxPrice))
    }
    
    const querySnapshot = await getDocs(q)
    let listings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as PropertyListing[]
    
    // Apply additional client-side filters
    if (filters.petsAllowed !== undefined) {
      listings = listings.filter(
        listing => listing.rules.petsAllowed === filters.petsAllowed
      )
    }
    
    return listings
  } catch (error) {
    console.error('Error searching listings:', error)
    throw error
  }
}

