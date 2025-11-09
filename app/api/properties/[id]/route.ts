import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Property, PropertyDetailResponse, LandlordProfile } from '@/lib/firebase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id

    // Get property
    const propertyRef = doc(db, 'properties', propertyId)
    const propertySnap = await getDoc(propertyRef)

    if (!propertySnap.exists()) {
      return NextResponse.json(
        {
          error: 'Property not found',
          message: 'The requested property does not exist',
          code: 'RESOURCE_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    const property = {
      id: propertySnap.id,
      ...propertySnap.data()
    } as Property

    // Increment view count
    await updateDoc(propertyRef, {
      views_count: increment(1)
    })

    // Get landlord public info
    const landlordRef = doc(db, 'landlord_profiles', property.landlord_id)
    const landlordSnap = await getDoc(landlordRef)

    let landlordPublicInfo = {
      company_name: 'Unknown',
      contact_name: 'Unknown',
      business_verified: false
    }

    if (landlordSnap.exists()) {
      const landlordData = landlordSnap.data() as LandlordProfile
      landlordPublicInfo = {
        company_name: landlordData.company_name,
        contact_name: landlordData.contact_name,
        business_verified: landlordData.business_verified,
        profile_photo_url: landlordData.profile_photo_url
      }
    }

    const response: PropertyDetailResponse = {
      property,
      landlord_public_info: landlordPublicInfo
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch property',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
