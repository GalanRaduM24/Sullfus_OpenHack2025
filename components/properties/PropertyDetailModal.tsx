'use client'

import { Property, LandlordProfile } from '@/lib/firebase/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  X,
  CheckCircle,
  Building2,
  Video,
  Eye
} from 'lucide-react'
import { Carousel } from '@/components/ui/carousel'
import Image from 'next/image'

interface PropertyDetailModalProps {
  property: Property | null
  landlordInfo?: {
    company_name: string
    contact_name: string
    business_verified: boolean
    profile_photo_url?: string
  }
  isOpen: boolean
  onClose: () => void
  onLike?: (propertyId: string) => void
  onPass?: (propertyId: string) => void
  isLiked?: boolean
  showActions?: boolean
}

export function PropertyDetailModal({
  property,
  landlordInfo,
  isOpen,
  onClose,
  onLike,
  onPass,
  isLiked = false,
  showActions = true
}: PropertyDetailModalProps) {
  if (!property) return null

  const initials = landlordInfo?.company_name
    ? landlordInfo.company_name.substring(0, 2).toUpperCase()
    : 'LL'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{property.title}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{property.address.full_address}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Image Carousel */}
        {property.media.photos.length > 0 && (
          <div className="relative">
            <Carousel className="w-full">
              <CarouselContent>
                {property.media.photos.map((photo, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-[400px] w-full">
                      <Image
                        src={photo}
                        alt={`${property.title} - Image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {property.media.photos.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </div>
        )}

        {/* Video and Virtual Tour Links */}
        {(property.media.video_url || property.media.virtual_tour_url) && (
          <div className="flex gap-2">
            {property.media.video_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={property.media.video_url} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  Watch Video
                </a>
              </Button>
            )}
            {property.media.virtual_tour_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={property.media.virtual_tour_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Virtual Tour
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Price and Key Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{property.price} {property.currency}</p>
              <p className="text-sm text-muted-foreground">per {property.currency_interval}</p>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="h-5 w-5" />
                <span className="font-semibold">{property.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-5 w-5" />
                <span className="font-semibold">{property.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-5 w-5" />
                <span className="font-semibold">{property.square_meters}m²</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{property.property_type}</Badge>
            {property.pets_allowed && (
              <Badge className="bg-green-500">Pets Allowed</Badge>
            )}
            {property.amenities.map((amenity) => (
              <Badge key={amenity} variant="outline">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{property.description}</p>
        </div>

        {/* Property Rules */}
        {property.rules && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Property Rules</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{property.rules}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Landlord Information */}
        {landlordInfo && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Landlord Information</h3>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={landlordInfo.profile_photo_url} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{landlordInfo.company_name}</p>
                  {landlordInfo.business_verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{landlordInfo.contact_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-3 pt-4">
            {onPass && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onPass(property.id)
                  onClose()
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Pass
              </Button>
            )}
            {onLike && (
              <Button
                className="flex-1"
                variant={isLiked ? "secondary" : "default"}
                onClick={() => {
                  onLike(property.id)
                  if (!isLiked) {
                    onClose()
                  }
                }}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like Property'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
