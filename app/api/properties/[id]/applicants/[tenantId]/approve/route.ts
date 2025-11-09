import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  addDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import {
  ApproveApplicantResponse,
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
          message: 'You do not have permission to approve applicants for this property',
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

    // Check if tenant has liked the property
    const likesQuery = query(
      collection(db, 'property_likes'),
      where('property_id', '==', propertyId),
      where('tenant_id', '==', tenantId)
    )
    const likesSnapshot = await getDocs(likesQuery)
    const hasLiked = !likesSnapshot.empty
    const likeData = hasLiked ? likesSnapshot.docs[0].data() : null

    // Check if application already exists
    const applicationsQuery = query(
      collection(db, 'applications'),
      where('property_id', '==', propertyId),
      where('tenant_id', '==', tenantId)
    )
    const applicationsSnapshot = await getDocs(applicationsQuery)

    let applicationId: string
    let chatUnlocked = false

    if (applicationsSnapshot.empty) {
      // Create new application
      const newApplication: any = {
        property_id: propertyId,
        tenant_id: tenantId,
        landlord_id: landlord_id,
        status: hasLiked ? 'chat_open' : 'approved',
        tenant_liked_at: likeData?.created_at || serverTimestamp(),
        landlord_approved_at: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      }

      const applicationRef = await addDoc(collection(db, 'applications'), newApplication)
      applicationId = applicationRef.id
      chatUnlocked = hasLiked
    } else {
      // Update existing application
      const existingApp = applicationsSnapshot.docs[0]
      applicationId = existingApp.id
      const existingData = existingApp.data()

      // Determine new status
      const newStatus = hasLiked ? 'chat_open' : 'approved'
      chatUnlocked = newStatus === 'chat_open'

      await updateDoc(doc(db, 'applications', applicationId), {
        status: newStatus,
        landlord_approved_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
    }

    // Create notification for tenant
    await addDoc(collection(db, 'notifications'), {
      user_id: tenantId,
      type: chatUnlocked ? 'landlord_approved' : 'landlord_approved',
      title: chatUnlocked ? 'Chat Unlocked!' : 'Landlord Approved You',
      message: chatUnlocked
        ? `Great news! The landlord approved your application for ${propertyData.title}. You can now chat with them.`
        : `The landlord approved your application for ${propertyData.title}. Like the property to unlock chat.`,
      data: {
        property_id: propertyId,
        application_id: applicationId,
        chat_unlocked: chatUnlocked
      },
      read: false,
      created_at: serverTimestamp(),
      action_url: chatUnlocked ? `/tenant/chat/${applicationId}` : `/tenant/properties/${propertyId}`
    })

    // If chat unlocked, also notify landlord
    if (chatUnlocked) {
      await addDoc(collection(db, 'notifications'), {
        user_id: landlord_id,
        type: 'tenant_liked_property',
        title: 'Mutual Match!',
        message: `You and ${tenantSnap.data().name} both expressed interest. Chat is now open!`,
        data: {
          property_id: propertyId,
          tenant_id: tenantId,
          application_id: applicationId
        },
        read: false,
        created_at: serverTimestamp(),
        action_url: `/landlord/chat/${applicationId}`
      })
    }

    return NextResponse.json<ApproveApplicantResponse>({
      success: true,
      chat_unlocked: chatUnlocked,
      application_id: applicationId
    })

  } catch (error) {
    console.error('Error approving applicant:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to approve applicant',
        code: ERROR_CODES.INTERNAL_ERROR
      },
      { status: 500 }
    )
  }
}
