'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loadGoogleMaps, Location, geocodeAddress } from '@/lib/maps/google-maps'
import { MapPin } from 'lucide-react'

interface AddressAutocompleteProps {
  onLocationSelect: (location: Location) => void
  label?: string
  placeholder?: string
  defaultValue?: string
  className?: string
}

export function AddressAutocomplete({
  onLocationSelect,
  label = 'Address',
  placeholder = 'Enter an address',
  defaultValue = '',
  className = '',
}: AddressAutocompleteProps) {
  const [address, setAddress] = useState(defaultValue)
  const [isLoaded, setIsLoaded] = useState(false)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error('Google Maps API key not configured')
      return
    }

    loadGoogleMaps(apiKey)
      .then(() => {
        setIsLoaded(true)
      })
      .catch((error) => {
        console.error('Error loading Google Maps:', error)
      })
  }, [])

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return

    // Initialize Autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'ro' }, // Restrict to Romania
    })

    autocompleteRef.current = autocomplete

    // Handle place selection
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()

      if (place.geometry && place.geometry.location) {
        const location: Location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address,
          placeId: place.place_id,
        }

        setAddress(place.formatted_address || '')
        onLocationSelect(location)
      }
    })

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [isLoaded, onLocationSelect])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value)
  }

  const handleSearch = async () => {
    if (!address.trim()) return

    try {
      const location = await geocodeAddress(address)
      if (location) {
        onLocationSelect(location)
        setAddress(location.address || address)
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
    }
  }

  return (
    <div className={className}>
      <Label htmlFor="address-input">{label}</Label>
      <div className="relative mt-2">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          id="address-input"
          type="text"
          placeholder={placeholder}
          value={address}
          onChange={handleAddressChange}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSearch()
            }
          }}
          className="pl-10"
        />
      </div>
    </div>
  )
}

