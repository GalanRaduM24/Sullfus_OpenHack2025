'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { MapPin, Loader2 } from 'lucide-react'

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string
    lat: number
    lng: number
  }) => void
  initialAddress?: string
}

export function LocationPicker({ onLocationSelect, initialAddress = '' }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [address, setAddress] = useState(initialAddress)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load Google Maps script
    const loadGoogleMaps = () => {
      if (typeof window.google !== 'undefined') {
        initializeMap()
        return
      }

      const script = document.createElement('script')
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      
      if (!apiKey) {
        console.error('Google Maps API key not configured')
        setLoading(false)
        return
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => initializeMap()
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  const initializeMap = () => {
    if (!mapRef.current) return

    // Default to Bucharest, Romania
    const defaultCenter = { lat: 44.4268, lng: 26.1025 }

    // Create map
    const mapInstance = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    })

    setMap(mapInstance)

    // Create marker
    const markerInstance = new google.maps.Marker({
      map: mapInstance,
      position: defaultCenter,
      draggable: true,
      animation: google.maps.Animation.DROP,
    })

    setMarker(markerInstance)

    // Add click listener to map
    mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        updateLocation(e.latLng.lat(), e.latLng.lng())
      }
    })

    // Add drag listener to marker
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition()
      if (position) {
        updateLocation(position.lat(), position.lng())
      }
    })

    // Initialize autocomplete
    if (inputRef.current) {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'ro' }, // Restrict to Romania
        fields: ['address_components', 'geometry', 'formatted_address'],
        types: ['address'],
      })

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace()
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address || ''
          
          setAddress(address)
          markerInstance.setPosition({ lat, lng })
          mapInstance.setCenter({ lat, lng })
          mapInstance.setZoom(16)
          
          onLocationSelect({ address, lat, lng })
        }
      })

      setAutocomplete(autocompleteInstance)
    }

    setLoading(false)
  }

  const updateLocation = async (lat: number, lng: number) => {
    if (!marker || !map) return

    marker.setPosition({ lat, lng })
    map.panTo({ lat, lng })

    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder()
    try {
      const result = await geocoder.geocode({ location: { lat, lng } })
      if (result.results[0]) {
        const newAddress = result.results[0].formatted_address
        setAddress(newAddress)
        onLocationSelect({ address: newAddress, lat, lng })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-2 text-amber-800">
          <MapPin className="h-5 w-5" />
          <div>
            <p className="font-semibold">Google Maps not configured</p>
            <p className="text-sm">Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address">Property Address *</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id="address"
            type="text"
            placeholder="Start typing address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Search for address or click on the map to set location
        </p>
      </div>

      <Card className="overflow-hidden">
        {loading && (
          <div className="h-[400px] flex items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
        <div
          ref={mapRef}
          className={`w-full h-[400px] ${loading ? 'hidden' : 'block'}`}
        />
      </Card>

      <p className="text-xs text-muted-foreground">
        💡 Tip: Drag the marker or click on the map to adjust the exact location. Adding GPS coordinates gives you +10 points!
      </p>
    </div>
  )
}
