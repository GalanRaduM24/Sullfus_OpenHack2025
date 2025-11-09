'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SearchChatBot } from './SearchChatBot'
import { 
  Search, 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Wifi, 
  Tv, 
  Coffee,
  Dumbbell,
  Dog,
  Cigarette,
  Heart,
  Share2,
  Filter,
  ChevronDown,
  Euro,
  Home,
  Building,
  X
} from 'lucide-react'

export interface PropertyListing {
  id: string
  title: string
  description: string
  price: number
  currency: string
  location: {
    address: string
    city: string
    neighborhood: string
    coordinates?: { lat: number; lng: number }
  }
  type: 'apartment' | 'house' | 'studio' | 'room'
  specs: {
    bedrooms: number
    bathrooms: number
    area: number // in sqm
    floor?: number
    totalFloors?: number
  }
  amenities: string[]
  features: string[]
  images: string[]
  landlordId: string
  landlordName: string
  landlordRating: number
  available: boolean
  availableFrom: Date
  petFriendly: boolean
  smokingAllowed: boolean
  furnished: boolean
  utilities: {
    included: string[]
    excluded: string[]
  }
  deposit: number
  createdAt: Date
  updatedAt: Date
}

export interface SearchFilters {
  query: string
  location: string
  priceRange: { min: number; max: number }
  propertyType: string[]
  bedrooms: { min: number; max: number }
  bathrooms: { min: number; max: number }
  area: { min: number; max: number }
  amenities: string[]
  features: string[]
  petFriendly: boolean | null
  smokingAllowed: boolean | null
  furnished: boolean | null
  availableFrom: Date | null
}

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment', icon: Building },
  { value: 'house', label: 'House', icon: Home },
  { value: 'studio', label: 'Studio', icon: Home },
  { value: 'room', label: 'Room', icon: Bed },
]

const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'tv', label: 'TV', icon: Tv },
  { value: 'kitchen', label: 'Kitchen', icon: Coffee },
  { value: 'gym', label: 'Gym', icon: Dumbbell },
  { value: 'balcony', label: 'Balcony', icon: Home },
  { value: 'garden', label: 'Garden', icon: Home },
  { value: 'elevator', label: 'Elevator', icon: Building },
]

const FEATURES = [
  'Air Conditioning',
  'Heating',
  'Washing Machine',
  'Dishwasher',
  'Microwave',
  'Refrigerator',
  'Security System',
  'Intercom'
]

// Mock data for development
const MOCK_LISTINGS: PropertyListing[] = [
  {
    id: '1',
    title: 'Modern 2BR Apartment in Herastrau',
    description: 'Beautiful modern apartment with great views of Herastrau Park. Fully furnished with high-end appliances.',
    price: 800,
    currency: 'EUR',
    location: {
      address: 'Strada Nordului 15',
      city: 'Bucharest',
      neighborhood: 'Herastrau',
      coordinates: { lat: 44.4698, lng: 26.0827 }
    },
    type: 'apartment',
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      floor: 3,
      totalFloors: 8
    },
    amenities: ['wifi', 'parking', 'tv', 'kitchen'],
    features: ['Air Conditioning', 'Heating', 'Washing Machine'],
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    landlordId: 'landlord1',
    landlordName: 'Maria Popescu',
    landlordRating: 4.8,
    available: true,
    availableFrom: new Date('2025-12-01'),
    petFriendly: true,
    smokingAllowed: false,
    furnished: true,
    utilities: {
      included: ['Heating', 'Water'],
      excluded: ['Electricity', 'Internet']
    },
    deposit: 800,
    createdAt: new Date('2025-11-01'),
    updatedAt: new Date('2025-11-08')
  },
  {
    id: '2',
    title: 'Cozy Studio in Old Town',
    description: 'Charming studio apartment in the heart of Old Town. Perfect for young professionals.',
    price: 450,
    currency: 'EUR',
    location: {
      address: 'Strada Lipscani 25',
      city: 'Bucharest',
      neighborhood: 'Old Town',
      coordinates: { lat: 44.4299, lng: 26.1021 }
    },
    type: 'studio',
    specs: {
      bedrooms: 0,
      bathrooms: 1,
      area: 35,
      floor: 2,
      totalFloors: 4
    },
    amenities: ['wifi', 'tv'],
    features: ['Heating', 'Security System'],
    images: ['/api/placeholder/400/300'],
    landlordId: 'landlord2',
    landlordName: 'Ion Marinescu',
    landlordRating: 4.5,
    available: true,
    availableFrom: new Date('2025-11-15'),
    petFriendly: false,
    smokingAllowed: false,
    furnished: true,
    utilities: {
      included: ['Water'],
      excluded: ['Heating', 'Electricity', 'Internet']
    },
    deposit: 450,
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-11-05')
  },
  {
    id: '3',
    title: 'Spacious 3BR House with Garden',
    description: 'Beautiful house with private garden, perfect for families. Located in quiet residential area.',
    price: 1200,
    currency: 'EUR',
    location: {
      address: 'Strada Florilor 8',
      city: 'Bucharest',
      neighborhood: 'Pipera',
      coordinates: { lat: 44.4991, lng: 26.1223 }
    },
    type: 'house',
    specs: {
      bedrooms: 3,
      bathrooms: 2,
      area: 150,
    },
    amenities: ['wifi', 'parking', 'tv', 'kitchen', 'garden'],
    features: ['Air Conditioning', 'Heating', 'Washing Machine', 'Dishwasher'],
    images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
    landlordId: 'landlord3',
    landlordName: 'Elena Radulescu',
    landlordRating: 4.9,
    available: true,
    availableFrom: new Date('2025-12-15'),
    petFriendly: true,
    smokingAllowed: false,
    furnished: false,
    utilities: {
      included: ['Water'],
      excluded: ['Heating', 'Electricity', 'Internet']
    },
    deposit: 1200,
    createdAt: new Date('2025-10-20'),
    updatedAt: new Date('2025-11-07')
  }
]

export function SearchForRentPage() {
  const [listings, setListings] = useState<PropertyListing[]>(MOCK_LISTINGS)
  const [filteredListings, setFilteredListings] = useState<PropertyListing[]>(MOCK_LISTINGS)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    priceRange: { min: 0, max: 2000 },
    propertyType: [],
    bedrooms: { min: 0, max: 10 },
    bathrooms: { min: 0, max: 5 },
    area: { min: 0, max: 500 },
    amenities: [],
    features: [],
    petFriendly: null,
    smokingAllowed: null,
    furnished: null,
    availableFrom: null
  })

  // Apply filters
  useEffect(() => {
    let filtered = listings

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.location.address.toLowerCase().includes(query) ||
        listing.location.neighborhood.toLowerCase().includes(query)
      )
    }

    // Location filter
    if (filters.location) {
      const location = filters.location.toLowerCase()
      filtered = filtered.filter(listing =>
        listing.location.city.toLowerCase().includes(location) ||
        listing.location.neighborhood.toLowerCase().includes(location) ||
        listing.location.address.toLowerCase().includes(location)
      )
    }

    // Price range
    filtered = filtered.filter(listing =>
      listing.price >= filters.priceRange.min &&
      listing.price <= filters.priceRange.max
    )

    // Property type
    if (filters.propertyType.length > 0) {
      filtered = filtered.filter(listing =>
        filters.propertyType.includes(listing.type)
      )
    }

    // Bedrooms
    filtered = filtered.filter(listing =>
      listing.specs.bedrooms >= filters.bedrooms.min &&
      listing.specs.bedrooms <= filters.bedrooms.max
    )

    // Bathrooms
    filtered = filtered.filter(listing =>
      listing.specs.bathrooms >= filters.bathrooms.min &&
      listing.specs.bathrooms <= filters.bathrooms.max
    )

    // Area
    filtered = filtered.filter(listing =>
      listing.specs.area >= filters.area.min &&
      listing.specs.area <= filters.area.max
    )

    // Amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(listing =>
        filters.amenities.every(amenity => listing.amenities.includes(amenity))
      )
    }

    // Features
    if (filters.features.length > 0) {
      filtered = filtered.filter(listing =>
        filters.features.every(feature => listing.features.includes(feature))
      )
    }

    // Pet friendly
    if (filters.petFriendly !== null) {
      filtered = filtered.filter(listing => listing.petFriendly === filters.petFriendly)
    }

    // Smoking allowed
    if (filters.smokingAllowed !== null) {
      filtered = filtered.filter(listing => listing.smokingAllowed === filters.smokingAllowed)
    }

    // Furnished
    if (filters.furnished !== null) {
      filtered = filtered.filter(listing => listing.furnished === filters.furnished)
    }

    setFilteredListings(filtered)
  }, [filters, listings])

  const handleChatBotFiltersUpdate = (newFilters: Partial<SearchFilters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }))
  }

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    )
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      priceRange: { min: 0, max: 2000 },
      propertyType: [],
      bedrooms: { min: 0, max: 10 },
      bathrooms: { min: 0, max: 5 },
      area: { min: 0, max: 500 },
      amenities: [],
      features: [],
      petFriendly: null,
      smokingAllowed: null,
      furnished: null,
      availableFrom: null
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Rental</h1>
        <p className="text-muted-foreground">
          Discover amazing rental properties in Bucharest and beyond
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties, neighborhoods, or keywords..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="pl-10 w-48"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs"
                >
                  Clear All
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Price Range (EUR/month)</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                      }))}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                      }))}
                      className="w-20"
                    />
                  </div>
                </div>

                <Separator />

                {/* Property Type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Property Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROPERTY_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = filters.propertyType.includes(type.value)
                      return (
                        <Button
                          key={type.value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              propertyType: isSelected
                                ? prev.propertyType.filter(t => t !== type.value)
                                : [...prev.propertyType, type.value]
                            }))
                          }}
                          className="flex items-center gap-2 justify-start"
                        >
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Bedrooms & Bathrooms */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bedrooms</Label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.bedrooms.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          bedrooms: { ...prev.bedrooms, min: Number(e.target.value) }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.bedrooms.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          bedrooms: { ...prev.bedrooms, max: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Bathrooms</Label>
                    <div className="space-y-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.bathrooms.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          bathrooms: { ...prev.bathrooms, min: Number(e.target.value) }
                        }))}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.bathrooms.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          bathrooms: { ...prev.bathrooms, max: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((amenity) => {
                      const Icon = amenity.icon
                      const isSelected = filters.amenities.includes(amenity.value)
                      return (
                        <Button
                          key={amenity.value}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setFilters(prev => ({
                              ...prev,
                              amenities: isSelected
                                ? prev.amenities.filter(a => a !== amenity.value)
                                : [...prev.amenities, amenity.value]
                            }))
                          }}
                          className="flex items-center gap-2 justify-start text-xs"
                        >
                          <Icon className="h-3 w-3" />
                          {amenity.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Additional Options */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Additional Options</Label>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={filters.petFriendly === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        petFriendly: prev.petFriendly === true ? null : true
                      }))}
                      className="flex items-center gap-2"
                    >
                      <Dog className="h-3 w-3" />
                      Pet Friendly
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={filters.furnished === true ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        furnished: prev.furnished === true ? null : true
                      }))}
                      className="flex items-center gap-2"
                    >
                      <Home className="h-3 w-3" />
                      Furnished
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Listings */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredListings.length} properties found
            </p>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Sort by:</Label>
              <select className="border rounded px-2 py-1 text-sm">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Area: Largest First</option>
              </select>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredListings.map((listing) => (
              <PropertyCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.includes(listing.id)}
                onToggleFavorite={() => toggleFavorite(listing.id)}
              />
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No properties found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* AI Search Assistant */}
      <SearchChatBot 
        onFiltersUpdate={handleChatBotFiltersUpdate}
        currentFilters={filters}
      />
    </div>
  )
}

function PropertyCard({ 
  listing, 
  isFavorite, 
  onToggleFavorite 
}: { 
  listing: PropertyListing
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* Image */}
        <div className="w-64 h-48 bg-gray-200 flex-shrink-0">
          <img
            src={listing.images[0] || '/api/placeholder/400/300'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-semibold mb-1">{listing.title}</h3>
              <p className="text-muted-foreground flex items-center gap-1 text-sm">
                <MapPin className="h-3 w-3" />
                {listing.location.neighborhood}, {listing.location.city}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className="p-2"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {listing.description}
          </p>

          {/* Property specs */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            {listing.specs.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                {listing.specs.bedrooms} bed{listing.specs.bedrooms !== 1 ? 's' : ''}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {listing.specs.bathrooms} bath{listing.specs.bathrooms !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              {listing.specs.area} m²
            </div>
            {listing.specs.floor && (
              <div>Floor {listing.specs.floor}</div>
            )}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.amenities.slice(0, 4).map((amenity) => {
              const amenityConfig = AMENITIES.find(a => a.value === amenity)
              if (!amenityConfig) return null
              const Icon = amenityConfig.icon
              return (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {amenityConfig.label}
                </Badge>
              )
            })}
            {listing.amenities.length > 4 && (
              <Badge variant="outline">
                +{listing.amenities.length - 4} more
              </Badge>
            )}
          </div>

          {/* Price and actions */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <Euro className="h-4 w-4" />
                <span className="text-2xl font-bold">{listing.price}</span>
                <span className="text-muted-foreground">/{listing.currency === 'EUR' ? 'month' : 'luna'}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Available from {listing.availableFrom.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Contact
              </Button>
              <Link href={`/tenant/property/${listing.id}`}>
                <Button size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}