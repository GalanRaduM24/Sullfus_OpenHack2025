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
  Home as HomeIcon,
  Car,
  Wifi,
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
  landlordRating: number
  verifiedLandlord: boolean
  responseTime: number
  socialScore: number
}

interface LandlordProfile {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  responseTime: string
  verificationStatus: 'verified' | 'pending' | 'unverified'
  socialScore: number
  propertiesCount: number
  joinedDate: string
  badges: string[]
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

// Mock data
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

    if (lowerQuery.includes('studio')) {
      newFilters.bedrooms = { min: 0, max: 0 }
      message = "Looking for studio apartments!"
    } else if (lowerQuery.match(/(\d+)\s*bed/)) {
      const bedrooms = parseInt(lowerQuery.match(/(\d+)\s*bed/)![1])
      newFilters.bedrooms = { min: bedrooms, max: bedrooms }
      message = `Searching for ${bedrooms}-bedroom properties!`
    }

    if (lowerQuery.match(/under|below.*?(\d+)/)) {
      const price = parseInt(lowerQuery.match(/under|below.*?(\d+)/)![1])
      newFilters.priceRange = { min: 0, max: price }
      message += ` Under €${price}/month.`
    }

    if (lowerQuery.includes('herastrau')) {
      newFilters.location = 'Herastrau'
      message += ' In Herastrau area.'
    } else if (lowerQuery.includes('old town')) {
      newFilters.location = 'Old Town'
      message += ' In Old Town area.'
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
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      value={filters.query}
                      onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                      placeholder="Search by location, property type, or features..."
                      className="pl-12 h-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-xl focus:border-blue-500"
                    />
                  </div>

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

                {/* AI Chat Inline */}
                <AnimatePresence>
                  {showAIChat && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-gray-700"
                    >
                      <div className="bg-gray-900/50 rounded-xl p-4 max-h-60 overflow-y-auto mb-4">
                        {aiMessages.map((message) => (
                          <div key={message.id} className={`mb-3 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-lg ${
                              message.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-700 text-gray-100'
                            }`}>
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                        {isAiLoading && (
                          <div className="flex justify-start mb-3">
                            <div className="bg-gray-700 px-4 py-2 rounded-lg">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAiMessage()}
                          placeholder="Ask me anything... 'Show me studios under €800' or 'Pet-friendly places'"
                          className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                        />
                        <Button
                          onClick={handleAiMessage}
                          disabled={!aiInput.trim() || isAiLoading}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Quick Social Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mt-8"
          >
            {[
              { label: 'Verified Only', icon: Shield, active: filters.verifiedLandlord, 
                onClick: () => setFilters(prev => ({ ...prev, verifiedLandlord: !prev.verifiedLandlord })) },
              { label: 'Top Rated', icon: Star, active: filters.landlordRating >= 4.5,
                onClick: () => setFilters(prev => ({ ...prev, landlordRating: prev.landlordRating >= 4.5 ? 0 : 4.5 })) },
              { label: 'Quick Response', icon: Clock, active: filters.responseTime <= 2,
                onClick: () => setFilters(prev => ({ ...prev, responseTime: prev.responseTime <= 2 ? 24 : 2 })) },
              { label: 'High Social Score', icon: TrendingUp, active: filters.socialScore >= 80,
                onClick: () => setFilters(prev => ({ ...prev, socialScore: prev.socialScore >= 80 ? 0 : 80 })) }
            ].map((filter, index) => (
              <motion.div
                key={filter.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge
                  variant={filter.active ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                    filter.active 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0' 
                      : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50'
                  }`}
                  onClick={filter.onClick}
                >
                  <filter.icon className="h-4 w-4 mr-2" />
                  {filter.label}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Advanced Filters Dropdown */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800"
          >
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Price Range (€/month)</Label>
                  <div className="px-2">
                    <Slider
                      value={[filters.priceRange.min, filters.priceRange.max]}
                      onValueChange={([min, max]) => setFilters(prev => ({ ...prev, priceRange: { min, max } }))}
                      max={2000}
                      step={50}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>€{filters.priceRange.min}</span>
                      <span>€{filters.priceRange.max}</span>
                    </div>
                  </div>
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Bedrooms</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        variant={filters.bedrooms.min === num && filters.bedrooms.max === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, bedrooms: { min: num, max: num } }))}
                        className={`h-8 text-xs ${
                          filters.bedrooms.min === num && filters.bedrooms.max === num
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0'
                            : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-700/50'
                        }`}
                      >
                        {num === 0 ? 'Studio' : `${num}BR`}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Property Type</Label>
                  <div className="space-y-2">
                    {['apartment', 'house', 'studio', 'room'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={filters.propertyType.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, propertyType: [...prev.propertyType, type] }))
                            } else {
                              setFilters(prev => ({ ...prev, propertyType: prev.propertyType.filter(t => t !== type) }))
                            }
                          }}
                          className="border-gray-600 data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor={type} className="text-sm text-gray-300 capitalize cursor-pointer">
                          {type}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-300">Amenities</Label>
                  <div className="space-y-2">
                    {[
                      { value: 'wifi', label: 'WiFi', icon: Wifi },
                      { value: 'parking', label: 'Parking', icon: Car },
                      { value: 'gym', label: 'Gym', icon: Dumbbell },
                      { value: 'balcony', label: 'Balcony', icon: HomeIcon }
                    ].map((amenity) => (
                      <div key={amenity.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.value}
                          checked={filters.amenities.includes(amenity.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFilters(prev => ({ ...prev, amenities: [...prev.amenities, amenity.value] }))
                            } else {
                              setFilters(prev => ({ ...prev, amenities: prev.amenities.filter(a => a !== amenity.value) }))
                            }
                          }}
                          className="border-gray-600 data-[state=checked]:bg-blue-600"
                        />
                        <Label htmlFor={amenity.value} className="text-sm text-gray-300 flex items-center cursor-pointer">
                          <amenity.icon className="h-3 w-3 mr-1" />
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() => setShowFilters(false)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {filteredListings.length} Properties Found
            </h2>
            <p className="text-gray-400">
              Sorted by social score & relevance
            </p>
          </div>
        </div>

        {/* Property Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden bg-gray-900/50 backdrop-blur-xl border-gray-800 hover:border-gray-700 transition-all duration-300">
        <CardContent className="p-0">
          {/* Image Carousel */}
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            
            {/* Image Navigation */}
            {listing.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 border-0"
                  onClick={onPrevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 border-0"
                  onClick={onNextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                {/* Image Dots */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {listing.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
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
                className="bg-black/40 hover:bg-black/60 text-white rounded-full p-2 border-0"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="bg-black/40 hover:bg-black/60 text-white rounded-full p-2 border-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Promoted Badge */}
            {listing.isPromoted && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}

            {/* Price Overlay */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-xl font-bold">€{listing.price}</span>
                <span className="text-sm opacity-90">/month</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Title and Location */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {listing.title}
              </h3>
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location.neighborhood}, {listing.location.city}
              </div>
            </div>

            {/* Landlord Profile Section */}
            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={listing.landlord.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {listing.landlord.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {listing.landlord.verificationStatus === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <Verified className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">{listing.landlord.name}</h4>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium ml-1 text-white">{listing.landlord.rating}</span>
                        <span className="text-sm text-gray-400 ml-1">({listing.landlord.reviewCount})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Responds {listing.landlord.responseTime}</span>
                      <span>{listing.landlord.propertiesCount} properties</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {listing.landlord.socialScore}
                  </div>
                  <div className="text-xs text-gray-400">Social Score</div>
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
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-4">
                <span className="text-white">{listing.specs.bedrooms || 'Studio'}</span>
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
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={listing.reviews[0].tenantAvatar} />
                    <AvatarFallback className="bg-gray-700 text-white text-xs">
                      {listing.reviews[0].tenantName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-white">{listing.reviews[0].tenantName}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < listing.reviews[0].rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">
                  "{listing.reviews[0].comment}"
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Link href={`/tenant/property/${listing.id}`} className="flex-1">
                <Button variant="outline" className="w-full bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}