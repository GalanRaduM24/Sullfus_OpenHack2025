import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Property, GetLikedPropertiesResponse } from '@/lib/firebase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = params.id

    // Get all property likes for this tenant
    const likesRef = collection(db, 'property_likes')
    const q = query(
      likesRef,
      where('tenant_id', '==', tenantId),
      orderBy('created_at', 'desc')
    )
    const likesSnapshot = await getDocs(q)

    // Get property details for each liked property
    const properties: Property[] = []
    
    for (const likeDoc of likesSnapshot.docs) {
      const likeData = likeDoc.data()
      const propertyRef = doc(db, 'properties', likeData.property_id)
      const propertySnap = await getDoc(propertyRef)
      
      if (propertySnap.exists()) {
        properties.push({
          id: propertySnap.id,
          ...propertySnap.data()
        } as Property)
      }
    }

    const response: GetLikedPropertiesResponse = {
      properties
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching liked properties:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch liked properties',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
