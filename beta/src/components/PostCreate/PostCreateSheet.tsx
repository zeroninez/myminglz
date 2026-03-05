'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Sheet } from 'react-modal-sheet'
import { StepImageSelect } from './StepImageSelect'
import { StepContent } from './StepContent'
import { StepLocation } from './StepLocation'
import { StepPublish } from './StepPublish'
import { PostFormState, PostImageState, PostLocation, PostVisibility } from '@/types/post'
import { uploadPostImages } from '@/lib/uploadPostImages'
import { createClient } from '@/lib/supabase'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import { Icon } from '@/components/Icon'
import toast from 'react-hot-toast'

const STEPS = ['사진', '내용', '위치', '설정']

export function PostCreateSheet() {
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

  // 스텝 이동은 replace (history 안 쌓음) — 브라우저 뒤로가기 = 시트 닫기
  const goToStep = useCallback(
    (n: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('post', String(n))
      router.replace(`${pathname}?${params}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  // 시트 닫기 = 시트 오픈 시 push한 항목을 back으로 제거
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

  const canGoNext = (step === 1 && images.length > 0) || step === 2 || (step === 3 && location !== null) || step === 4

  const handleBack = () => {
    if (step > 1) goToStep(step - 1)
    else closeSheet()
  }

  const handleNext = () => {
    if (step < 4) goToStep(step + 1)
  }

  const handleSubmit = useCallback(async () => {
    if (!profile || !user || !location || images.length === 0) return
    setIsSubmitting(true)

    try {
      const postId = crypto.randomUUID()
      const supabase = createClient()

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
        imageUrls.map((url, i) => ({
          post_id: postId,
          url,
          order_index: i,
        })),
      )

      if (imagesError) throw imagesError

      images.forEach((img) => URL.revokeObjectURL(img.src))
      toast.success('포스트가 등록되었어요!')
      // ?post 제거 + ?view=postId로 replace (단일 이동, history 오염 없음)
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

  const formState: PostFormState = { images, content, location, visibility, durationHours }

  return (
    <Sheet isOpen={isOpen} onClose={closeSheet} detent='full-height' tweenConfig={{ ease: 'easeOut', duration: 0.2 }}>
      <Sheet.Backdrop onTap={closeSheet} />
      <Sheet.Container
        style={{
          backgroundColor: '#121212',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}
      >
        {/* 드래그 핸들만 표시, 드래그는 비활성화 (작성 중 실수 방지) */}
        <Sheet.Header />

        <Sheet.Content disableDrag style={{ paddingBottom: 0 }}>
          {/* 헤더 */}
          <div className='flex items-center justify-between px-4 pb-3'>
            <button
              onClick={handleBack}
              className='text-white flex items-center gap-1 active:text-gray-400 min-w-[40px]'
            >
              <Icon icon='left' size={20} motion={false} />
            </button>
            <span className='text-white text-base font-medium'>{STEPS[step - 1]}</span>
            {step < 4 ? (
              <button
                onClick={canGoNext ? handleNext : undefined}
                className={`text-sm font-semibold min-w-[40px] text-right ${canGoNext ? 'text-primary-400' : 'text-gray-700'}`}
              >
                다음
              </button>
            ) : (
              <div className='min-w-[40px]' />
            )}
          </div>

          {/* 단계 인디케이터 */}
          <div className='flex gap-1 px-4 pb-3'>
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                  i + 1 <= step ? 'bg-primary-400' : 'bg-gray-800'
                }`}
              />
            ))}
          </div>

          {/* 각 스텝 컨텐츠 */}
          <div className='flex-1 overflow-y-auto pb-safe-offset-6'>
            {step === 1 && <StepImageSelect images={images} onChange={setImages} />}
            {step === 2 && <StepContent content={content} onChange={setContent} />}
            {step === 3 && <StepLocation location={location} onChange={setLocation} />}
            {step === 4 && (
              <StepPublish
                formState={formState}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                durationHours={durationHours}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  )
}
