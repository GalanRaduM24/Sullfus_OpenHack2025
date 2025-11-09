'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Search, 
  MapPin, 
  Heart,
  Star,
  Users,
  MessageSquare,
  Shield,
  TrendingUp,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Verified,
  Clock,
  Share2,
  Bookmark,
  ChevronDown,
  Sparkles,
  Bot,
  Send,
  Zap,
  Home as HomeIcon,
  Building,
  Car,
  Wifi,
  Tv,
  Coffee,
  Dumbbell,
  SlidersHorizontal
} from 'lucide-react'

export interface SocialSearchFilters {
  query: string
  location: string
  priceRange: { min: number; max: number }
  propertyType: string[]
  bedrooms: { min: number; max: number }
  amenities: string[]
  landlordRating: number // minimum rating
  verifiedLandlord: boolean
  responseTime: number // max hours
  socialScore: number // minimum social score
}

interface LandlordProfile {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  responseTime: string // "within 2 hours"
  verificationStatus: 'verified' | 'pending' | 'unverified'
  socialScore: number
  propertiesCount: number
  joinedDate: string
  badges: string[] // ['super-host', 'quick-responder', 'pet-friendly']
}

interface PropertyReview {
  id: string
  tenantName: string
  tenantAvatar: string
  rating: number
  comment: string
  date: string
  verified: boolean
  helpfulCount: number
  aspects: {
    cleanliness: number
    communication: number
    accuracy: number
    value: number
  }
}

interface SocialPropertyListing {
  id: string
  title: string
  description: string
  price: number
  currency: 'EUR' | 'RON'
  images: string[]
  location: {
    address: string
    neighborhood: string
    city: string
    coordinates: { lat: number; lng: number }
  }
  specs: {
    bedrooms: number
    bathrooms: number
    area: number
    floor: number
    totalFloors: number
  }
  amenities: string[]
  landlord: LandlordProfile
  reviews: PropertyReview[]
  overallRating: number
  socialMetrics: {
    views: number
    saves: number
    shares: number
    inquiries: number
  }
  availableFrom: Date
  lastActive: string
  isPromoted: boolean
  trustBadges: string[]
}

// Mock data with social elements
const MOCK_SOCIAL_LISTINGS: SocialPropertyListing[] = [
  {
    id: '1',
    title: 'Cozy Studio in Herastrau Park Area',
    description: 'Beautiful studio apartment with park view, perfect for young professionals.',
    price: 750,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800'
    ],
    location: {
      address: 'Str. Herastrau 45',
      neighborhood: 'Herastrau',
      city: 'Bucharest',
      coordinates: { lat: 44.4698, lng: 26.0881 }
    },
    specs: {
      bedrooms: 0,
      bathrooms: 1,
      area: 35,
      floor: 3,
      totalFloors: 5
    },
    amenities: ['wifi', 'parking', 'balcony', 'elevator'],
    landlord: {
      id: 'landlord1',
      name: 'Maria Popescu',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      rating: 4.8,
      reviewCount: 127,
      responseTime: 'within 1 hour',
      verificationStatus: 'verified',
      socialScore: 92,
      propertiesCount: 8,
      joinedDate: '2022-03-15',
      badges: ['super-host', 'quick-responder', 'eco-friendly']
    },
    reviews: [
      {
        id: 'review1',
        tenantName: 'Alex M.',
        tenantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        rating: 5,
        comment: 'Maria is an amazing landlord! Always responsive and the apartment was exactly as described.',
        date: '2024-09-15',
        verified: true,
        helpfulCount: 12,
        aspects: { cleanliness: 5, communication: 5, accuracy: 5, value: 4 }
      }
    ],
    overallRating: 4.7,
    socialMetrics: {
      views: 1240,
      saves: 89,
      shares: 23,
      inquiries: 45
    },
    availableFrom: new Date('2024-12-01'),
    lastActive: '2 hours ago',
    isPromoted: true,
    trustBadges: ['verified-photos', 'instant-book', 'background-checked']
  },
  {
    id: '2',
    title: 'Modern 2BR Apartment in Old Town',
    description: 'Stylish apartment in the heart of historic Bucharest, walking distance to everything.',
    price: 1200,
    currency: 'EUR',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    location: {
      address: 'Str. Lipscani 12',
      neighborhood: 'Old Town',
      city: 'Bucharest',
      coordinates: { lat: 44.4307, lng: 26.1011 }
    },
    specs: {
      bedrooms: 2,
      bathrooms: 1,
      area: 65,
      floor: 2,
      totalFloors: 4
    },
    amenities: ['wifi', 'tv', 'kitchen', 'balcony'],
    landlord: {
      id: 'landlord2',
      name: 'Andrei Stefan',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      rating: 4.6,
      reviewCount: 89,
      responseTime: 'within 3 hours',
      verificationStatus: 'verified',
      socialScore: 87,
      propertiesCount: 12,
      joinedDate: '2021-11-20',
      badges: ['experienced-host', 'pet-friendly']
    },
    reviews: [
      {
        id: 'review2',
        tenantName: 'Sarah L.',
        tenantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        rating: 4,
        comment: 'Great location and Andrei was helpful throughout. Apartment could use some updates but overall good value.',
        date: '2024-08-20',
        verified: true,
        helpfulCount: 8,
        aspects: { cleanliness: 4, communication: 5, accuracy: 4, value: 4 }
      }
    ],
    overallRating: 4.3,
    socialMetrics: {
      views: 2100,
      saves: 156,
      shares: 67,
      inquiries: 89
    },
    availableFrom: new Date('2024-11-15'),
    lastActive: '1 day ago',
    isPromoted: false,
    trustBadges: ['verified-photos', 'long-term-host']
  }
]

export function SocialSearchForRentPage() {
  const [listings] = useState<SocialPropertyListing[]>(MOCK_SOCIAL_LISTINGS)
  const [filteredListings, setFilteredListings] = useState<SocialPropertyListing[]>(MOCK_SOCIAL_LISTINGS)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({})
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessages, setAiMessages] = useState<Array<{id: string, type: 'user' | 'bot', content: string}>>([
    { id: '1', type: 'bot', content: "Hi! I'm your AI search assistant. Try asking: 'Show me 2-bedroom apartments under €1000' or 'Pet-friendly places in Herastrau'" }
  ])
  const [aiInput, setAiInput] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  
  const [filters, setFilters] = useState<SocialSearchFilters>({
    query: '',
    location: '',
    priceRange: { min: 0, max: 2000 },
    propertyType: [],
    bedrooms: { min: 0, max: 10 },
    amenities: [],
    landlordRating: 0,
    verifiedLandlord: false,
    responseTime: 24,
    socialScore: 0
  })

  const filterDropdownRef = useRef<HTMLDivElement>(null)

  // Apply filters
  useEffect(() => {
    let filtered = listings

    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.description.toLowerCase().includes(query) ||
        listing.location.address.toLowerCase().includes(query) ||
        listing.location.neighborhood.toLowerCase().includes(query)
      )
    }

    if (filters.location) {
      filtered = filtered.filter(listing =>
        listing.location.neighborhood.toLowerCase().includes(filters.location.toLowerCase()) ||
        listing.location.city.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    filtered = filtered.filter(listing =>
      listing.price >= filters.priceRange.min && listing.price <= filters.priceRange.max
    )

    if (filters.landlordRating > 0) {
      filtered = filtered.filter(listing => listing.landlord.rating >= filters.landlordRating)
    }

    if (filters.verifiedLandlord) {
      filtered = filtered.filter(listing => listing.landlord.verificationStatus === 'verified')
    }

    if (filters.socialScore > 0) {
      filtered = filtered.filter(listing => listing.landlord.socialScore >= filters.socialScore)
    }

    setFilteredListings(filtered)
  }, [filters, listings])

  const handleAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return

    const userMessage = { id: Date.now().toString(), type: 'user' as const, content: aiInput }
    setAiMessages(prev => [...prev, userMessage])
    setAiInput('')
    setIsAiLoading(true)

    // Simple rule-based AI response for demo
    setTimeout(() => {
      const response = processAiQuery(aiInput)
      const botMessage = { 
        id: (Date.now() + 1).toString(), 
        type: 'bot' as const, 
        content: response.message 
      }
      setAiMessages(prev => [...prev, botMessage])
      
      if (response.filters) {
        setFilters(prev => ({ ...prev, ...response.filters }))
      }
      setIsAiLoading(false)
    }, 1000)
  }

  const processAiQuery = (query: string) => {
    const lowerQuery = query.toLowerCase()
    let message = "I've updated your search based on your request!"
    let newFilters: Partial<SocialSearchFilters> = {}

    // Extract bedrooms
    if (lowerQuery.includes('studio')) {
      newFilters.bedrooms = { min: 0, max: 0 }
      message = "Looking for studio apartments!"
    } else if (lowerQuery.match(/(\d+)\s*bed/)) {
      const bedrooms = parseInt(lowerQuery.match(/(\d+)\s*bed/)![1])
      newFilters.bedrooms = { min: bedrooms, max: bedrooms }
      message = `Searching for ${bedrooms}-bedroom properties!`
    }

    // Extract price
    if (lowerQuery.match(/under|below.*?(\d+)/)) {
      const price = parseInt(lowerQuery.match(/under|below.*?(\d+)/)![1])
      newFilters.priceRange = { min: 0, max: price }
      message += ` Under €${price}/month.`
    }

    // Extract location
    if (lowerQuery.includes('herastrau')) {
      newFilters.location = 'Herastrau'
      message += ' In Herastrau area.'
    } else if (lowerQuery.includes('old town')) {
      newFilters.location = 'Old Town'
      message += ' In Old Town area.'
    }

    // Pet-friendly
    if (lowerQuery.includes('pet')) {
      message += ' Pet-friendly properties only.'
    }

    return { message, filters: Object.keys(newFilters).length > 0 ? newFilters : null }
  }

  const toggleFavorite = (listingId: string) => {
    setFavorites(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    )
  }

  const nextImage = (listingId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [listingId]: ((prev[listingId] || 0) + 1) % totalImages
    }))
  }

  const prevImage = (listingId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [listingId]: ((prev[listingId] || 0) - 1 + totalImages) % totalImages
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      priceRange: { min: 0, max: 2000 },
      propertyType: [],
      bedrooms: { min: 0, max: 10 },
      amenities: [],
      landlordRating: 0,
      verifiedLandlord: false,
      responseTime: 24,
      socialScore: 0
    })
  }

  const getBadgeColor = (badge: string) => {
    const colors: { [key: string]: string } = {
      'super-host': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'quick-responder': 'bg-gradient-to-r from-green-500 to-blue-500 text-white',
      'eco-friendly': 'bg-gradient-to-r from-green-400 to-green-600 text-white',
      'experienced-host': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
      'pet-friendly': 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
    }
    return colors[badge] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Hero Search Header */}
      <div className="relative bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-pink-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Discover Your Perfect Home
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Find trusted landlords, verified properties, and your next home through our social rental platform
            </p>
          </motion.div>

          {/* Main Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20" />
              <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      value={filters.query}
                      onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                      placeholder="Search by location, property type, or features..."
                      className="pl-12 h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl focus:border-blue-500"
                    />
                  </div>

                  {/* AI Chat Toggle */}
                  <div className="relative">
                    <Button
                      onClick={() => setShowAIChat(!showAIChat)}
                      className={`h-12 px-6 rounded-xl transition-all ${
                        showAIChat 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      <Bot className="mr-2 h-5 w-5" />
                      AI Assistant
                      {showAIChat && <Sparkles className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>

                  {/* Filters Dropdown */}
                  <div className="relative" ref={filterDropdownRef}>
                    <Button
                      onClick={() => setShowFilters(!showFilters)}
                      variant="outline"
                      className="h-12 px-6 bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 rounded-xl"
                    >
                      <SlidersHorizontal className="mr-2 h-5 w-5" />
                      Filters
                      <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </div>

      {/* Quick Social Filters */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Badge 
            variant={filters.verifiedLandlord ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap rounded-full"
            onClick={() => setFilters(prev => ({ ...prev, verifiedLandlord: !prev.verifiedLandlord }))}
          >
            <Shield className="h-3 w-3 mr-1" />
            Verified Only
          </Badge>
          <Badge 
            variant={filters.landlordRating >= 4.5 ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap rounded-full"
            onClick={() => setFilters(prev => ({ ...prev, landlordRating: prev.landlordRating >= 4.5 ? 0 : 4.5 }))}
          >
            <Star className="h-3 w-3 mr-1" />
            Top Rated
          </Badge>
          <Badge 
            variant={filters.responseTime <= 2 ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap rounded-full"
            onClick={() => setFilters(prev => ({ ...prev, responseTime: prev.responseTime <= 2 ? 24 : 2 }))}
          >
            <Clock className="h-3 w-3 mr-1" />
            Quick Response
          </Badge>
          <Badge 
            variant={filters.socialScore >= 80 ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap rounded-full"
            onClick={() => setFilters(prev => ({ ...prev, socialScore: prev.socialScore >= 80 ? 0 : 80 }))}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            High Social Score
          </Badge>
        </div>
      </div>

      {/* Results Header */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredListings.length} Properties Found
            </h2>
            <p className="text-sm text-gray-500">
              Sorted by social score & relevance
            </p>
          </div>
        </div>
      </div>

      {/* Property Cards - Mobile-First Design */}
      <div className="px-4 py-4 space-y-4">
        {filteredListings.map((listing) => (
          <PropertySocialCard 
            key={listing.id}
            listing={listing}
            isFavorite={favorites.includes(listing.id)}
            onToggleFavorite={() => toggleFavorite(listing.id)}
            currentImageIndex={currentImageIndex[listing.id] || 0}
            onNextImage={() => nextImage(listing.id, listing.images.length)}
            onPrevImage={() => prevImage(listing.id, listing.images.length)}
          />
        ))}
      </div>

    </div>
  )
}

function PropertySocialCard({ 
  listing, 
  isFavorite, 
  onToggleFavorite,
  currentImageIndex,
  onNextImage,
  onPrevImage
}: { 
  listing: SocialPropertyListing
  isFavorite: boolean
  onToggleFavorite: () => void
  currentImageIndex: number
  onNextImage: () => void
  onPrevImage: () => void
}) {
  const getBadgeColor = (badge: string) => {
    const colors: { [key: string]: string } = {
      'super-host': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'quick-responder': 'bg-gradient-to-r from-green-500 to-blue-500 text-white',
      'eco-friendly': 'bg-gradient-to-r from-green-400 to-green-600 text-white',
      'experienced-host': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
      'pet-friendly': 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
    }
    return colors[badge] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl">
      <CardContent className="p-0">
        {/* Image Carousel */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          
          {/* Image Navigation */}
          {listing.images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
                onClick={onPrevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
                onClick={onNextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              {/* Image Dots */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                {listing.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Promoted Badge */}
          {listing.isPromoted && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                <TrendingUp className="h-3 w-3 mr-1" />
                Promoted
              </Badge>
            </div>
          )}

          {/* Price Overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/80 text-white px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="text-lg font-bold">€{listing.price}</span>
              <span className="text-sm opacity-90">/month</span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Title and Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {listing.title}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              {listing.location.neighborhood}, {listing.location.city}
            </div>
          </div>

          {/* Landlord Profile Section - Key Social Element */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={listing.landlord.avatar} />
                    <AvatarFallback>{listing.landlord.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {listing.landlord.verificationStatus === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                      <Verified className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{listing.landlord.name}</h4>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{listing.landlord.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({listing.landlord.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Responds {listing.landlord.responseTime}</span>
                    <span>{listing.landlord.propertiesCount} properties</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">{listing.landlord.socialScore}</div>
                <div className="text-xs text-gray-500">Social Score</div>
              </div>
            </div>

            {/* Landlord Badges */}
            <div className="flex flex-wrap gap-1">
              {listing.landlord.badges.map((badge) => (
                <Badge
                  key={badge}
                  className={`text-xs px-2 py-0.5 ${getBadgeColor(badge)} border-0`}
                >
                  {badge.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>{listing.specs.bedrooms}BR</span>
              <span>{listing.specs.bathrooms}BA</span>
              <span>{listing.specs.area}m²</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{listing.socialMetrics.inquiries}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                <span>{listing.socialMetrics.saves}</span>
              </div>
            </div>
          </div>

          {/* Recent Review Preview */}
          {listing.reviews.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={listing.reviews[0].tenantAvatar} />
                  <AvatarFallback>{listing.reviews[0].tenantName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{listing.reviews[0].tenantName}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < listing.reviews[0].rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">
                "{listing.reviews[0].comment}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Link href={`/tenant/property/${listing.id}`} className="flex-1">
              <Button variant="outline" className="w-full rounded-full">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
