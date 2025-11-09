# Property Likes Implementation

This document describes the implementation of the property likes feature for tenants.

## Overview

The property likes system allows tenants to save properties they're interested in. This creates a "wishlist" that tenants can review later and helps landlords see which tenants are interested in their properties.

## Components

### 1. LikeButton

**Location:** `components/properties/LikeButton.tsx`

A reusable button component for liking/unliking properties.

**Features:**
- Optimistic UI updates
- Loading states
- Customizable appearance (variant, size, show/hide text)
- Visual feedback (filled heart when liked)
- Error handling with automatic rollback

**Usage:**
```tsx
<LikeButton
  propertyId="property-123"
  tenantId="tenant-456"
  isLiked={false}
  onLikeToggle={(propertyId, isLiked) => {
    console.log(`Property ${propertyId} is now ${isLiked ? 'liked' : 'unliked'}`)
  }}
  variant="default"
  size="default"
  showText={true}
/>
```

### 2. LikedPropertiesList

**Location:** `components/properties/LikedPropertiesList.tsx`

A component that displays all properties a tenant has liked.

**Features:**
- Fetches liked properties from API
- Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Empty state with helpful message
- Refresh functionality
- Click to view property details
- Unlike properties directly from the list
- Loading and error states

**Usage:**
```tsx
<LikedPropertiesList
  tenantId="tenant-456"
  onUnlike={(propertyId) => {
    console.log(`Property ${propertyId} was unliked`)
  }}
/>
```

## API Endpoints

### POST /api/properties/:id/like

Likes a property for a tenant.

**Request:**
```json
{
  "tenant_id": "tenant-456"
}
```

**Response:**
```json
{
  "success": true,
  "like_id": "like-789"
}
```

**Behavior:**
- Creates a `property_likes` record in Firestore
- Increments the property's `likes_count`
- Returns error if already liked

### DELETE /api/properties/:id/like

Unlikes a property for a tenant.

**Request:**
```json
{
  "tenant_id": "tenant-456"
}
```

**Response:**
```json
{
  "success": true
}
```

**Behavior:**
- Deletes the `property_likes` record
- Decrements the property's `likes_count`
- Returns error if not previously liked

### GET /api/tenants/:id/liked-properties

Retrieves all properties liked by a tenant.

**Response:**
```json
{
  "properties": [
    {
      "id": "property-123",
      "title": "Beautiful 2BR Apartment",
      "price": 1500,
      "currency": "RON",
      // ... other property fields
    }
  ]
}
```

**Behavior:**
- Queries `property_likes` collection for tenant
- Fetches full property details for each like
- Returns properties ordered by like date (newest first)

## Database Schema

### property_likes Collection

```typescript
{
  id: string
  tenant_id: string
  property_id: string
  created_at: Timestamp
}
```

**Indexes:**
- `tenant_id` + `property_id` (for checking if already liked)
- `tenant_id` + `created_at` (for fetching liked properties)
- `property_id` (for landlord to see who liked their property)

### properties Collection Updates

The `likes_count` field is automatically maintained:
- Incremented when a property is liked
- Decremented when a property is unliked

## Integration with Tenant Dashboard

The tenant dashboard (`app/tenant/page.tsx`) includes a tabbed interface:

1. **Browse Tab**: Shows all available properties with filters
2. **Liked Tab**: Shows only properties the tenant has liked

The tabs display a count of liked properties and allow seamless switching between browsing and reviewing saved properties.

## User Flow

1. **Browsing Properties**
   - Tenant views properties in the Browse tab
   - Clicks heart icon on property card or detail modal
   - Property is added to liked list
   - Heart icon fills and button shows "Liked"

2. **Viewing Liked Properties**
   - Tenant switches to Liked tab
   - Sees grid of all liked properties
   - Can click to view full details
   - Can unlike by clicking heart icon again

3. **Managing Likes**
   - Tenant can unlike from either:
     - Property detail modal (when viewing details)
     - Liked properties list (quick unlike)
   - Property is immediately removed from liked list
   - Likes count updates in real-time

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

- **Requirement 8.1**: Like button creates property_likes record
- **Requirement 8.2**: Property likes_count is updated
- **Requirement 8.3**: Tenant can view liked properties list
- **Requirement 8.5**: Tenant can unlike properties

## Future Enhancements

Potential improvements for future iterations:

1. **Notifications**: Notify landlords when their property is liked
2. **Sorting/Filtering**: Allow tenants to sort liked properties by price, date, etc.
3. **Notes**: Let tenants add private notes to liked properties
4. **Comparison**: Allow comparing multiple liked properties side-by-side
5. **Expiration**: Auto-remove likes for properties that become unavailable
6. **Sharing**: Allow tenants to share their liked properties list

## Testing

To test the implementation:

1. Sign in as a tenant
2. Complete profile setup
3. Browse properties and click heart icons
4. Switch to "Liked" tab to see saved properties
5. Click heart again to unlike
6. Verify counts update correctly
7. Test with multiple properties
8. Test error cases (network failures, etc.)
