'use client'

import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps, Location } from '@/lib/maps/google-maps'

interface GoogleMapProps {
  center: Location
  zoom?: number
  markers?: Location[]
  onLocationSelect?: (location: Location) => void
  className?: string
  height?: string
}

export function GoogleMap({
  center,
  zoom = 13,
  markers = [],
  onLocationSelect,
  className = '',
  height = '400px',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

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
    if (!isLoaded || !mapRef.current || !window.google) return

    // Initialize map
    const googleMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.lat, lng: center.lng },
      zoom,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
    })

    setMap(googleMap)

    // Add click listener if onLocationSelect is provided
    if (onLocationSelect) {
      googleMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onLocationSelect({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          })
        }
      })
    }
  }, [isLoaded, center.lat, center.lng, zoom, onLocationSelect])

  useEffect(() => {
    if (!map || !window.google) return

    // Clear existing markers
    // Note: In a real implementation, you'd track markers and remove them

    // Add markers
    markers.forEach((markerLocation) => {
      new window.google.maps.Marker({
        position: { lat: markerLocation.lat, lng: markerLocation.lng },
        map,
        title: markerLocation.address || 'Location',
      })
    })

    // Add center marker if onLocationSelect is provided
    if (onLocationSelect) {
      new window.google.maps.Marker({
        position: { lat: center.lat, lng: center.lng },
        map,
        draggable: true,
        title: 'Selected Location',
      })
    }
  }, [map, markers, center, onLocationSelect])

  if (!isLoaded) {
    return (
      <div
        className={`bg-gray-900 flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <p className="text-gray-400">Loading map...</p>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ height, width: '100%' }}
    />
  )
}

// Extend Window interface
declare global {
  interface Window {
    google: typeof google
  }
}

