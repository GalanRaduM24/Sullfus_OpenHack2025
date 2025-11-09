# Landlord Components

This directory contains components specific to the landlord interface for managing applicants and approvals.

## Components

### ApplicantsList

Displays a list of tenants who have liked a property, with their Seriosity Scores and verification status.

**Features:**
- Shows tenant profile information (name, age, profession, bio)
- Displays Seriosity Score (if landlord has Pro subscription)
- Shows verification status badges
- Allows viewing score breakdown (if landlord has Pro subscription)
- Shows document count (if landlord has Pro subscription)
- Provides approve/reject buttons for pending applicants
- Automatically sorts by Seriosity Score (highest first)

**Props:**
```typescript
interface ApplicantsListProps {
  propertyId: string          // ID of the property
  landlordId: string          // ID of the landlord
  canViewScore: boolean       // Whether landlord can view scores (Pro+)
  canViewBreakdown: boolean   // Whether landlord can view score breakdown (Pro+)
  canViewDocuments: boolean   // Whether landlord can view documents (Pro+)
  onApprovalSuccess?: () => void  // Callback after successful approval/rejection
}
```

**Usage:**
```tsx
import { ApplicantsList } from '@/components/landlord'
import { checkMultipleFeatures } from '@/lib/utils/subscription'

// In your component
const features = await checkMultipleFeatures(landlordId, [
  'view_seriosity_score',
  'view_score_breakdown',
  'view_documents'
])

<ApplicantsList
  propertyId={propertyId}
  landlordId={landlordId}
  canViewScore={features.view_seriosity_score}
  canViewBreakdown={features.view_score_breakdown}
  canViewDocuments={features.view_documents}
  onApprovalSuccess={() => {
    console.log('Applicant approved/rejected')
  }}
/>
```

### ApprovalButton

A button component for approving or rejecting tenant applicants.

**Features:**
- Handles approve/reject API calls
- Shows loading state during request
- Displays success/error toasts
- Automatically handles mutual like detection
- Notifies both parties when chat unlocks

**Props:**
```typescript
interface ApprovalButtonProps {
  propertyId: string
  tenantId: string
  landlordId: string
  action: 'approve' | 'reject'
  onSuccess?: (chatUnlocked?: boolean) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { ApprovalButton } from '@/components/landlord'

<ApprovalButton
  propertyId={propertyId}
  tenantId={tenantId}
  landlordId={landlordId}
  action="approve"
  onSuccess={(chatUnlocked) => {
    if (chatUnlocked) {
      // Redirect to chat
      router.push(`/landlord/chat/${applicationId}`)
    }
  }}
/>
```

## API Endpoints

### GET /api/properties/[id]/applicants

Fetches all tenants who have liked a property.

**Query Parameters:**
- `landlord_id` (required): ID of the landlord

**Response:**
```json
{
  "applicants": [
    {
      "id": "tenant_id",
      "name": "John Doe",
      "age": 28,
      "profession": "Software Engineer",
      "bio": "Looking for a quiet place...",
      "seriosity_score": 85,
      "verification_status": "interview_verified",
      "liked_at": "2024-01-15T10:30:00Z",
      "application_status": "pending"
    }
  ]
}
```

### POST /api/properties/[propertyId]/applicants/[tenantId]/approve

Approves a tenant applicant. Creates or updates an application record.

**Request Body:**
```json
{
  "landlord_id": "landlord_id"
}
```

**Response:**
```json
{
  "success": true,
  "chat_unlocked": true,
  "application_id": "app_id"
}
```

**Behavior:**
- If tenant has already liked the property: Sets status to `chat_open` and unlocks chat
- If tenant hasn't liked yet: Sets status to `approved` (waiting for tenant like)
- Sends notification to tenant
- If chat unlocked, also notifies landlord

### POST /api/properties/[propertyId]/applicants/[tenantId]/reject

Rejects a tenant applicant.

**Request Body:**
```json
{
  "landlord_id": "landlord_id"
}
```

**Response:**
```json
{
  "success": true
}
```

**Behavior:**
- Creates or updates application with status `rejected`
- Sends notification to tenant

## Subscription Feature Gating

The applicant management system respects subscription tiers:

**Free Tier:**
- Can view basic applicant info (name, age, profession)
- Cannot view Seriosity Scores
- Cannot view score breakdowns
- Cannot view documents
- Can approve/reject applicants

**Pro Tier:**
- All Free features
- Can view Seriosity Scores
- Can view score breakdowns
- Can view uploaded documents
- Applicants sorted by score

**Business Tier:**
- All Pro features
- Unlimited listings
- Analytics dashboard

Use the subscription utilities to check feature access:

```tsx
import { checkFeatureAccess } from '@/lib/utils/subscription'

const canViewScore = await checkFeatureAccess(landlordId, 'view_seriosity_score')
```

## Integration Example

Here's a complete example of integrating the applicants list into a property detail page:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { ApplicantsList } from '@/components/landlord'
import { checkMultipleFeatures } from '@/lib/utils/subscription'
import { UpgradePrompt } from '@/components/subscriptions'

export default function PropertyApplicantsPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [features, setFeatures] = useState({
    view_seriosity_score: false,
    view_score_breakdown: false,
    view_documents: false
  })
  const landlordId = 'current_landlord_id' // Get from auth context

  useEffect(() => {
    checkMultipleFeatures(landlordId, [
      'view_seriosity_score',
      'view_score_breakdown',
      'view_documents'
    ]).then(setFeatures)
  }, [landlordId])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Property Applicants</h1>
      
      {!features.view_seriosity_score && (
        <UpgradePrompt
          feature="Seriosity Scores"
          requiredTier="pro"
          description="Upgrade to Pro to view tenant Seriosity Scores and make better decisions"
        />
      )}

      <ApplicantsList
        propertyId={params.id}
        landlordId={landlordId}
        canViewScore={features.view_seriosity_score}
        canViewBreakdown={features.view_score_breakdown}
        canViewDocuments={features.view_documents}
      />
    </div>
  )
}
```

## Notes

- Applicants are automatically sorted by Seriosity Score (highest first) for Pro+ subscribers
- The approve/reject functionality handles mutual like detection automatically
- Notifications are sent to both parties when chat unlocks
- All API endpoints verify landlord ownership of the property
- Feature gating is enforced at both UI and API levels
