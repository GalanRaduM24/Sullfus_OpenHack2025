'use client'

import { useState } from 'react'
import { SearchPreferences } from '@/lib/firebase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, SlidersHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface PropertyFiltersProps {
  filters: Partial<SearchPreferences>
  onFiltersChange: (filters: Partial<SearchPreferences>) => void
  onApply: () => void
  onClear: () => void
}

const AMENITIES_OPTIONS = [
  'parking',
  'furnished',
  'balcony',
  'gym',
  'elevator',
  'air_conditioning',
  'heating',
  'dishwasher',
  'washing_machine',
  'internet'
]

const PROPERTY_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedrooms' },
  { value: '3br+', label: '3+ Bedrooms' },
  { value: 'house', label: 'House' }
]

export function PropertyFilters({
  filters,
  onFiltersChange,
  onApply,
  onClear
}: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleBudgetMinChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value)
    onFiltersChange({ ...filters, budget_min: numValue })
  }

  const handleBudgetMaxChange = (value: string) => {
    const numValue = value === '' ? undefined : Number(value)
    onFiltersChange({ ...filters, budget_max: numValue })
  }

  const handleLocationAdd = (location: string) => {
    if (!location.trim()) return
    const currentLocations = filters.locations || []
    if (!currentLocations.includes(location)) {
      onFiltersChange({
        ...filters,
        locations: [...currentLocations, location]
      })
    }
  }

  const handleLocationRemove = (location: string) => {
    const currentLocations = filters.locations || []
    onFiltersChange({
      ...filters,
      locations: currentLocations.filter(l => l !== location)
    })
  }

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = filters.amenities || []
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity]
    onFiltersChange({ ...filters, amenities: newAmenities })
  }

  const handlePropertyTypeToggle = (type: string) => {
    const currentTypes = filters.property_type || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type]
    onFiltersChange({ ...filters, property_type: newTypes })
  }

  const handlePetsAllowedToggle = () => {
    onFiltersChange({
      ...filters,
      pets_allowed: filters.pets_allowed === undefined ? true : !filters.pets_allowed
    })
  }

  const activeFiltersCount = [
    filters.budget_min,
    filters.budget_max,
    filters.locations?.length,
    filters.amenities?.length,
    filters.property_type?.length,
    filters.pets_allowed !== undefined
  ].filter(Boolean).length

  return (
    <div className="lg:sticky lg:top-4">
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>
                Refine your property search
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent
                filters={filters}
                onBudgetMinChange={handleBudgetMinChange}
                onBudgetMaxChange={handleBudgetMaxChange}
                onLocationAdd={handleLocationAdd}
                onLocationRemove={handleLocationRemove}
                onAmenityToggle={handleAmenityToggle}
                onPropertyTypeToggle={handlePropertyTypeToggle}
                onPetsAllowedToggle={handlePetsAllowedToggle}
                onApply={() => {
                  onApply()
                  setIsOpen(false)
                }}
                onClear={onClear}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Filter Card */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterContent
            filters={filters}
            onBudgetMinChange={handleBudgetMinChange}
            onBudgetMaxChange={handleBudgetMaxChange}
            onLocationAdd={handleLocationAdd}
            onLocationRemove={handleLocationRemove}
            onAmenityToggle={handleAmenityToggle}
            onPropertyTypeToggle={handlePropertyTypeToggle}
            onPetsAllowedToggle={handlePetsAllowedToggle}
            onApply={onApply}
            onClear={onClear}
          />
        </CardContent>
      </Card>
    </div>
  )
}

interface FilterContentProps {
  filters: Partial<SearchPreferences>
  onBudgetMinChange: (value: string) => void
  onBudgetMaxChange: (value: string) => void
  onLocationAdd: (location: string) => void
  onLocationRemove: (location: string) => void
  onAmenityToggle: (amenity: string) => void
  onPropertyTypeToggle: (type: string) => void
  onPetsAllowedToggle: () => void
  onApply: () => void
  onClear: () => void
}

function FilterContent({
  filters,
  onBudgetMinChange,
  onBudgetMaxChange,
  onLocationAdd,
  onLocationRemove,
  onAmenityToggle,
  onPropertyTypeToggle,
  onPetsAllowedToggle,
  onApply,
  onClear
}: FilterContentProps) {
  const [locationInput, setLocationInput] = useState('')

  return (
    <div className="space-y-6">
      {/* Budget Range */}
      <div className="space-y-2">
        <Label>Budget (RON/month)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.budget_min || ''}
            onChange={(e) => onBudgetMinChange(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.budget_max || ''}
            onChange={(e) => onBudgetMaxChange(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Locations */}
      <div className="space-y-2">
        <Label>Locations</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onLocationAdd(locationInput)
                setLocationInput('')
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              onLocationAdd(locationInput)
              setLocationInput('')
            }}
          >
            Add
          </Button>
        </div>
        {filters.locations && filters.locations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.locations.map((location) => (
              <Badge key={location} variant="secondary">
                {location}
                <button
                  onClick={() => onLocationRemove(location)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Property Type */}
      <div className="space-y-2">
        <Label>Property Type</Label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <Badge
              key={type.value}
              variant={filters.property_type?.includes(type.value) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onPropertyTypeToggle(type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Pets Allowed */}
      <div className="space-y-2">
        <Label>Pets</Label>
        <Badge
          variant={filters.pets_allowed ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={onPetsAllowedToggle}
        >
          Pets Allowed
        </Badge>
      </div>

      <Separator />

      {/* Amenities */}
      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES_OPTIONS.map((amenity) => (
            <Badge
              key={amenity}
              variant={filters.amenities?.includes(amenity) ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => onAmenityToggle(amenity)}
            >
              {amenity.replace('_', ' ')}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={onClear} variant="outline">
          Clear
        </Button>
      </div>
    </div>
  )
}
