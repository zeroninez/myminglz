'use client'

import { useEffect, useState } from 'react'
import { OverlayViewF, OVERLAY_MOUSE_TARGET } from '@react-google-maps/api'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface PostPin {
  id: string
  lat: number
  lng: number
  thumbnailUrl: string | null
  expiresAt: string
}

export default function PostPinsLayer() {
  const [pins, setPins] = useState<PostPin[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()

    const fetchPins = async () => {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, location_lat, location_lng, expires_at')
        .eq('visibility', 'public')
        .not('location_lat', 'is', null)
        .not('location_lng', 'is', null)
        .gt('expires_at', new Date().toISOString())

      if (!posts || posts.length === 0) {
        setPins([])
        return
      }

      const postIds = posts.map((p) => p.id)
      const { data: images } = await supabase
        .from('post_images')
        .select('post_id, url, order_index')
        .in('post_id', postIds)
        .order('order_index')

      const firstImageByPost = new Map<string, string>()
      for (const img of images ?? []) {
        if (!firstImageByPost.has(img.post_id)) {
          firstImageByPost.set(img.post_id, img.url)
        }
      }

      setPins(
        posts.map((p) => ({
          id: p.id,
          lat: p.location_lat,
          lng: p.location_lng,
          thumbnailUrl: firstImageByPost.get(p.id) ?? null,
          expiresAt: p.expires_at,
        })),
      )
    }

    fetchPins()

    // 새 포스트 등록/삭제 시 핀 자동 업데이트
    const channel = supabase
      .channel('post-pins-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPins()
      })
      .subscribe()

    // 만료된 핀을 클라이언트에서 제거 (1분마다)
    const expireInterval = setInterval(() => {
      const now = Date.now()
      setPins((prev) => prev.filter((p) => new Date(p.expiresAt).getTime() > now))
    }, 60_000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(expireInterval)
    }
  }, [])

  const handlePinClick = (postId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', postId)
    router.push(`${pathname}?${params}`, { scroll: false })
  }

  return (
    <>
      {pins.map((pin) => (
        <OverlayViewF
          key={pin.id}
          position={{ lat: pin.lat, lng: pin.lng }}
          mapPaneName={OVERLAY_MOUSE_TARGET}
          getPixelPositionOffset={(w, h) => ({ x: -w / 2, y: -h / 2 })}
        >
          <button
            onClick={() => handlePinClick(pin.id)}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg active:scale-90 transition-transform"
            style={{ background: '#333' }}
          >
            {pin.thumbnailUrl ? (
              <img src={pin.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-xs">
                📍
              </div>
            )}
          </button>
        </OverlayViewF>
      ))}
    </>
  )
}
