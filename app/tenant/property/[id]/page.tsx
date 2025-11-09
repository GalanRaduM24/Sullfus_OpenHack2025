'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Home,
  Calendar,
  Star,
  Wifi,
  Car,
  Tv,
  Coffee,
  Dumbbell,
  Dog,
  CheckCircle,
  X,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Users,
  Shield,
  TrendingUp,
  Verified,
  Eye,
  Navigation,
  Ruler,
  TreePine,
  Zap,
  Waves,
  WashingMachine,
  Snowflake,
  Thermometer,
  Send,
  ChefHat,
  Sofa,
  Sun,
  ArrowUp
} from 'lucide-react'

interface PropertyListing {
  id: string
  title: string
  description: string
  price: number
  currency: 'EUR' | 'RON'
  location: {
    address: string
    city: string
    neighborhood: string
    coordinates: { lat: number; lng: number }
  }
  type: string
  specs: {
    bedrooms: number
    bathrooms: number
    area: number
    floor: number
    totalFloors: number
  }
  amenities: string[]
  features: string[]
  images: string[]
  landlord: {
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
  reviews: Array<{
    id: string
    tenantName: string
    tenantAvatar: string
    rating: number
    comment: string
    date: string
    verified: boolean
    aspects: {
      cleanliness: number
      communication: number
      accuracy: number
      value: number
    }
  }>
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
  socialMetrics: {
    views: number
    saves: number
    shares: number
    inquiries: number
  }
  trustBadges: string[]
  createdAt: Date
  updatedAt: Date
}

// Enhanced mock data
const MOCK_PROPERTY: PropertyListing = {
  id: '1',
  title: 'Luxury 2BR Apartment in Herastrau Park Area',
  description: 'Experience modern living in this stunning 2-bedroom apartment overlooking Herastrau Park. This fully furnished luxury property features premium finishes, state-of-the-art appliances, and breathtaking park views. Located in one of Bucharest\'s most prestigious neighborhoods, you\'ll enjoy easy access to upscale dining, shopping, and recreational activities. Perfect for professionals seeking comfort, style, and convenience in the heart of the city.',
  price: 1200,
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
    bathrooms: 2,
    area: 85,
    floor: 5,
    totalFloors: 12
  },
  amenities: ['wifi', 'parking', 'tv', 'kitchen', 'balcony', 'gym', 'pool', 'concierge'],
  features: ['Air Conditioning', 'Floor Heating', 'Dishwasher', 'Smart Home System', 'Premium Appliances'],
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=1200'
  ],
  landlord: {
    id: 'landlord1',
    name: 'Maria Popescu',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    rating: 4.9,
    reviewCount: 127,
    responseTime: 'within 1 hour',
    verificationStatus: 'verified',
    socialScore: 95,
    propertiesCount: 12,
    joinedDate: '2022-03-15',
    badges: ['super-host', 'quick-responder', 'luxury-specialist']
  },
  reviews: [
    {
      id: 'review1',
      tenantName: 'Alex M.',
      tenantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      rating: 5,
      comment: 'Absolutely stunning apartment with incredible park views. Maria is an exceptional landlord - always responsive and professional. The building amenities are top-notch!',
      date: '2024-09-15',
      verified: true,
      aspects: { cleanliness: 5, communication: 5, accuracy: 5, value: 4 }
    },
    {
      id: 'review2',
      tenantName: 'Sarah L.',
      tenantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      rating: 5,
      comment: 'Perfect location and beautiful apartment. Everything was exactly as described. Highly recommend!',
      date: '2024-08-20',
      verified: true,
      aspects: { cleanliness: 5, communication: 4, accuracy: 5, value: 5 }
    }
  ],
  available: true,
  availableFrom: new Date('2025-12-01'),
  petFriendly: true,
  smokingAllowed: false,
  furnished: true,
  utilities: {
    included: ['Heating', 'Water', 'Internet'],
    excluded: ['Electricity']
  },
  deposit: 1200,
  socialMetrics: {
    views: 2847,
    saves: 156,
    shares: 34,
    inquiries: 89
  },
  trustBadges: ['verified-photos', 'instant-book', 'background-checked'],
  createdAt: new Date('2025-10-01'),
  updatedAt: new Date('2025-11-08')
}

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  tv: Tv,
  kitchen: ChefHat,
  gym: Dumbbell,
  balcony: Sun,
  garden: TreePine,
  pool: Waves,
  concierge: Users,
  ac: Snowflake,
  heating: Thermometer,
  elevator: ArrowUp,
  security: Shield,
  furnished: Sofa
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<PropertyListing | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAllImages, setShowAllImages] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperty(MOCK_PROPERTY)
      setLoading(false)
    }, 800)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Property not found</h2>
          <p className="text-gray-400 mb-4">The property you're looking for doesn't exist.</p>
          <Button onClick={() => router.back()} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'super-host': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      'quick-responder': 'bg-gradient-to-r from-green-500 to-blue-500 text-white',
      'luxury-specialist': 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
    }
    return colors[badge] || 'bg-gray-600 text-white'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsFavorite(!isFavorite)}
              className="text-white hover:bg-gray-800"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" className="text-white hover:bg-gray-800">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Image Gallery */}
      <div className="relative">
        <div className="aspect-[21/9] relative overflow-hidden">
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="lg"
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Image Counter */}
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>

          {/* View All Photos Button */}
          <Button
            onClick={() => setShowAllImages(true)}
            className="absolute bottom-4 right-4 bg-white text-black hover:bg-gray-200"
          >
            <Grid3X3 className="mr-2 h-4 w-4" />
            View All Photos
          </Button>

          {/* Property Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-600 text-white">Available</Badge>
                {property.trustBadges.map((badge) => (
                  <Badge key={badge} variant="outline" className="border-white/30 text-white">
                    <Verified className="mr-1 h-3 w-3" />
                    {badge.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-4 text-lg">
                <div className="flex items-center gap-1">
                  <MapPin className="h-5 w-5" />
                  {property.location.neighborhood}, {property.location.city}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Bed className="h-5 w-5" />
                    {property.specs.bedrooms} BR
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-5 w-5" />
                    {property.specs.bathrooms} BA
                  </span>
                  <span className="flex items-center gap-1">
                    <Ruler className="h-5 w-5" />
                    {property.specs.area}m²
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Thumbnails */}
        <div className="absolute bottom-20 left-6 right-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex ? 'border-white' : 'border-transparent opacity-70'
                }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price and Key Info */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">
                      €{property.price}
                      <span className="text-lg font-normal text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-400">Deposit: €{property.deposit}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Available from</div>
                    <div className="text-white font-semibold">
                      {property.availableFrom.toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/50 rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{property.specs.bedrooms}</div>
                    <div className="text-sm text-gray-400">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{property.specs.bathrooms}</div>
                    <div className="text-sm text-gray-400">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{property.specs.area}</div>
                    <div className="text-sm text-gray-400">m²</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{property.specs.floor}</div>
                    <div className="text-sm text-gray-400">Floor</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">Overview</TabsTrigger>
                <TabsTrigger value="amenities" className="data-[state=active]:bg-blue-600">Amenities</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600">Reviews</TabsTrigger>
                <TabsTrigger value="location" className="data-[state=active]:bg-blue-600">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">About this property</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">{property.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Property Features</h4>
                        <ul className="space-y-2">
                          {property.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2 text-gray-300">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-3">Utilities</h4>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Included:</p>
                            {property.utilities.included.map((utility) => (
                              <span key={utility} className="inline-block bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs mr-1 mb-1">
                                {utility}
                              </span>
                            ))}
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Not included:</p>
                            {property.utilities.excluded.map((utility) => (
                              <span key={utility} className="inline-block bg-red-900/30 text-red-400 px-2 py-1 rounded text-xs mr-1 mb-1">
                                {utility}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-3">Property Rules</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Dog className={`h-4 w-4 ${property.petFriendly ? 'text-green-500' : 'text-red-500'}`} />
                            Pets {property.petFriendly ? 'allowed' : 'not allowed'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <X className={`h-4 w-4 ${property.smokingAllowed ? 'text-green-500' : 'text-red-500'}`} />
                            Smoking {property.smokingAllowed ? 'allowed' : 'not allowed'}
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Sofa className={`h-4 w-4 ${property.furnished ? 'text-green-500' : 'text-orange-500'}`} />
                            {property.furnished ? 'Furnished' : 'Unfurnished'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="amenities" className="mt-6">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Amenities & Features</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {property.amenities.map((amenity) => {
                        const IconComponent = AMENITY_ICONS[amenity]
                        return (
                          <div key={amenity} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                            {IconComponent && <IconComponent className="h-5 w-5 text-blue-400" />}
                            <span className="text-white capitalize">{amenity.replace('-', ' ')}</span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">Reviews</h3>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span className="text-white font-semibold">{property.landlord.rating}</span>
                        <span className="text-gray-400">({property.reviews.length} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {property.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-700 pb-6 last:border-b-0">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={review.tenantAvatar} />
                              <AvatarFallback className="bg-gray-700 text-white">
                                {review.tenantName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-white">{review.tenantName}</span>
                                {review.verified && (
                                  <Badge className="bg-green-600 text-white text-xs">
                                    <Verified className="mr-1 h-3 w-3" />
                                    Verified
                                  </Badge>
                                )}
                                <span className="text-gray-400 text-sm">{review.date}</span>
                              </div>
                              <div className="flex gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-300">{review.comment}</p>
                              
                              <div className="grid grid-cols-4 gap-3 mt-4 p-3 bg-gray-800/30 rounded-lg">
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-white">{review.aspects.cleanliness}/5</div>
                                  <div className="text-xs text-gray-400">Cleanliness</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-white">{review.aspects.communication}/5</div>
                                  <div className="text-xs text-gray-400">Communication</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-white">{review.aspects.accuracy}/5</div>
                                  <div className="text-xs text-gray-400">Accuracy</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm font-semibold text-white">{review.aspects.value}/5</div>
                                  <div className="text-xs text-gray-400">Value</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-6">Location & Neighborhood</h3>
                    
                    <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                      <div className="text-center">
                        <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400">Interactive map coming soon</p>
                        <p className="text-sm text-gray-500 mt-1">{property.location.address}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Address</h4>
                        <p className="text-gray-300">{property.location.address}</p>
                        <p className="text-gray-300">{property.location.neighborhood}, {property.location.city}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Transportation</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Navigation className="h-4 w-4 text-blue-400" />
                            <span>5 min walk to metro station</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-300">
                            <Car className="h-4 w-4 text-blue-400" />
                            <span>Parking available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Landlord Profile */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={property.landlord.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                        {property.landlord.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {property.landlord.verificationStatus === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <Verified className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg">{property.landlord.name}</h4>
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-white">{property.landlord.rating}</span>
                      <span className="text-gray-400">({property.landlord.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>Responds {property.landlord.responseTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {property.landlord.socialScore}
                    </div>
                    <div className="text-xs text-gray-400">Social Score</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {property.landlord.badges.map((badge) => (
                    <Badge key={badge} className={`text-xs px-2 py-1 ${getBadgeColor(badge)} border-0`}>
                      {badge.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>

                <Separator className="bg-gray-700 my-4" />

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                    <Button variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Quick Actions</h4>
                <div className="space-y-3">
                  <Button size="lg" className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Viewing
                  </Button>
                  <Button variant="outline" size="lg" className="w-full bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50">
                    <Send className="mr-2 h-5 w-5" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Social Metrics */}
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardContent className="p-6">
                <h4 className="font-semibold text-white mb-4">Property Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{property.socialMetrics.views}</div>
                    <div className="text-xs text-gray-400">Views</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{property.socialMetrics.saves}</div>
                    <div className="text-xs text-gray-400">Saves</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{property.socialMetrics.shares}</div>
                    <div className="text-xs text-gray-400">Shares</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-xl font-bold text-white">{property.socialMetrics.inquiries}</div>
                    <div className="text-xs text-gray-400">Inquiries</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* All Images Modal */}
      <AnimatePresence>
        {showAllImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowAllImages(false)}
          >
            <div className="max-w-4xl w-full max-h-full overflow-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.images.map((image, index) => (
                  <motion.img
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    src={image}
                    alt={`Property image ${index + 1}`}
                    className="w-full aspect-video object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                      setShowAllImages(false)
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}