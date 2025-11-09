# Applications Components

This directory contains components for displaying and managing tenant applications and landlord approvals.

## Overview

The applications system implements the mutual like/approval matching logic:
1. Tenant likes a property → Creates a `property_like` record
2. Landlord approves tenant → Creates/updates `application` with status 'approved'
3. If both actions occur → Application status becomes 'chat_open'

## Components

### TenantApplicationsList

Displays all applications for a tenant, showing:
- Properties they've liked
- Approval status from landlords
- Chat unlock status
- Property details and landlord info

**Props:**
- `tenantId: string` - The tenant's user ID
- `onOpenChat?: (applicationId: string) => void` - Callback when opening chat

**Features:**
- Filter by status (all, chat_open, approved, rejected)
- Visual status badges
- Property images and details
- Timeline of application events
- Chat button for unlocked conversations

### LandlordApplicationsList

Displays all applications for a landlord, showing:
- Tenants who liked their properties
- Tenant Seriosity Scores
- Application status
- Property context

**Props:**
- `landlordId: string` - The landlord's user ID
- `propertyId?: string` - Optional filter for specific property
- `onOpenChat?: (applicationId: string) => void` - Callback when opening chat

**Features:**
- Filter by status (all, chat_open, approved, rejected)
- Tenant profile information with avatar
- Seriosity Score display
- Property context for each application
- Chat button for unlocked conversations

## API Endpoints

### GET /api/applications

Fetch applications for a user.

**Query Parameters:**
- `tenant_id` - Get applications for a tenant
- `landlord_id` - Get applications for a landlord
- `status` - Optional filter by status

**Response:**
```json
{
  "applications": [
    {
      "id": "app_123",
      "property_id": "prop_456",
      "tenant_id": "tenant_789",
      "landlord_id": "landlord_012",
      "status": "chat_open",
      "tenant_liked_at": "2024-01-15T10:30:00Z",
      "landlord_approved_at": "2024-01-15T14:20:00Z",
      "property": { ... },
      "tenant": { ... },
      "landlord": { ... }
    }
  ]
}
```

## Application Status Flow

```
1. Tenant likes property
   └─> Creates property_like record
   
2. Landlord approves tenant
   └─> If no like: status = 'approved' (waiting for tenant)
   └─> If liked: status = 'chat_open' (mutual match!)
   
3. Landlord rejects tenant
   └─> status = 'rejected'
   
4. Chat unlocked (status = 'chat_open')
   └─> Both parties can now message each other
```

## Integration

### Tenant Dashboard

```tsx
import { TenantApplicationsList } from '@/components/applications'

<TenantApplicationsList
  tenantId={user.uid}
  onOpenChat={(applicationId) => {
    router.push(`/tenant/chat/${applicationId}`)
  }}
/>
```

### Landlord Dashboard

```tsx
import { LandlordApplicationsList } from '@/components/applications'

<LandlordApplicationsList
  landlordId={user.uid}
  onOpenChat={(applicationId) => {
    router.push(`/landlord/chat/${applicationId}`)
  }}
/>
```

### Property-Specific View

```tsx
<LandlordApplicationsList
  landlordId={user.uid}
  propertyId={propertyId}
  onOpenChat={(applicationId) => {
    router.push(`/landlord/chat/${applicationId}`)
  }}
/>
```

## Notifications

When application status changes, notifications are sent:

- **Tenant liked property** → Landlord receives notification
- **Landlord approved** → Tenant receives notification
- **Chat unlocked** → Both parties receive notification
- **Landlord rejected** → Tenant receives notification

## Future Enhancements

- [ ] Real-time updates using Firestore listeners
- [ ] Bulk actions (approve/reject multiple)
- [ ] Export applications to CSV
- [ ] Advanced filtering (date range, score range)
- [ ] Application notes/comments
- [ ] Schedule viewing directly from application
