'use client'

import { useState, useEffect } from 'react'
import { Property, SearchPreferences } from '@/lib/firebase/types'
import { PropertyCard } from './PropertyCard'
import { PropertyDetailModal } from './PropertyDetailModal'
import { PropertyFilters } from './PropertyFilters'
import { Button } from '@/components/ui/button'
import { Home, Loader2 } from 'lucide-react'

interface PropertyListViewProps {
  userId?: string
  initialFilters?: Partial<SearchPreferences>
  onLike?: (propertyId: string) => void
  onPass?: (propertyId: string) => void
  likedPropertyIds?: string[]
  showFilters?: boolean
}

export function PropertyListView({
  userId,
  initialFilters = {},
  onLike,
  onPass,
  likedPropertyIds = [],
  showFilters = true
}: PropertyListViewProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Partial<SearchPreferences>>(initialFilters)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [landlordInfo, setLandlordInfo] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async (newFilters?: Partial<SearchPreferences>, resetPage = false) => {
    try {
      if (resetPage) {
        setLoading(true)
        setPage(1)
      } else {
        setLoadingMore(true)
      }

      const searchFilters = newFilters || filters
      const currentPage = resetPage ? 1 : page

      const response = await fetch('/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...searchFilters,
          page: currentPage,
          limit: 12
        })
      })

      if (!response.ok) {
        throw new Error('Failed to load properties')
      }

      const data = await response.json()
      
      if (resetPage) {
        setProperties(data.properties)
      } else {
        setProperties(prev => [...prev, ...data.properties])
      }
      
      setHasMore(data.properties.length === 12)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleFiltersApply = () => {
    loadProperties(filters, true)
  }

  const handleFiltersClear = () => {
    const clearedFilters: Partial<SearchPreferences> = {}
    setFilters(clearedFilters)
    loadProperties(clearedFilters, true)
  }

  const handleViewDetails = async (property: Property) => {
    setSelectedProperty(property)
    
    // Load landlord info
    try {
      const response = await fetch(`/api/properties/${property.id}`)
      if (response.ok) {
        const data = await response.json()
        setLandlordInfo(data.landlord_public_info)
      }
    } catch (error) {
      console.error('Error loading landlord info:', error)
    }
  }

  const handleCloseModal = () => {
    setSelectedProperty(null)
    setLandlordInfo(null)
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    loadProperties(filters, false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="lg:col-span-1">
            <PropertyFilters
              filters={filters}
              onFiltersChange={setFilters}
              onApply={handleFiltersApply}
              onClear={handleFiltersClear}
            />
          </div>
        )}

        {/* Properties Grid */}
        <div className={showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {properties.length === 0 ? (
            <div className="text-center py-12">
              <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-2">No properties found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or check back later
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onViewDetails={handleViewDetails}
                    onLike={onLike}
                    isLiked={likedPropertyIds.includes(property.id)}
                    showLikeButton={!!userId && !!onLike}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    variant="outline"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        landlordInfo={landlordInfo}
        isOpen={!!selectedProperty}
        onClose={handleCloseModal}
        onLike={onLike}
        onPass={onPass}
        isLiked={selectedProperty ? likedPropertyIds.includes(selectedProperty.id) : false}
        showActions={!!userId}
      />
    </div>
  )
}
