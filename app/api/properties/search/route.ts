import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  startAfter,
  QueryConstraint,
  DocumentSnapshot
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Property, PropertySearchRequest, PropertySearchResponse } from '@/lib/firebase/types'

export async function POST(request: NextRequest) {
  try {
    const body: PropertySearchRequest = await request.json()
    
    const {
      budget_min,
      budget_max,
      locations,
      amenities,
      pets_allowed,
      property_type,
      page = 1,
      limit = 12
    } = body

    // Build Firestore query
    const propertiesRef = collection(db, 'properties')
    const constraints: QueryConstraint[] = []

    // Only show active properties
    constraints.push(where('status', '==', 'active'))

    // Budget filters
    if (budget_min !== undefined) {
      constraints.push(where('price', '>=', budget_min))
    }
    if (budget_max !== undefined) {
      constraints.push(where('price', '<=', budget_max))
    }

    // Order by price for consistent pagination
    constraints.push(orderBy('price', 'asc'))
    constraints.push(orderBy('created_at', 'desc'))

    // Limit results
    constraints.push(firestoreLimit(limit))

    // Create query
    let q = query(propertiesRef, ...constraints)

    // Execute query
    const querySnapshot = await getDocs(q)
    
    let properties = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Property[]

    // Apply client-side filters (for fields that can't be efficiently queried in Firestore)
    
    // Filter by locations (city or area)
    if (locations && locations.length > 0) {
      properties = properties.filter(property => 
        locations.some(location => 
          property.address.city.toLowerCase().includes(location.toLowerCase()) ||
          property.address.area.toLowerCase().includes(location.toLowerCase())
        )
      )
    }

    // Filter by pets allowed
    if (pets_allowed !== undefined) {
      properties = properties.filter(property => property.pets_allowed === pets_allowed)
    }

    // Filter by property type
    if (property_type && property_type.length > 0) {
      properties = properties.filter(property => 
        property_type.includes(property.property_type)
      )
    }

    // Filter by amenities (property must have all requested amenities)
    if (amenities && amenities.length > 0) {
      properties = properties.filter(property =>
        amenities.every(amenity => property.amenities.includes(amenity))
      )
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProperties = properties.slice(startIndex, endIndex)

    const response: PropertySearchResponse = {
      properties: paginatedProperties,
      total: properties.length,
      page,
      limit
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error searching properties:', error)
    return NextResponse.json(
      {
        error: 'Failed to search properties',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'SEARCH_FAILED'
      },
      { status: 500 }
    )
  }
}
