'use client'

import { PostFormState, PostVisibility } from '@/types/post'

const DURATION_OPTIONS = [
  { hours: 6, label: '6시간' },
  { hours: 24, label: '24시간' },
  { hours: 48, label: '48시간' },
  { hours: 72, label: '72시간' },
] as const

interface StepPublishProps {
  formState: PostFormState
  visibility: PostVisibility
  onVisibilityChange: (v: PostVisibility) => void
  durationHours: number
  onSubmit: () => void
  isSubmitting: boolean
}

export function StepPublish({ formState, visibility, onVisibilityChange, durationHours, onSubmit, isSubmitting }: StepPublishProps) {
  const { images, content, location } = formState
  const firstImage = images[0]

  return (
    <div className='flex flex-col gap-6 px-4 pt-4 pb-6'>
      {/* 미리보기 */}
      <div className='flex gap-3 p-4 bg-gray-900 rounded-2xl'>
        {firstImage && (
          <img
            src={firstImage.previewSrc ?? firstImage.src}
            alt='대표 이미지'
            className='w-16 h-16 object-cover rounded-xl flex-shrink-0'
          />
        )}
        <div className='flex flex-col gap-1 min-w-0'>
          {content ? (
            <p className='text-white text-sm line-clamp-2 leading-snug'>{content}</p>
          ) : (
            <p className='text-gray-600 text-sm'>내용 없음</p>
          )}
          {location?.name && <p className='text-gray-500 text-xs truncate'>📍 {location.name}</p>}
          {images.length > 0 && <p className='text-gray-600 text-xs'>사진 {images.length}장</p>}
        </div>
      </div>

      {/* 게시 유지 시간 */}
      <div>
        <div className='flex items-center gap-2 mb-3'>
          <p className='text-gray-400 text-sm font-medium'>게시 유지 시간</p>
          <span className='text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400'>PRO</span>
        </div>
        <div className='grid grid-cols-4 gap-2'>
          {DURATION_OPTIONS.map((opt) => (
            <div
              key={opt.hours}
              className={`relative flex items-center justify-center py-3 rounded-xl border text-sm font-medium ${
                durationHours === opt.hours
                  ? 'border-gray-600 bg-gray-800 text-gray-400'
                  : 'border-gray-800 text-gray-600'
              }`}
            >
              {opt.label}
              {/* 24h 외에는 잠금 표시 */}
              {opt.hours !== 24 && (
                <span className='absolute top-1 right-1 text-[8px]'>🔒</span>
              )}
            </div>
          ))}
        </div>
        <p className='text-gray-700 text-xs mt-2'>기본 24시간 후 핀이 사라져요</p>
      </div>

      {/* 공개 범위 */}
      <div>
        <p className='text-gray-400 text-sm font-medium mb-3'>공개 범위</p>
        <div className='flex flex-col gap-2'>
          {(
            [
              { value: 'public', label: '전체 공개', desc: '모든 사람이 볼 수 있어요' },
              { value: 'followers', label: '팔로워 공개', desc: '팔로워만 볼 수 있어요' },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onVisibilityChange(opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${
                visibility === opt.value
                  ? 'border-primary-400 bg-primary-400/10 text-white'
                  : 'border-gray-800 text-gray-400'
              }`}
            >
              <div className='text-left'>
                <p className='text-sm font-medium'>{opt.label}</p>
                <p className='text-xs opacity-60 mt-0.5'>{opt.desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  visibility === opt.value ? 'border-primary-400 bg-primary-400' : 'border-gray-700'
                }`}
              >
                {visibility === opt.value && <div className='w-2 h-2 rounded-full bg-black' />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 등록 버튼 */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting || images.length === 0 || !location}
        className={`w-full py-4 rounded-2xl text-base font-semibold transition-all active:scale-95 ${
          isSubmitting || images.length === 0 || !location
            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
            : 'bg-primary text-black'
        }`}
      >
        {isSubmitting ? '등록 중...' : '포스트 등록'}
      </button>

      {(images.length === 0 || !location) && (
        <p className='text-center text-gray-600 text-xs -mt-4'>
          {images.length === 0 && !location
            ? '사진과 위치가 필요해요'
            : images.length === 0
              ? '사진이 필요해요'
              : '위치가 필요해요'}
        </p>
      )}
    </div>
  )
}
