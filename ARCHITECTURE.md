# Rently Architecture

## Overview

Rently is built with a **dual-interface architecture** where tenants and landlords have separate user experiences but share the same Firebase backend.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Firebase Backend                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │  Auth    │  │ Firestore│  │ Storage  │  │  FCM   │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↕                    ↕
        ┌──────────────────────────┐  ┌──────────────────┐
        │   Tenant Interface       │  │ Landlord Interface│
        │   (/tenant/*)            │  │ (/landlord/*)    │
        │                          │  │                  │
        │  • Swipe Properties      │  │  • List Properties│
        │  • View Matches          │  │  • View Tenants  │
        │  • Chat with Landlords   │  │  • Chat with Tenants│
        │  • Manage Profile        │  │  • Manage Profile│
        └──────────────────────────┘  └──────────────────┘
```

## Frontend Structure

### Tenant Interface (`/tenant/*`)
- **Purpose**: Help tenants find rental properties
- **Key Features**:
  - Swipe through property listings
  - Set budget and location preferences
  - View matches with landlords
  - Chat with matched landlords
  - Upload intro video

### Landlord Interface (`/landlord/*`)
- **Purpose**: Help landlords find tenants
- **Key Features**:
  - Create and manage property listings
  - View interested tenants
  - Swipe through tenant profiles
  - Chat with matched tenants
  - Manage property details

## Backend Structure (Firebase)

### Firestore Collections

#### `users`
Stores user profiles with role information:
```typescript
{
  id: string
  email: string
  role: 'tenant' | 'landlord'
  name: string
  // Tenant-specific fields
  budgetMin?: number
  budgetMax?: number
  preferredLocations?: string[]
  // Landlord-specific fields
  description?: string
  businessVerified?: boolean
}
```

#### `listings`
Stores property listings:
```typescript
{
  id: string
  title: string
  description: string
  price: number
  location: { address: string, lat: number, lng: number }
  images: string[]
  landlordId: string
  rules: {
    petsAllowed: boolean
    smokingAllowed: boolean
    studentsAllowed: boolean
    roommatesAllowed: boolean
  }
}
```

#### `matches`
Stores mutual matches between tenants and landlords:
```typescript
{
  id: string
  tenantId: string
  landlordId: string
  propertyId: string
  status: 'matched' | 'chatting' | 'closed'
  tenantLiked: boolean
  landlordLiked: boolean
}
```

#### `chats/{matchId}/messages`
Stores chat messages for each match:
```typescript
{
  id: string
  matchId: string
  senderId: string
  receiverId: string
  text: string
  read: boolean
  createdAt: timestamp
}
```

## Shared Functions

All Firebase operations are centralized in `lib/firebase/`:

- **`users.ts`**: User profile management
- **`listings.ts`**: Property listing CRUD operations
- **`matches.ts`**: Matching logic and match management
- **`chat.ts`**: Real-time messaging functionality

## Role-Based Routing

Users are redirected based on their role:
1. User registers/logs in
2. User selects role (or role is stored in profile)
3. User is redirected to `/tenant` or `/landlord`
4. Each interface has its own layout and navigation

## Data Flow

### Tenant Swipe Flow
1. Tenant views properties on `/tenant/swipe`
2. Tenant swipes right (likes) a property
3. `createLike()` is called with `likedBy: 'tenant'`
4. System checks if landlord already liked this tenant
5. If both liked → create match
6. Both users see match in their matches page

### Landlord Listing Flow
1. Landlord creates listing on `/landlord/listings`
2. Listing is saved to Firestore `listings` collection
3. Listing appears in tenant swipe feed
4. Tenants can like the listing
5. Landlord sees interested tenants on `/landlord/tenants`

### Chat Flow
1. Match is created (mutual like)
2. Users can access chat from matches page
3. Messages are stored in `chats/{matchId}/messages`
4. Real-time updates using Firestore `onSnapshot`

## Security

- Firebase Security Rules control access to collections
- Users can only read/write their own data
- Matches are accessible to both parties
- Chat messages are only visible to matched users

## Future Enhancements

- [ ] Role switching (users can be both tenant and landlord)
- [ ] Multi-property management for landlords
- [ ] Advanced filtering and search
- [ ] Push notifications for matches and messages
- [ ] Video analysis with Gemini API
- [ ] Rating and review system

