'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/lib/firebase/types'
import { PropertyCard } from './PropertyCard'
import { PropertyDetailModal } from './PropertyDetailModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, RefreshCw } from 'lucide-react'

interface LikedPropertiesListProps {
  tenantId: string
  onUnlike?: (propertyId: string) => void
}

export function LikedPropertiesList({
  tenantId,
  onUnlike
}: LikedPropertiesListProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadLikedProperties = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/tenants/${tenantId}/liked-properties`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to load liked properties')
      }

      const data = await response.json()
      setProperties(data.properties)
    } catch (err) {
      console.error('Error loading liked properties:', err)
      setError(err instanceof Error ? err.message : 'Failed to load liked properties')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadLikedProperties()
  }, [tenantId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadLikedProperties()
  }

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleUnlike = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/like`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: tenantId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to unlike property')
      }

      // Remove from local state
      setProperties(prev => prev.filter(p => p.id !== propertyId))
      
      // Close modal if the unliked property is currently selected
      if (selectedProperty?.id === propertyId) {
        setIsModalOpen(false)
        setSelectedProperty(null)
      }

      // Call parent callback if provided
      onUnlike?.(propertyId)
    } catch (err) {
      console.error('Error unliking property:', err)
      // Could show a toast notification here
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liked Properties</CardTitle>
          <CardDescription>Properties you've shown interest in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liked Properties</CardTitle>
          <CardDescription>Properties you've shown interest in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liked Properties</CardTitle>
              <CardDescription>Properties you've shown interest in</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-2">No liked properties yet</p>
            <p className="text-sm text-muted-foreground">
              Browse properties and click the heart icon to save them here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liked Properties</CardTitle>
              <CardDescription>
                {properties.length} {properties.length === 1 ? 'property' : 'properties'} you've shown interest in
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onViewDetails={handlePropertyClick}
                isLiked={true}
                showLikeButton={true}
                onLike={() => handleUnlike(property.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedProperty(null)
          }}
          onLike={() => handleUnlike(selectedProperty.id)}
          isLiked={true}
          showActions={true}
        />
      )}
    </>
  )
}
