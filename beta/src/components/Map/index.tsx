'use client'

import { GoogleMap, LoadScript } from '@react-google-maps/api'
import { NavBarHeight } from '@/constants/sizeguide'

interface MapProps {
  style?: React.CSSProperties
  defaultCenter?: { lat: number; lng: number }
  defaultZoom?: number
  gestureHandling?: 'greedy' | 'cooperative' | 'none' | 'auto'
  disableDefaultUI?: boolean
  children?: React.ReactNode
}

export const Map = (props: MapProps) => {
  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: `calc(100dvh - ${NavBarHeight - 32}px)`,
        }}
        //seoul lat lng
        center={props.defaultCenter || { lat: 37.5665, lng: 126.978 }}
        zoom={props.defaultZoom || 10}
      >
        {/* Your map components go here */}
        {props.children}
      </GoogleMap>
    </LoadScript>
  )
}
