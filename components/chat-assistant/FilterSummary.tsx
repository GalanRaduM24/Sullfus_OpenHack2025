'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, MapPin, DollarSign, Calendar, Home, Sparkles } from 'lucide-react'

interface FilterSummaryProps {
  filters: {
    budgetMin?: number
    budgetMax?: number
    locations?: string[]
    amenities?: string[]
    petsAllowed?: boolean
    moveInDate?: string
    propertyType?: string[]
  }
  onApply?: () => void
  onClear?: () => void
  onRemoveFilter?: (filterKey: string, value?: string) => void
}

export function FilterSummary({
  filters,
  onApply,
  onClear,
  onRemoveFilter,
}: FilterSummaryProps) {
  const hasFilters = Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0
    return value !== undefined && value !== null
  })

  if (!hasFilters) return null

  const formatBudget = () => {
    if (filters.budgetMin && filters.budgetMax) {
      return `${filters.budgetMin} - ${filters.budgetMax} RON/month`
    }
    if (filters.budgetMin) {
      return `From ${filters.budgetMin} RON/month`
    }
    if (filters.budgetMax) {
      return `Up to ${filters.budgetMax} RON/month`
    }
    return null
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Search Filters
          </CardTitle>
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Budget */}
        {formatBudget() && (
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Budget</p>
              <Badge
                variant="secondary"
                className="mt-1 gap-1"
              >
                {formatBudget()}
                {onRemoveFilter && (
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => {
                      onRemoveFilter('budgetMin')
                      onRemoveFilter('budgetMax')
                    }}
                  />
                )}
              </Badge>
            </div>
          </div>
        )}

        {/* Locations */}
        {filters.locations && filters.locations.length > 0 && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Locations</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.locations.map((location) => (
                  <Badge
                    key={location}
                    variant="secondary"
                    className="gap-1"
                  >
                    {location}
                    {onRemoveFilter && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => onRemoveFilter('locations', location)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Property Type */}
        {filters.propertyType && filters.propertyType.length > 0 && (
          <div className="flex items-start gap-2">
            <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Property Type</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.propertyType.map((type) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="gap-1"
                  >
                    {type}
                    {onRemoveFilter && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => onRemoveFilter('propertyType', type)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Move-in Date */}
        {filters.moveInDate && (
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Move-in Date</p>
              <Badge
                variant="secondary"
                className="mt-1 gap-1"
              >
                {formatDate(filters.moveInDate)}
                {onRemoveFilter && (
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => onRemoveFilter('moveInDate')}
                  />
                )}
              </Badge>
            </div>
          </div>
        )}

        {/* Amenities */}
        {filters.amenities && filters.amenities.length > 0 && (
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Amenities</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {filters.amenities.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant="secondary"
                    className="gap-1"
                  >
                    {amenity}
                    {onRemoveFilter && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => onRemoveFilter('amenities', amenity)}
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pets */}
        {filters.petsAllowed !== undefined && (
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">🐾</span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Pets</p>
              <Badge
                variant="secondary"
                className="mt-1 gap-1"
              >
                {filters.petsAllowed ? 'Pets Allowed' : 'No Pets'}
                {onRemoveFilter && (
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => onRemoveFilter('petsAllowed')}
                  />
                )}
              </Badge>
            </div>
          </div>
        )}

        {/* Apply Button */}
        {onApply && (
          <Button
            onClick={onApply}
            className="w-full mt-2"
            size="sm"
          >
            Apply Filters
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
