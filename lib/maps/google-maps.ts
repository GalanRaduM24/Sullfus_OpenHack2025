/**
 * Google Maps integration utilities
 */

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

export interface PropertyLocation extends Location {
  city?: string;
  country?: string;
  postalCode?: string;
  streetAddress?: string;
}

/**
 * Initialize Google Maps
 */
export function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
}

/**
 * Get current location using browser Geolocation API
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Geocode address to coordinates
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps not loaded');
  }

  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address,
          placeId: results[0].place_id,
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<PropertyLocation | null> {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps not loaded');
  }

  const geocoder = new window.google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const location: PropertyLocation = {
          lat,
          lng,
          address: result.formatted_address,
          placeId: result.place_id,
        };

        // Extract address components
        result.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number')) {
            location.streetAddress = component.long_name;
          }
          if (types.includes('route')) {
            location.streetAddress = `${location.streetAddress || ''} ${component.long_name}`.trim();
          }
          if (types.includes('locality')) {
            location.city = component.long_name;
          }
          if (types.includes('postal_code')) {
            location.postalCode = component.long_name;
          }
          if (types.includes('country')) {
            location.country = component.long_name;
          }
        });

        resolve(location);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Calculate distance between two points (in kilometers)
 */
export function calculateDistance(
  point1: Location,
  point2: Location
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Search for places using Google Places API
 */
export async function searchPlaces(
  query: string,
  location?: Location,
  radius?: number
): Promise<any[]> {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps not loaded');
  }

  const service = new window.google.maps.places.PlacesService(
    document.createElement('div')
  );

  return new Promise((resolve, reject) => {
    const request: google.maps.places.PlaceSearchRequest = {
      query,
    };

    if (location) {
      request.location = new window.google.maps.LatLng(location.lat, location.lng);
    }

    if (radius) {
      request.radius = radius;
    }

    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        resolve(results);
      } else {
        reject(new Error(`Places search failed: ${status}`));
      }
    });
  });
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: typeof google;
  }
}

