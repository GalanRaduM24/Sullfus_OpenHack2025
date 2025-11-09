import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { LikePropertyRequest, LikePropertyResponse, UnlikePropertyRequest, UnlikePropertyResponse } from '@/lib/firebase/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const body: LikePropertyRequest = await request.json()
    const { tenant_id } = body

    if (!tenant_id) {
      return NextResponse.json(
        {
          error: 'Tenant ID required',
          message: 'tenant_id is required in request body',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    // Check if already liked
    const likesRef = collection(db, 'property_likes')
    const q = query(
      likesRef,
      where('tenant_id', '==', tenant_id),
      where('property_id', '==', propertyId)
    )
    const existingLikes = await getDocs(q)

    if (!existingLikes.empty) {
      return NextResponse.json(
        {
          error: 'Already liked',
          message: 'You have already liked this property',
          code: 'RESOURCE_ALREADY_EXISTS'
        },
        { status: 400 }
      )
    }

    // Create like
    const likeDoc = await addDoc(likesRef, {
      tenant_id,
      property_id: propertyId,
      created_at: serverTimestamp()
    })

    // Increment property likes count
    const propertyRef = doc(db, 'properties', propertyId)
    await updateDoc(propertyRef, {
      likes_count: increment(1)
    })

    const response: LikePropertyResponse = {
      success: true,
      like_id: likeDoc.id
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error liking property:', error)
    return NextResponse.json(
      {
        error: 'Failed to like property',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const body: UnlikePropertyRequest = await request.json()
    const { tenant_id } = body

    if (!tenant_id) {
      return NextResponse.json(
        {
          error: 'Tenant ID required',
          message: 'tenant_id is required in request body',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    // Find existing like
    const likesRef = collection(db, 'property_likes')
    const q = query(
      likesRef,
      where('tenant_id', '==', tenant_id),
      where('property_id', '==', propertyId)
    )
    const existingLikes = await getDocs(q)

    if (existingLikes.empty) {
      return NextResponse.json(
        {
          error: 'Like not found',
          message: 'You have not liked this property',
          code: 'RESOURCE_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Delete like
    const likeDoc = existingLikes.docs[0]
    await deleteDoc(doc(db, 'property_likes', likeDoc.id))

    // Decrement property likes count
    const propertyRef = doc(db, 'properties', propertyId)
    await updateDoc(propertyRef, {
      likes_count: increment(-1)
    })

    const response: UnlikePropertyResponse = {
      success: true
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error unliking property:', error)
    return NextResponse.json(
      {
        error: 'Failed to unlike property',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
