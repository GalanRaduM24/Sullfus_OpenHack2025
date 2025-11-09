# Property Components

This directory contains components for browsing, filtering, and viewing property listings in the tenant interface.

## Components

### PropertyListView
Main component that displays a grid of properties with filtering capabilities.

**Features:**
- Grid layout with responsive design (1-3 columns)
- Integrated filters sidebar/drawer
- Pagination with "Load More" functionality
- Property search with multiple filter criteria
- Like/unlike functionality for authenticated users
- Property detail modal integration

**Props:**
- `userId?: string` - Current user ID (enables like functionality)
- `initialFilters?: Partial<SearchPreferences>` - Initial filter values
- `onLike?: (propertyId: string) => void` - Like handler
- `onPass?: (propertyId: string) => void` - Pass handler
- `likedPropertyIds?: string[]` - Array of liked property IDs
- `showFilters?: boolean` - Show/hide filters (default: true)

**Usage:**
```tsx
<PropertyListView
  userId={user.uid}
  initialFilters={{
    budget_min: 1000,
    budget_max: 2000,
    locations: ['Bucharest'],
    pets_allowed: true
  }}
  onLike={handleLikeProperty}
  onPass={handlePassProperty}
  likedPropertyIds={likedPropertyIds}
  showFilters={true}
/>
```

### PropertyCard
Compact card view of a property for list display.

**Features:**
- Property image with hover effect
- Price and location display
- Key details (bedrooms, bathrooms, square meters)
- Amenities badges
- Like button (when authenticated)
- "Pets Allowed" badge

**Props:**
- `property: Property` - Property data
- `onViewDetails: (property: Property) => void` - Click handler
- `onLike?: (propertyId: string) => void` - Like handler
- `isLiked?: boolean` - Like status
- `showLikeButton?: boolean` - Show/hide like button

### PropertyDetailModal
Full-screen modal showing complete property details.

**Features:**
- Image carousel with navigation
- Video and virtual tour links
- Complete property information
- Landlord public information with verification badge
- Property rules and description
- Like/Pass action buttons

**Props:**
- `property: Property | null` - Property to display
- `landlordInfo?: object` - Landlord public information
- `isOpen: boolean` - Modal open state
- `onClose: () => void` - Close handler
- `onLike?: (propertyId: string) => void` - Like handler
- `onPass?: (propertyId: string) => void` - Pass handler
- `isLiked?: boolean` - Like status
- `showActions?: boolean` - Show/hide action buttons

### PropertyFilters
Filter sidebar/drawer for property search.

**Features:**
- Budget range (min/max)
- Location tags (add/remove)
- Property type selection
- Pets allowed toggle
- Amenities multi-select
- Apply/Clear actions
- Responsive (sidebar on desktop, drawer on mobile)
- Active filter count badge

**Props:**
- `filters: Partial<SearchPreferences>` - Current filter values
- `onFiltersChange: (filters) => void` - Filter change handler
- `onApply: () => void` - Apply filters handler
- `onClear: () => void` - Clear filters handler

## API Endpoints

### POST /api/properties/search
Search properties with filters.

**Request Body:**
```json
{
  "budget_min": 1000,
  "budget_max": 2000,
  "locations": ["Bucharest"],
  "amenities": ["parking", "furnished"],
  "pets_allowed": true,
  "property_type": ["1br", "2br"],
  "page": 1,
  "limit": 12
}
```

**Response:**
```json
{
  "properties": [...],
  "total": 45,
  "page": 1,
  "limit": 12
}
```

### GET /api/properties/:id
Get property details with landlord information.

**Response:**
```json
{
  "property": {...},
  "landlord_public_info": {
    "company_name": "ABC Rentals",
    "contact_name": "John Doe",
    "business_verified": true,
    "profile_photo_url": "..."
  }
}
```

### POST /api/properties/:id/like
Like a property.

**Request Body:**
```json
{
  "tenant_id": "user123"
}
```

### DELETE /api/properties/:id/like
Unlike a property.

**Request Body:**
```json
{
  "tenant_id": "user123"
}
```

### GET /api/tenants/:id/liked-properties
Get all properties liked by a tenant.

**Response:**
```json
{
  "properties": [...]
}
```

## Filter Options

### Amenities
- parking
- furnished
- balcony
- gym
- elevator
- air_conditioning
- heating
- dishwasher
- washing_machine
- internet

### Property Types
- studio
- 1br (1 Bedroom)
- 2br (2 Bedrooms)
- 3br+ (3+ Bedrooms)
- house

## Integration

The PropertyListView is integrated into the tenant dashboard (`app/tenant/page.tsx`) and displays:
- For authenticated users with complete profiles: Full functionality with like/pass
- For authenticated users with incomplete profiles: Prompt to complete profile
- For non-authenticated users: Browse-only mode without like functionality

## Requirements Satisfied

This implementation satisfies the following requirements from the spec:

**Requirement 7.1**: Property browsing as scrollable list (not swipe cards)
**Requirement 7.2**: Filter properties by budget, location, amenities, pets, property type
**Requirement 7.3**: Show property details with photos, video, virtual tour
**Requirement 7.4**: Display landlord public info and property rules
**Requirement 8.1**: Like properties functionality
**Requirement 8.2**: Track liked properties

## Future Enhancements

- Commute time filter (requires Google Maps Distance Matrix API)
- Move-in date filter
- Save filter presets
- Property comparison feature
- Map view integration
- Advanced sorting options (price, date, popularity)
