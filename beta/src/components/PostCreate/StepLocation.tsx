'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useGoogleMaps } from '@/app/providers/GoogleMapsProvider'
import { PostLocation } from '@/types/post'
import { mapStyle } from '@/components/Map/styles'
import { reverseGeocode } from '../../utils/reverseGeocode'

const SEOUL_DEFAULT = { lat: 37.5665, lng: 126.978 }
const MAP_HEIGHT = 320

interface StepLocationProps {
  location: PostLocation | null
  onChange: (location: PostLocation) => void
}

export function StepLocation({ location, onChange }: StepLocationProps) {
  const { isLoaded } = useGoogleMaps()
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>(
    location ? { lat: location.lat, lng: location.lng } : SEOUL_DEFAULT,
  )
  const [isGeolocating, setIsGeolocating] = useState(!location)
  const [geoError, setGeoError] = useState(false)
  const [inputValue, setInputValue] = useState(location?.name ?? '')

  // 현재 위치 가져오기 (Google Maps 로드 후 최초 1회, location이 없을 때만)
  useEffect(() => {
    if (!isLoaded) return
    if (location) {
      setIsGeolocating(false)
      return
    }
    if (!navigator.geolocation) {
      setIsGeolocating(false)
      setGeoError(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setMapCenter({ lat, lng })
        const name = await reverseGeocode(lat, lng)
        onChange({ lat, lng, name })
        setInputValue(name)
        setIsGeolocating(false)
      },
      () => {
        // 위치 권한 거부
        setIsGeolocating(false)
        setGeoError(true)
      },
      { timeout: 8000 },
    )
  }, [isLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  // Google Places Autocomplete 초기화
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (!place.geometry?.location) return
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const name = place.formatted_address ?? place.name ?? ''
      setMapCenter({ lat, lng })
      setInputValue(name)
      onChange({ lat, lng, name })
    })

    autocompleteRef.current = ac
  }, [isLoaded, onChange])

  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      const name = await reverseGeocode(lat, lng)
      setMapCenter({ lat, lng })
      setInputValue(name)
      onChange({ lat, lng, name })
    },
    [onChange],
  )

  return (
    <div className="flex flex-col gap-4">
      {/* 주소 검색 입력 */}
      <div className="px-4 pt-4">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-gray-500 text-base">📍</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isGeolocating ? '현재 위치를 가져오는 중...' : '장소 검색 또는 지도에서 선택'}
            className="w-full bg-gray-900 text-white placeholder-gray-600 text-sm rounded-xl pl-9 pr-4 py-3 outline-none border border-gray-800 focus:border-gray-600"
            disabled={isGeolocating}
          />
          {location && (
            <button
              onClick={() => {
                onChange({ lat: location.lat, lng: location.lng, name: '' })
                setInputValue('')
              }}
              className="absolute right-3 text-gray-500 text-xs active:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 지도 */}
      <div className="w-full" style={{ height: MAP_HEIGHT }}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: MAP_HEIGHT }}
            center={mapCenter}
            zoom={15}
            onClick={handleMapClick}
            options={{
              gestureHandling: 'greedy',
              disableDefaultUI: true,
              clickableIcons: false,
              styles: mapStyle,
            }}
          >
            {location && (
              <Marker
                position={{ lat: location.lat, lng: location.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#a3e635',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div
            className="w-full flex items-center justify-center text-gray-600 text-sm bg-gray-950"
            style={{ height: MAP_HEIGHT }}
          >
            지도 로딩 중...
          </div>
        )}
      </div>

      {geoError && !location && (
        <div className="px-4 pb-2">
          <p className="text-yellow-600 text-xs">위치 권한이 없어요. 위에서 직접 검색하거나 지도를 탭해서 위치를 선택해 주세요.</p>
        </div>
      )}

      {location?.name && (
        <div className="px-4 pb-2">
          <p className="text-gray-400 text-xs">{location.name}</p>
        </div>
      )}
    </div>
  )
}

