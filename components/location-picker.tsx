'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Navigation, Search, X } from 'lucide-react'
import type { IssueLocation } from '@/lib/types'

// Import Leaflet dynamically to avoid SSR issues
let L: any = null

interface LocationPickerProps {
  value?: IssueLocation | null
  onChange: (location: IssueLocation) => void
  className?: string
}

export function LocationPicker({ value, onChange, className }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  // Default center: Ahmedabad, Gujarat
  const defaultCenter = { lat: 23.0225, lng: 72.5714 }

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return

      // Dynamic import of Leaflet
      // @ts-ignore
      L = await import('leaflet')
      // @ts-ignore
      await import('leaflet/dist/leaflet.css')

      // Custom marker icon
      const customIcon = L.divIcon({
        html: `<div style="
          width: 32px;
          height: 32px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const initialCenter = value ? [value.lat, value.lng] : [defaultCenter.lat, defaultCenter.lng]
      
      const map = L.map(mapRef.current, {
        zoomControl: true,
      }).setView(initialCenter as [number, number], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // Add initial marker if value exists
      if (value) {
        markerRef.current = L.marker([value.lat, value.lng], { icon: customIcon, draggable: true }).addTo(map)
        setupMarkerDrag(markerRef.current)
      }

      // Click handler to add/move marker
      map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map)
          setupMarkerDrag(markerRef.current)
        }

        // Reverse geocode to get address
        const address = await reverseGeocode(lat, lng)
        onChange({ lat, lng, address })
      })

      mapInstanceRef.current = map
      setIsMapReady(true)
    }

    function setupMarkerDrag(marker: any) {
      marker.on('dragend', async () => {
        const pos = marker.getLatLng()
        const address = await reverseGeocode(pos.lat, pos.lng)
        onChange({ lat: pos.lat, lng: pos.lng, address })
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update marker when value changes externally
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !L) return

    if (value) {
      const customIcon = L.divIcon({
        html: `<div style="
          width: 32px;
          height: 32px;
          background: #3b82f6;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>`,
        className: 'custom-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      if (markerRef.current) {
        markerRef.current.setLatLng([value.lat, value.lng])
      } else {
        markerRef.current = L.marker([value.lat, value.lng], { icon: customIcon, draggable: true }).addTo(mapInstanceRef.current)
      }
      mapInstanceRef.current.setView([value.lat, value.lng], 15)
    }
  }, [value, isMapReady])

  // Reverse geocoding using Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await response.json()
      
      if (data.address) {
        const parts = []
        if (data.address.road) parts.push(data.address.road)
        if (data.address.suburb) parts.push(data.address.suburb)
        if (data.address.city || data.address.town || data.address.village) {
          parts.push(data.address.city || data.address.town || data.address.village)
        }
        if (data.address.state_district) parts.push(data.address.state_district)
        return parts.length > 0 ? parts.join(', ') : data.display_name.split(',').slice(0, 3).join(',')
      }
      return 'Location selected'
    } catch {
      return 'Location selected'
    }
  }

  // Search location
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current || !L) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Gujarat, India')}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0]
        const latNum = parseFloat(lat)
        const lngNum = parseFloat(lon)

        const customIcon = L.divIcon({
          html: `<div style="
            width: 32px;
            height: 32px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>`,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        if (markerRef.current) {
          markerRef.current.setLatLng([latNum, lngNum])
        } else {
          markerRef.current = L.marker([latNum, lngNum], { icon: customIcon, draggable: true }).addTo(mapInstanceRef.current!)
        }

        mapInstanceRef.current.setView([latNum, lngNum], 16)
        
        const address = display_name.split(',').slice(0, 3).join(',')
        onChange({ lat: latNum, lng: lngNum, address })
      }
    } catch (error) {
      console.error('Search failed:', error)
    }
    setIsSearching(false)
  }, [searchQuery, onChange])

  // Get current location
  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation || !mapInstanceRef.current || !L) return

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords

        const customIcon = L.divIcon({
          html: `<div style="
            width: 32px;
            height: 32px;
            background: #3b82f6;
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>`,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        })

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(mapInstanceRef.current!)
        }

        mapInstanceRef.current!.setView([lat, lng], 16)

        const address = await reverseGeocode(lat, lng)
        onChange({ lat, lng, address })
        setIsLocating(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }, [onChange])

  return (
    <div className={className}>
      {/* Search Bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location in Gujarat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-input">
        <div
          ref={mapRef}
          className="w-full h-[300px] z-0"
          style={{ background: '#f0f0f0' }}
        />
        
        {/* Current Location Button */}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute bottom-3 right-3 z-[1000] shadow-md"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
        >
          <Navigation className={`h-4 w-4 mr-2 ${isLocating ? 'animate-pulse' : ''}`} />
          {isLocating ? 'Locating...' : 'My Location'}
        </Button>

        {/* Instructions overlay when no location selected */}
        {!value && isMapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-[500] pointer-events-none">
            <div className="text-center p-4">
              <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Click on the map to select location</p>
              <p className="text-xs text-muted-foreground mt-1">Or use search / current location</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {value && (
        <div className="mt-3 p-3 bg-muted/50 rounded-lg flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{value.address}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Coordinates: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 h-8 w-8 p-0"
            onClick={() => onChange({ lat: 0, lng: 0, address: '' })}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
