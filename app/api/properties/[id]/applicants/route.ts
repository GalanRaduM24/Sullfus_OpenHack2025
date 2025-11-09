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
import { 
  ApplicantInfo,
  GetApplicantsResponse,
  ERROR_CODES 
} from '@/lib/firebase/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const searchParams = request.nextUrl.searchParams
    const landlordId = searchParams.get('landlord_id')

    if (!landlordId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Landlord ID is required',
          code: ERROR_CODES.AUTH_REQUIRED
        },
        { status: 401 }
      )
    }

    // Verify property belongs to landlord
    const propertyRef = doc(db, 'properties', propertyId)
    const propertySnap = await getDoc(propertyRef)

    if (!propertySnap.exists()) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Property not found',
          code: ERROR_CODES.RESOURCE_NOT_FOUND
        },
        { status: 404 }
      )
    }

    const propertyData = propertySnap.data()
    if (propertyData.landlord_id !== landlordId) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to view applicants for this property',
          code: ERROR_CODES.PERMISSION_DENIED
        },
        { status: 403 }
      )
    }

    // Get all property likes for this property
    const likesQuery = query(
      collection(db, 'property_likes'),
      where('property_id', '==', propertyId),
      orderBy('created_at', 'desc')
    )

    const likesSnapshot = await getDocs(likesQuery)
    const tenantIds = likesSnapshot.docs.map(doc => doc.data().tenant_id)

    if (tenantIds.length === 0) {
      return NextResponse.json<GetApplicantsResponse>({
        applicants: []
      })
    }

    // Get tenant profiles for all applicants
    const applicants: ApplicantInfo[] = []

    for (const tenantId of tenantIds) {
      const tenantRef = doc(db, 'tenant_profiles', tenantId)
      const tenantSnap = await getDoc(tenantRef)

      if (tenantSnap.exists()) {
        const tenantData = tenantSnap.data()
        const likeDoc = likesSnapshot.docs.find(doc => doc.data().tenant_id === tenantId)

        // Check if there's an application for this tenant
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('property_id', '==', propertyId),
          where('tenant_id', '==', tenantId)
        )
        const applicationsSnapshot = await getDocs(applicationsQuery)
        const applicationStatus = applicationsSnapshot.empty 
          ? undefined 
          : applicationsSnapshot.docs[0].data().status

        applicants.push({
          id: tenantSnap.id,
          user_id: tenantData.user_id,
          name: tenantData.name,
          age: tenantData.age,
          profession: tenantData.profession,
          bio: tenantData.bio,
          profile_photo_url: tenantData.profile_photo_url,
          verification_status: tenantData.verification_status,
          seriosity_score: tenantData.seriosity_score || 0,
          seriosity_breakdown: tenantData.seriosity_breakdown,
          id_document_url: tenantData.id_document_url,
          id_verification_status: tenantData.id_verification_status,
          interview_completed: tenantData.interview_completed,
          interview_id: tenantData.interview_id,
          documents: tenantData.documents,
          search_preferences: tenantData.search_preferences,
          created_at: tenantData.created_at,
          updated_at: tenantData.updated_at,
          liked_at: likeDoc?.data().created_at,
          application_status: applicationStatus
        })
      }
    }

    // Sort by seriosity score (highest first)
    applicants.sort((a, b) => b.seriosity_score - a.seriosity_score)

    return NextResponse.json<GetApplicantsResponse>({
      applicants
    })

  } catch (error) {
    console.error('Error fetching applicants:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch applicants',
        code: ERROR_CODES.INTERNAL_ERROR
      },
      { status: 500 }
    )
  }
}
