/** 좌표 → 주소 텍스트 변환 (Google Geocoding API) */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const geocoder = new google.maps.Geocoder()
    const result = await geocoder.geocode({ location: { lat, lng } })
    return result.results[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}
