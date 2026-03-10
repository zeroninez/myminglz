'use client'

import { Sheet } from 'react-modal-sheet'
import { StepImageSelect } from './StepImageSelect'
import { StepContent } from './StepContent'
import { StepLocation } from './StepLocation'
import { StepPublish } from './StepPublish'
import { PostFormState } from '@/types/post'
import { Icon } from '@/components/Icon'
import { usePostCreate } from '../../hooks/usePostCreate'

const STEPS = ['사진', '내용', '위치', '설정']

export function PostCreateSheet() {
  const {
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
  } = usePostCreate()

  const canGoNext = (step === 1 && images.length > 0) || step === 2 || (step === 3 && location !== null) || step === 4

  const handleBack = () => {
    if (step > 1) goToStep(step - 1)
    else closeSheet()
  }

  const handleNext = () => {
    if (step < 4) goToStep(step + 1)
  }

  const formState: PostFormState = { images, content, location, visibility, durationHours }

  return (
    <Sheet isOpen={isOpen} onClose={closeSheet} detent='full' tweenConfig={{ ease: 'easeOut', duration: 0.2 }}>
      <Sheet.Container
        style={{
          backgroundColor: '#121212',
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
                onSubmit={submit}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  )
}
