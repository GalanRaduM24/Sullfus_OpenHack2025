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
import { ERROR_CODES } from '@/lib/firebase/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenantId = searchParams.get('tenant_id')
    const landlordId = searchParams.get('landlord_id')
    const status = searchParams.get('status')

    if (!tenantId && !landlordId) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Either tenant_id or landlord_id is required',
          code: ERROR_CODES.VALIDATION_ERROR
        },
        { status: 400 }
      )
    }

    // Build query
    const applicationsRef = collection(db, 'applications')
    let q

    if (tenantId) {
      if (status) {
        q = query(
          applicationsRef,
          where('tenant_id', '==', tenantId),
          where('status', '==', status),
          orderBy('updated_at', 'desc')
        )
      } else {
        q = query(
          applicationsRef,
          where('tenant_id', '==', tenantId),
          orderBy('updated_at', 'desc')
        )
      }
    } else if (landlordId) {
      if (status) {
        q = query(
          applicationsRef,
          where('landlord_id', '==', landlordId),
          where('status', '==', status),
          orderBy('updated_at', 'desc')
        )
      } else {
        q = query(
          applicationsRef,
          where('landlord_id', '==', landlordId),
          orderBy('updated_at', 'desc')
        )
      }
    }

    const querySnapshot = await getDocs(q!)
    const applications = []

    for (const docSnap of querySnapshot.docs) {
      const appData = docSnap.data()
      
      // Fetch property details
      const propertyRef = doc(db, 'properties', appData.property_id)
      const propertySnap = await getDoc(propertyRef)
      const propertyData = propertySnap.exists() ? propertySnap.data() : null

      // Fetch tenant details
      const tenantRef = doc(db, 'tenant_profiles', appData.tenant_id)
      const tenantSnap = await getDoc(tenantRef)
      const tenantData = tenantSnap.exists() ? tenantSnap.data() : null

      // Fetch landlord details
      const landlordRef = doc(db, 'landlord_profiles', appData.landlord_id)
      const landlordSnap = await getDoc(landlordRef)
      const landlordData = landlordSnap.exists() ? landlordSnap.data() : null

      applications.push({
        id: docSnap.id,
        ...appData,
        property: propertyData ? {
          id: appData.property_id,
          title: propertyData.title,
          price: propertyData.price,
          currency: propertyData.currency,
          address: propertyData.address,
          media: propertyData.media,
          property_type: propertyData.property_type
        } : null,
        tenant: tenantData ? {
          id: appData.tenant_id,
          name: tenantData.name,
          age: tenantData.age,
          profession: tenantData.profession,
          profile_photo_url: tenantData.profilePhotoUrl,
          seriosity_score: tenantData.seriosityScore,
          verification_status: tenantData.verificationStatus
        } : null,
        landlord: landlordData ? {
          id: appData.landlord_id,
          name: landlordData.name || landlordData.contactName,
          company_name: landlordData.companyName,
          profile_photo_url: landlordData.profilePhotoUrl,
          business_verified: landlordData.businessVerified
        } : null
      })
    }

    return NextResponse.json({
      applications
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch applications',
        code: ERROR_CODES.INTERNAL_ERROR
      },
      { status: 500 }
    )
  }
}
