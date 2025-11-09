'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileVerificationGuard } from '@/components/landlord/ProfileVerificationGuard'
import TenantFilter from '@/components/landlord/TenantFilter'
import Link from 'next/link'
import { 
  Plus, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Bed,
  Bath,
  Home,
  Euro,
  Calendar,
  Star,
  Users,
  Heart,
  MessageSquare,
  Phone,
  Mail,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Download,
  Share2
} from 'lucide-react'

interface Property {
  id: string
  title: string
  description: string
  price: number
  currency: 'EUR' | 'RON'
  location: {
    address: string
    city: string
    neighborhood: string
  }
  specs: {
    bedrooms: number
    bathrooms: number
    area: number
  }
  images: string[]
  status: 'active' | 'pending' | 'inactive'
  views: number
  favorites: number
  inquiries: number
  createdAt: Date
  updatedAt: Date
}

interface TenantInquiry {
  id: string
  propertyId: string
  tenantId: string
  tenantName: string
  tenantAvatar: string
  tenantEmail: string
  tenantPhone: string
  message: string
  budget: number
  moveInDate: string
  familySize: number
  hasChildren: boolean
  hasPets: boolean
  occupation: string
  income: number
  creditScore?: number
  references: string[]
  status: 'new' | 'viewed' | 'interested' | 'rejected' | 'accepted'
  createdAt: Date
  tenantProfile: {
    age: number
    profession: string
    yearsInCity: number
    smokingStatus: 'non-smoker' | 'smoker' | 'occasional'
    personality: string[]
    interests: string[]
    languagesSpoken: string[]
  }
}

// Mock data
const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Luxury 2BR Apartment in Herastrau',
    description: 'Beautiful modern apartment with park views',
    price: 1200,
    currency: 'EUR',
    location: {
      address: 'Strada Nordului 15',
      city: 'Bucharest',
      neighborhood: 'Herastrau'
    },
    specs: {
      bedrooms: 2,
      bathrooms: 2,
      area: 85
    },
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
    status: 'active',
    views: 2847,
    favorites: 156,
    inquiries: 23,
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-11-08')
  }
]

const MOCK_INQUIRIES: TenantInquiry[] = [
  {
    id: '1',
    propertyId: '1',
    tenantId: 'tenant1',
    tenantName: 'Alex Johnson',
    tenantAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    tenantEmail: 'alex.johnson@email.com',
    tenantPhone: '+40 123 456 789',
    message: 'Hi! I\'m very interested in your property. I\'m a software engineer working remotely with a stable income. I\'m looking for a long-term rental (minimum 1 year). The location is perfect for me as I enjoy outdoor activities in Herastrau Park. Would love to schedule a viewing!',
    budget: 1300,
    moveInDate: '2025-12-15',
    familySize: 1,
    hasChildren: false,
    hasPets: false,
    occupation: 'Software Engineer',
    income: 8500,
    creditScore: 750,
    references: ['Previous landlord: Maria Ionescu', 'Employer: TechCorp SRL'],
    status: 'new',
    createdAt: new Date('2025-11-08'),
    tenantProfile: {
      age: 28,
      profession: 'Software Engineer',
      yearsInCity: 3,
      smokingStatus: 'non-smoker',
      personality: ['responsible', 'quiet', 'organized', 'professional'],
      interests: ['technology', 'fitness', 'reading', 'photography'],
      languagesSpoken: ['Romanian', 'English', 'Spanish']
    }
  },
  {
    id: '2',
    propertyId: '1',
    tenantId: 'tenant2',
    tenantName: 'Sarah & David Miller',
    tenantAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    tenantEmail: 'sarah.miller@email.com',
    tenantPhone: '+40 987 654 321',
    message: 'Hello! We are a professional couple (both doctors) looking for a beautiful apartment to call home. We have stable jobs and excellent references. We\'re very clean, responsible tenants who take great care of properties. No smoking, no pets, no parties. Looking for 2+ year lease.',
    budget: 1250,
    moveInDate: '2025-12-01',
    familySize: 2,
    hasChildren: false,
    hasPets: false,
    occupation: 'Medical Doctors',
    income: 15000,
    creditScore: 820,
    references: ['Previous landlord: Ion Popescu', 'Hospital HR Department'],
    status: 'viewed',
    createdAt: new Date('2025-11-07'),
    tenantProfile: {
      age: 32,
      profession: 'Medical Doctors',
      yearsInCity: 5,
      smokingStatus: 'non-smoker',
      personality: ['professional', 'responsible', 'quiet', 'respectful'],
      interests: ['medicine', 'travel', 'cooking', 'classical music'],
      languagesSpoken: ['Romanian', 'English', 'French']
    }
  },
  {
    id: '3',
    propertyId: '1',
    tenantId: 'tenant3',
    tenantName: 'Michael Chen',
    tenantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    tenantEmail: 'michael.chen@email.com',
    tenantPhone: '+40 555 123 456',
    message: 'Hi there! I\'m a marketing manager at an international company. I travel occasionally for work but maintain a clean, organized home. I\'m looking for a modern apartment in a nice area. I have a small, well-trained cat - hope that\'s okay! References available upon request.',
    budget: 1150,
    moveInDate: '2025-12-20',
    familySize: 1,
    hasChildren: false,
    hasPets: true,
    occupation: 'Marketing Manager',
    income: 6800,
    creditScore: 690,
    references: ['Previous landlord: Ana Georgescu'],
    status: 'interested',
    createdAt: new Date('2025-11-05'),
    tenantProfile: {
      age: 29,
      profession: 'Marketing Manager',
      yearsInCity: 2,
      smokingStatus: 'non-smoker',
      personality: ['creative', 'organized', 'social', 'pet-lover'],
      interests: ['marketing', 'cats', 'art', 'travel'],
      languagesSpoken: ['English', 'Romanian', 'Mandarin']
    }
  }
]

function PropertiesPageContent() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [inquiries, setInquiries] = useState<TenantInquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<TenantInquiry[]>([])
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'viewed' | 'interested'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProperties(MOCK_PROPERTIES)
      setInquiries(MOCK_INQUIRIES)
      setFilteredInquiries(MOCK_INQUIRIES)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    // Apply basic filters when inquiries or filters change
    const basicFiltered = inquiries.filter(inquiry => {
      const matchesProperty = selectedProperty ? inquiry.propertyId === selectedProperty : true
      const matchesStatus = filterStatus === 'all' || inquiry.status === filterStatus
      const matchesSearch = inquiry.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inquiry.occupation.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesProperty && matchesStatus && matchesSearch
    })
    setFilteredInquiries(basicFiltered)
  }, [inquiries, selectedProperty, filterStatus, searchTerm])

  const handleAdvancedFilter = (filtered: TenantInquiry[]) => {
    setFilteredInquiries(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-600'
      case 'viewed': return 'bg-yellow-600'
      case 'interested': return 'bg-green-600'
      case 'rejected': return 'bg-red-600'
      case 'accepted': return 'bg-purple-600'
      default: return 'bg-gray-600'
    }
  }

  const getPropertyStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600'
      case 'pending': return 'bg-yellow-600'
      case 'inactive': return 'bg-gray-600'
      default: return 'bg-gray-600'
    }
  }

  const updateInquiryStatus = (inquiryId: string, newStatus: TenantInquiry['status']) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Properties</h1>
            <p className="text-gray-400">Manage your listings and tenant inquiries</p>
          </div>
          <Link href="/landlord/add-property">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Properties List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Your Properties ({properties.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedProperty === property.id
                        ? 'border-blue-500 bg-blue-600/10'
                        : 'border-gray-700 bg-gray-800/30 hover:bg-gray-700/30'
                    }`}
                    onClick={() => setSelectedProperty(property.id)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white text-sm truncate">
                            {property.title}
                          </h3>
                          <Badge className={`${getPropertyStatusColor(property.status)} text-white text-xs`}>
                            {property.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {property.location.neighborhood}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-blue-400 font-semibold">
                            €{property.price}/month
                          </span>
                          <div className="flex items-center gap-3 text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {property.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {property.inquiries}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {properties.length === 0 && (
                  <div className="text-center py-8">
                    <Plus className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-4">No properties yet</p>
                    <Link href="/landlord/add-property">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        Add Your First Property
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Inquiries Management */}
          <div className="lg:col-span-2">
            {selectedProperty ? (
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Tenant Inquiries</CardTitle>
                      <p className="text-gray-400 text-sm">
                        {filteredInquiries.length} inquiries for selected property
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search by name or occupation..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                        <TabsList className="bg-gray-800/50">
                          <TabsTrigger value="all">All</TabsTrigger>
                          <TabsTrigger value="new">New</TabsTrigger>
                          <TabsTrigger value="viewed">Viewed</TabsTrigger>
                          <TabsTrigger value="interested">Interested</TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <TenantFilter
                        inquiries={inquiries.filter(inquiry => 
                          selectedProperty ? inquiry.propertyId === selectedProperty : true
                        )}
                        onFilteredResults={handleAdvancedFilter}
                      />
                    </div>
                  </div>

                  {/* Inquiries List */}
                  <div className="space-y-4">
                    {filteredInquiries.map((inquiry) => (
                      <motion.div
                        key={inquiry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/30 rounded-lg p-6 border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={inquiry.tenantAvatar} />
                              <AvatarFallback className="bg-gray-700 text-white">
                                {inquiry.tenantName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-white">{inquiry.tenantName}</h3>
                              <p className="text-gray-400 text-sm">{inquiry.tenantProfile.profession}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getStatusColor(inquiry.status)} text-white text-xs`}>
                                  {inquiry.status}
                                </Badge>
                                <span className="text-gray-500 text-xs">
                                  {inquiry.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">
                              €{inquiry.budget}/month
                            </div>
                            <div className="text-sm text-gray-400">
                              Move-in: {new Date(inquiry.moveInDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        {/* Tenant Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-900/50 rounded-lg">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Personal Info</h4>
                            <div className="space-y-1 text-sm text-gray-400">
                              <div>Age: {inquiry.tenantProfile.age}</div>
                              <div>Family: {inquiry.familySize} person{inquiry.familySize !== 1 ? 's' : ''}</div>
                              <div>Income: €{inquiry.income.toLocaleString()}/month</div>
                              <div>Credit Score: {inquiry.creditScore || 'N/A'}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Lifestyle</h4>
                            <div className="space-y-1 text-sm text-gray-400">
                              <div>Smoking: {inquiry.tenantProfile.smokingStatus}</div>
                              <div>Pets: {inquiry.hasPets ? 'Yes' : 'No'}</div>
                              <div>Children: {inquiry.hasChildren ? 'Yes' : 'No'}</div>
                              <div>Years in city: {inquiry.tenantProfile.yearsInCity}</div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">Personality</h4>
                            <div className="flex flex-wrap gap-1">
                              {inquiry.tenantProfile.personality.slice(0, 4).map((trait, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                                  {trait}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-300 mb-2">Message</h4>
                          <p className="text-gray-300 text-sm bg-gray-900/30 p-3 rounded-lg">
                            {inquiry.message}
                          </p>
                        </div>

                        {/* References */}
                        {inquiry.references.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-300 mb-2">References</h4>
                            <div className="space-y-1">
                              {inquiry.references.map((ref, index) => (
                                <div key={index} className="text-sm text-gray-400 flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  {ref}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                              <Phone className="mr-2 h-3 w-3" />
                              Call
                            </Button>
                            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                              <Mail className="mr-2 h-3 w-3" />
                              Email
                            </Button>
                            <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                              <MessageSquare className="mr-2 h-3 w-3" />
                              Message
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            {inquiry.status === 'new' && (
                              <Button 
                                size="sm" 
                                onClick={() => updateInquiryStatus(inquiry.id, 'viewed')}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Mark as Viewed
                              </Button>
                            )}
                            {inquiry.status === 'viewed' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updateInquiryStatus(inquiry.id, 'interested')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Show Interest
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateInquiryStatus(inquiry.id, 'rejected')}
                                  className="border-red-600 text-red-400 hover:bg-red-600/10"
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {inquiry.status === 'interested' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => updateInquiryStatus(inquiry.id, 'accepted')}
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Accept Tenant
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => updateInquiryStatus(inquiry.id, 'rejected')}
                                  className="border-red-600 text-red-400 hover:bg-red-600/10"
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {filteredInquiries.length === 0 && (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-2">No inquiries match your filters</p>
                        <p className="text-gray-500 text-sm">
                          {searchTerm || filterStatus !== 'all' 
                            ? 'Try adjusting your search or filters' 
                            : 'Inquiries will appear here when tenants contact you'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Home className="h-16 w-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a Property</h3>
                  <p className="text-gray-400 text-center">
                    Choose a property from the list to view and manage tenant inquiries
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <ProfileVerificationGuard requireIdVerification={true}>
      <PropertiesPageContent />
    </ProfileVerificationGuard>
  )
}