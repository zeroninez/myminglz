'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { PostImageState, PostLocation, PostVisibility } from '@/types/post'
import { uploadPostImages } from '@/lib/uploadPostImages'
import { createClient } from '@/lib/supabase'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

export function usePostCreate() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { profile } = useProfileStore()
  const { user } = useAuthStore()

  const postParam = searchParams.get('post')
  const isOpen = postParam !== null
  const step = postParam ? Math.min(Math.max(parseInt(postParam) || 1, 1), 4) : 1

  const [images, setImages] = useState<PostImageState[]>([])
  const [content, setContent] = useState('')
  const [location, setLocation] = useState<PostLocation | null>(null)
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [durationHours, setDurationHours] = useState(24)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goToStep = useCallback(
    (n: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('post', String(n))
      router.replace(`${pathname}?${params}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  const closeSheet = useCallback(() => {
    router.back()
  }, [router])

  // 시트 닫힌 후 폼 초기화
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        images.forEach((img) => URL.revokeObjectURL(img.src))
        setImages([])
        setContent('')
        setLocation(null)
        setVisibility('public')
        setDurationHours(24)
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  const submit = useCallback(async () => {
    if (!profile || !user || !location || images.length === 0) return
    setIsSubmitting(true)

    try {
      const postId = crypto.randomUUID()

      const imageInputs = images.map((img, i) => ({
        src: img.src,
        cropArea: img.cropArea,
        filter: img.filter,
        orderIndex: i,
      }))

      const imageUrls = await uploadPostImages(postId, imageInputs, (current, total) => {
        if (current < total) toast.loading(`이미지 업로드 중... (${current + 1}/${total})`, { id: 'upload' })
      })

      toast.dismiss('upload')

      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
      const supabase = createClient()

      const { error: postError } = await supabase.from('posts').insert({
        id: postId,
        profile_id: profile.id,
        content,
        location_name: location.name,
        location_lat: location.lat,
        location_lng: location.lng,
        visibility,
        expires_at: expiresAt,
      })

      if (postError) throw postError

      const { error: imagesError } = await supabase.from('post_images').insert(
        imageUrls.map((url, i) => ({ post_id: postId, url, order_index: i })),
      )

      if (imagesError) throw imagesError

      images.forEach((img) => URL.revokeObjectURL(img.src))
      toast.success('포스트가 등록되었어요!')

      const params = new URLSearchParams(searchParams.toString())
      params.delete('post')
      params.set('view', postId)
      router.replace(`${pathname}?${params}`, { scroll: false })
    } catch (error) {
      console.error(error)
      toast.error('등록에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }, [profile, user, location, images, content, visibility, durationHours, router, pathname, searchParams])

  return {
    isOpen,
    step,
    images,
    setImages,
    content,
    setContent,
    location,
    setLocation,
    visibility,
    setVisibility,
    durationHours,
    isSubmitting,
    goToStep,
    closeSheet,
    submit,
  }
}
