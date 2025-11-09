'use client'

import { Property } from '@/lib/firebase/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PropertyCardProps {
  property: Property
  onViewDetails: (property: Property) => void
  onLike?: (propertyId: string) => void
  isLiked?: boolean
  showLikeButton?: boolean
}

export function PropertyCard({
  property,
  onViewDetails,
  onLike,
  isLiked = false,
  showLikeButton = true
}: PropertyCardProps) {
  const mainImage = property.media.photos[0] || '/placeholder-property.jpg'
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      <div className="relative h-48 w-full" onClick={() => onViewDetails(property)}>
        <Image
          src={mainImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {showLikeButton && onLike && (
          <Button
            size="icon"
            variant={isLiked ? "default" : "secondary"}
            className="absolute top-2 right-2 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onLike(property.id)
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        )}
        {property.pets_allowed && (
          <Badge className="absolute bottom-2 left-2 bg-green-500">
            Pets Allowed
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4" onClick={() => onViewDetails(property)}>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
            <div className="text-right">
              <p className="font-bold text-xl">{property.price} {property.currency}</p>
              <p className="text-xs text-muted-foreground">{property.currency_interval}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{property.address.area}, {property.address.city}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4" />
              <span>{property.bedrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms}</span>
            </div>
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.square_meters}m²</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">
              {property.property_type}
            </Badge>
            {property.amenities.slice(0, 2).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {property.amenities.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{property.amenities.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
