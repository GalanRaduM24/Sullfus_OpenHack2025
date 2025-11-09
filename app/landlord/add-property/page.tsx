'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileVerificationGuard } from '@/components/landlord/ProfileVerificationGuard'
import { 
  Plus, 
  Upload, 
  X, 
  MapPin, 
  Home, 
  Bed, 
  Bath, 
  Euro,
  Wifi,
  Car,
  Tv,
  Coffee,
  Dumbbell,
  TreePine,
  Waves,
  Users,
  Shield,
  Thermometer,
  Snowflake,
  ChefHat,
  Sofa,
  Dog,
  Cigarette,
  ArrowLeft,
  Save,
  AlertTriangle
} from 'lucide-react'

interface PropertyFormData {
  title: string
  description: string
  price: number
  currency: 'EUR' | 'RON'
  deposit: number
  location: {
    address: string
    city: string
    neighborhood: string
    coordinates?: { lat: number; lng: number }
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
  images: File[]
  petFriendly: boolean
  smokingAllowed: boolean
  furnished: boolean
  utilities: {
    included: string[]
    excluded: string[]
  }
  availableFrom: string
}

const AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
  { id: 'gym', label: 'Gym', icon: Dumbbell },
  { id: 'balcony', label: 'Balcony', icon: Home },
  { id: 'garden', label: 'Garden', icon: TreePine },
  { id: 'pool', label: 'Pool', icon: Waves },
  { id: 'concierge', label: 'Concierge', icon: Users },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'heating', label: 'Heating', icon: Thermometer },
  { id: 'ac', label: 'Air Conditioning', icon: Snowflake },
  { id: 'furnished', label: 'Furnished', icon: Sofa }
]

const UTILITIES = [
  'Heating', 'Water', 'Internet', 'Electricity', 'Gas', 'Garbage Collection', 'Cable TV'
]

const PROPERTY_TYPES = [
  'apartment', 'house', 'studio', 'room', 'penthouse', 'villa'
]

function AddPropertyPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: 0,
    currency: 'EUR',
    deposit: 0,
    location: {
      address: '',
      city: '',
      neighborhood: ''
    },
    type: 'apartment',
    specs: {
      bedrooms: 1,
      bathrooms: 1,
      area: 50,
      floor: 1,
      totalFloors: 1
    },
    amenities: [],
    features: [],
    images: [],
    petFriendly: false,
    smokingAllowed: false,
    furnished: false,
    utilities: {
      included: [],
      excluded: []
    },
    availableFrom: new Date().toISOString().split('T')[0]
  })

  const handleInputChange = (field: string, value: any, nested?: string) => {
    setFormData(prev => {
      if (nested) {
        const nestedObject = prev[nested as keyof PropertyFormData] as any
        return {
          ...prev,
          [nested]: {
            ...nestedObject,
            [field]: value
          }
        }
      }
      return {
        ...prev,
        [field]: value
      }
    })
  }

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId]
    }))
  }

  const handleUtilityToggle = (utility: string, type: 'included' | 'excluded') => {
    setFormData(prev => ({
      ...prev,
      utilities: {
        ...prev.utilities,
        [type]: prev.utilities[type].includes(utility)
          ? prev.utilities[type].filter(u => u !== utility)
          : [...prev.utilities[type], utility],
        [type === 'included' ? 'excluded' : 'included']: prev.utilities[type === 'included' ? 'excluded' : 'included']
          .filter(u => u !== utility)
      }
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10) // Limit to 10 images
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // TODO: Implement property submission to Firebase
      console.log('Property data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/landlord?success=property-added')
    } catch (error) {
      console.error('Error adding property:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

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
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="text-white text-sm">
              Step {currentStep} of 4
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full ${
                    step <= currentStep ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Add New Property</h1>
          <p className="text-gray-400">Fill in the details to list your property</p>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-white">Property Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Modern 2BR Apartment in Herastrau"
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your property in detail..."
                      rows={4}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type" className="text-white">Property Type *</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white"
                      >
                        {PROPERTY_TYPES.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="availableFrom" className="text-white">Available From *</Label>
                      <Input
                        id="availableFrom"
                        type="date"
                        value={formData.availableFrom}
                        onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Location & Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address" className="text-white">Address *</Label>
                      <Input
                        id="address"
                        value={formData.location.address}
                        onChange={(e) => handleInputChange('address', e.target.value, 'location')}
                        placeholder="Street address"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-white">City *</Label>
                      <Input
                        id="city"
                        value={formData.location.city}
                        onChange={(e) => handleInputChange('city', e.target.value, 'location')}
                        placeholder="Bucharest"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="neighborhood" className="text-white">Neighborhood</Label>
                      <Input
                        id="neighborhood"
                        value={formData.location.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value, 'location')}
                        placeholder="Herastrau"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <Label htmlFor="bedrooms" className="text-white">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.specs.bedrooms}
                        onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value), 'specs')}
                        min="0"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bathrooms" className="text-white">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={formData.specs.bathrooms}
                        onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value), 'specs')}
                        min="1"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="area" className="text-white">Area (m²)</Label>
                      <Input
                        id="area"
                        type="number"
                        value={formData.specs.area}
                        onChange={(e) => handleInputChange('area', parseInt(e.target.value), 'specs')}
                        min="1"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="floor" className="text-white">Floor</Label>
                      <Input
                        id="floor"
                        type="number"
                        value={formData.specs.floor}
                        onChange={(e) => handleInputChange('floor', parseInt(e.target.value), 'specs')}
                        min="0"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="totalFloors" className="text-white">Total Floors</Label>
                      <Input
                        id="totalFloors"
                        type="number"
                        value={formData.specs.totalFloors}
                        onChange={(e) => handleInputChange('totalFloors', parseInt(e.target.value), 'specs')}
                        min="1"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} className="border-gray-600 text-gray-300">
                      Previous
                    </Button>
                    <Button onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Pricing & Amenities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-white">Monthly Rent *</Label>
                      <div className="flex">
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                          min="0"
                          className="bg-gray-800/50 border-gray-700 text-white rounded-r-none"
                        />
                        <select
                          value={formData.currency}
                          onChange={(e) => handleInputChange('currency', e.target.value)}
                          className="px-3 py-2 bg-gray-800/50 border border-l-0 border-gray-700 rounded-l-none text-white"
                        >
                          <option value="EUR">EUR</option>
                          <option value="RON">RON</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="deposit" className="text-white">Security Deposit</Label>
                      <Input
                        id="deposit"
                        type="number"
                        value={formData.deposit}
                        onChange={(e) => handleInputChange('deposit', parseInt(e.target.value))}
                        min="0"
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {AMENITIES.map((amenity) => {
                        const IconComponent = amenity.icon
                        const isSelected = formData.amenities.includes(amenity.id)
                        return (
                          <button
                            key={amenity.id}
                            onClick={() => handleAmenityToggle(amenity.id)}
                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
                            }`}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span className="text-sm">{amenity.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Utilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-400 mb-3">Included in Rent</h4>
                        <div className="space-y-2">
                          {UTILITIES.map((utility) => (
                            <div key={`included-${utility}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`included-${utility}`}
                                checked={formData.utilities.included.includes(utility)}
                                onCheckedChange={() => handleUtilityToggle(utility, 'included')}
                              />
                              <label htmlFor={`included-${utility}`} className="text-sm text-gray-300">
                                {utility}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-orange-400 mb-3">Tenant Pays</h4>
                        <div className="space-y-2">
                          {UTILITIES.map((utility) => (
                            <div key={`excluded-${utility}`} className="flex items-center space-x-2">
                              <Checkbox
                                id={`excluded-${utility}`}
                                checked={formData.utilities.excluded.includes(utility)}
                                onCheckedChange={() => handleUtilityToggle(utility, 'excluded')}
                              />
                              <label htmlFor={`excluded-${utility}`} className="text-sm text-gray-300">
                                {utility}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-700" />

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Property Rules</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="petFriendly"
                          checked={formData.petFriendly}
                          onCheckedChange={(checked) => handleInputChange('petFriendly', checked)}
                        />
                        <label htmlFor="petFriendly" className="flex items-center gap-2 text-gray-300">
                          <Dog className="h-4 w-4" />
                          Pet-friendly
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="smokingAllowed"
                          checked={formData.smokingAllowed}
                          onCheckedChange={(checked) => handleInputChange('smokingAllowed', checked)}
                        />
                        <label htmlFor="smokingAllowed" className="flex items-center gap-2 text-gray-300">
                          <Cigarette className="h-4 w-4" />
                          Smoking allowed
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="furnished"
                          checked={formData.furnished}
                          onCheckedChange={(checked) => handleInputChange('furnished', checked)}
                        />
                        <label htmlFor="furnished" className="flex items-center gap-2 text-gray-300">
                          <Sofa className="h-4 w-4" />
                          Furnished
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} className="border-gray-600 text-gray-300">
                      Previous
                    </Button>
                    <Button onClick={nextStep} className="bg-gradient-to-r from-blue-600 to-purple-600">
                      Next Step
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Photos & Final Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-white mb-3 block">Property Photos *</Label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-300 mb-2">Upload property photos</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 10MB each (max 10 photos)</p>
                      </label>
                    </div>

                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt="Property"
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.images.length === 0 && (
                    <div className="bg-orange-900/20 border border-orange-500/50 rounded-lg p-4 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <p className="text-orange-400">Please upload at least one photo to continue</p>
                    </div>
                  )}

                  <Separator className="bg-gray-700" />

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Review Your Listing</h3>
                    <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-white">{formData.title}</h4>
                      <p className="text-gray-300 text-sm">{formData.location.address}, {formData.location.city}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {formData.specs.bedrooms} bed{formData.specs.bedrooms !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {formData.specs.bathrooms} bath{formData.specs.bathrooms !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          {formData.specs.area}m²
                        </span>
                      </div>
                      <div className="text-xl font-bold text-white">
                        {formData.currency === 'EUR' ? '€' : 'RON'}{formData.price}/month
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} className="border-gray-600 text-gray-300">
                      Previous
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading || formData.images.length === 0}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Publish Property
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function AddPropertyPage() {
  return (
    <ProfileVerificationGuard requireIdVerification={true}>
      <AddPropertyPageContent />
    </ProfileVerificationGuard>
  )
}