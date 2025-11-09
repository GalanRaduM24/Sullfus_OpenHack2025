import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  RejectApplicantResponse,
  ERROR_CODES,
  Application
} from '@/lib/firebase/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; tenantId: string } }
) {
  try {
    const propertyId = params.id
    const { tenantId } = params
    const body = await request.json()
    const { landlord_id } = body

    if (!landlord_id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Landlord ID is required',
          code: ERROR_CODES.AUTH_REQUIRED
        },
        { status: 401 }
      )
    }

    // Verify property exists and belongs to landlord
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
    if (propertyData.landlord_id !== landlord_id) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to reject applicants for this property',
          code: ERROR_CODES.PERMISSION_DENIED
        },
        { status: 403 }
      )
    }

    // Verify tenant exists
    const tenantRef = doc(db, 'tenant_profiles', tenantId)
    const tenantSnap = await getDoc(tenantRef)

    if (!tenantSnap.exists()) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Tenant not found',
          code: ERROR_CODES.RESOURCE_NOT_FOUND
        },
        { status: 404 }
      )
    }

    // Check if application exists
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('property_id', '==', propertyId),
      where('tenant_id', '==', tenantId)
    )
    const applicationsSnapshot = await getDocs(applicationsQuery)

    let applicationId: string

    if (applicationsSnapshot.empty) {
      // Create new application with rejected status
      const newApplication: any = {
        property_id: propertyId,
        tenant_id: tenantId,
        landlord_id: landlord_id,
        status: 'rejected',
        tenant_liked_at: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }

      const applicationRef = await addDoc(collection(db, 'applications'), newApplication)
      applicationId = applicationRef.id
    } else {
      // Update existing application to rejected
      const existingApp = applicationsSnapshot.docs[0]
      applicationId = existingApp.id

      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'rejected',
        updated_at: serverTimestamp()
      })
    }

    // Create notification for tenant
    await addDoc(collection(db, 'notifications'), {
      user_id: tenantId,
      type: 'landlord_rejected',
      title: 'Application Update',
      message: `Thank you for your interest in ${propertyData.title}. The landlord has decided to move forward with other applicants.`,
      data: {
        property_id: propertyId,
        application_id: applicationId
      },
      read: false,
      created_at: serverTimestamp(),
      action_url: `/tenant/properties`
    })

    return NextResponse.json<RejectApplicantResponse>({
      success: true
    })

  } catch (error) {
    console.error('Error rejecting applicant:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to reject applicant',
        code: ERROR_CODES.INTERNAL_ERROR
      },
      { status: 500 }
    )
  }
}
