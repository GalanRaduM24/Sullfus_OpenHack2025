import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { COLLECTIONS } from '@/lib/firebase/collections'
import { SearchPreferences } from '@/lib/firebase/types'

interface ApplyChatFiltersRequest {
  tenant_id: string
  filters: {
    budgetMin?: number
    budgetMax?: number
    locations?: string[]
    amenities?: string[]
    petsAllowed?: boolean
    moveInDate?: string
    propertyType?: string[]
  }
}

/**
 * POST /api/chat-assistant/apply-filters
 * Apply extracted filters to tenant search preferences
 */
export async function POST(request: NextRequest) {
  try {
    const body: ApplyChatFiltersRequest = await request.json()
    const { tenant_id, filters } = body

    // Validate required fields
    if (!tenant_id || !filters) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          message: 'tenant_id and filters are required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      )
    }

    // Check if tenant profile exists
    const tenantRef = doc(db, COLLECTIONS.TENANT_PROFILES, tenant_id)
    const tenantDoc = await getDoc(tenantRef)

    if (!tenantDoc.exists()) {
      return NextResponse.json(
        {
          error: 'Tenant not found',
          message: 'Tenant profile does not exist',
          code: 'resource/not-found',
        },
        { status: 404 }
      )
    }

    // Convert filters to SearchPreferences format
    const searchPreferences: SearchPreferences = {
      budget_min: filters.budgetMin,
      budget_max: filters.budgetMax,
      locations: filters.locations,
      amenities: filters.amenities,
      pets_allowed: filters.petsAllowed,
      move_in_date: filters.moveInDate ? new Date(filters.moveInDate) : undefined,
      property_type: filters.propertyType,
    }

    // Remove undefined values
    Object.keys(searchPreferences).forEach((key) => {
      if (searchPreferences[key as keyof SearchPreferences] === undefined) {
        delete searchPreferences[key as keyof SearchPreferences]
      }
    })

    // Update tenant profile with search preferences
    await updateDoc(tenantRef, {
      search_preferences: searchPreferences,
      updated_at: serverTimestamp(),
    })

    // Generate a filter ID (timestamp-based)
    const filterId = `filter_${Date.now()}`

    // Store filter application event
    const filterEventRef = doc(
      db,
      COLLECTIONS.TENANT_PROFILES,
      tenant_id,
      'filter_history',
      filterId
    )

    await updateDoc(filterEventRef, {
      filters: searchPreferences,
      applied_at: serverTimestamp(),
      source: 'chat_assistant',
    })

    return NextResponse.json({
      success: true,
      filter_id: filterId,
      applied_filters: searchPreferences,
    })
  } catch (error) {
    console.error('Error applying filters:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to apply filters',
        code: 'internal/error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/chat-assistant/apply-filters
 * Retrieve current search preferences for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tenant_id = searchParams.get('tenant_id')

    if (!tenant_id) {
      return NextResponse.json(
        {
          error: 'Missing tenant_id',
          message: 'tenant_id query parameter is required',
          code: 'validation/missing-field',
        },
        { status: 400 }
      )
    }

    // Retrieve tenant profile
    const tenantRef = doc(db, COLLECTIONS.TENANT_PROFILES, tenant_id)
    const tenantDoc = await getDoc(tenantRef)

    if (!tenantDoc.exists()) {
      return NextResponse.json(
        {
          error: 'Tenant not found',
          message: 'Tenant profile does not exist',
          code: 'resource/not-found',
        },
        { status: 404 }
      )
    }

    const tenantData = tenantDoc.data()
    const searchPreferences = tenantData.search_preferences || {}

    return NextResponse.json({
      search_preferences: searchPreferences,
    })
  } catch (error) {
    console.error('Error retrieving search preferences:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to retrieve search preferences',
        code: 'internal/error',
      },
      { status: 500 }
    )
  }
}
