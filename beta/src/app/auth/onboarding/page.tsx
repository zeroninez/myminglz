'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Screen } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { uploadProfileImage } from '@/lib/uploadProfileImage'
import classNames from 'classnames'
import toast from 'react-hot-toast'

// 단계 순서:
// 0: 아이디 (username)
// 1: 프로필 이름 (display_name) → 여기서 프로필 생성
// 2: 프로필 사진 (profile_image, 건너뛰기 가능)
// 3: 한줄 소개 (bio) → 여기서 bio 업데이트 후 /map

export default function ProfileSetupPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthStore()
  const { profile, isLoading: profileLoading, createProfile, updateProfile, checkUsernameAvailable } = useProfileStore()

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [onboardingStep, setOnboardingStep] = useState(0)

  // 프로필 생성 후 이미지 업로드에 사용할 ID
  const [createdProfileId, setCreatedProfileId] = useState<string | null>(null)

  // 프로필이 생성된 뒤 useEffect가 /map으로 튕겨버리는 걸 막는 플래그
  const skipRedirectRef = useRef(false)

  // 프로필 사진 업로드 상태
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageStatus, setImageStatus] = useState<'idle' | 'compressing' | 'uploading'>('idle')
  const [imageProgress, setImageProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 이미 프로필이 있으면 메인으로 (온보딩 중 생성한 경우는 제외)
  useEffect(() => {
    if (!authLoading && !profileLoading && profile && !skipRedirectRef.current) {
      router.push('/map')
    }
  }, [authLoading, profileLoading, profile, router])

  // username 중복 체크 (디바운스)
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus('idle')
      return
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const isAvailable = await checkUsernameAvailable(username)
      setUsernameStatus(isAvailable ? 'available' : 'taken')
    }, 500)

    return () => clearTimeout(timer)
  }, [username, checkUsernameAvailable])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !createdProfileId) return
    e.target.value = ''

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능해요.')
      return
    }

    setImageUrl(URL.createObjectURL(file))
    setImageProgress(0)

    const toastId = toast.loading('압축 중... 0%')
    try {
      const url = await uploadProfileImage(
        file,
        createdProfileId,
        (p) => {
          setImageStatus('compressing')
          const pct = Math.round(p * 0.5)
          setImageProgress(pct)
          toast.loading(`압축 중... ${pct}%`, { id: toastId })
        },
        (p) => {
          setImageStatus('uploading')
          const pct = 50 + Math.round(p * 0.5)
          setImageProgress(pct)
          toast.loading(`업로드 중... ${pct}%`, { id: toastId })
        },
      )
      setImageUrl(url)
      setImageStatus('idle')
      setImageProgress(0)
      toast.success('프로필 사진이 저장됐어요.', { id: toastId })
    } catch (err) {
      console.error(err)
      setImageUrl(null)
      setImageStatus('idle')
      setImageProgress(0)
      toast.error('업로드에 실패했어요. 다시 시도해줘.', { id: toastId })
    }
  }

  const goToMap = () => {
    skipRedirectRef.current = false
    router.replace('/map')
    setTimeout(() => { window.location.href = '/map' }, 1000)
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    // Step 0: 아이디 검증 후 다음
    if (onboardingStep === 0) {
      if (!username.trim()) return toast.error('아이디를 입력해주세요')
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return toast.error('아이디는 영어, 숫자, 언더스코어만 사용 가능합니다 (3-20자)')
      if (usernameStatus === 'taken') return toast.error('이미 사용 중인 아이디입니다')
      setOnboardingStep(1)
      return
    }

    // Step 1: 이름 검증 후 프로필 생성 → step 2
    if (onboardingStep === 1) {
      if (!displayName.trim()) return toast.error('이름을 입력해주세요')
      if (displayName.length > 30) return toast.error('이름은 30자 이내로 입력해주세요')
      if (!user) return

      setIsSubmitting(true)
      skipRedirectRef.current = true // 생성 후 튕기지 않도록

      const { error, data } = await createProfile(user.id, {
        username: username.toLowerCase(),
        display_name: displayName.trim(),
        bio: '',
      })

      if (error) {
        toast.error(error.message || '프로필 생성에 실패했습니다')
        skipRedirectRef.current = false
        setIsSubmitting(false)
        return
      }

      setCreatedProfileId(data?.id ?? null)
      setIsSubmitting(false)
      setOnboardingStep(2)
      return
    }

    // Step 2: 프로필 사진 → step 3 (이미지 업로드 중이면 막기)
    if (onboardingStep === 2) {
      setOnboardingStep(3)
      return
    }

    // Step 3: 한줄 소개 저장 후 완료
    if (bio.length > 150) return toast.error('한줄 소개는 150자 이내로 입력해주세요')

    if (createdProfileId && bio.trim()) {
      setIsSubmitting(true)
      const { error } = await updateProfile(createdProfileId, { bio: bio.trim() })
      if (error) {
        toast.error('소개 저장에 실패했습니다')
        setIsSubmitting(false)
        return
      }
      setIsSubmitting(false)
    }

    toast.success('프로필이 완성됐어요!')
    goToMap()
  }

  if (authLoading || profileLoading) {
    return (
      <Screen className='bg-[#242424] flex flex-col justify-center items-center'>
        <div className='animate-pulse'>
          <img src='/img/sample/profile.png' alt='logo' className='w-auto h-24' />
        </div>
      </Screen>
    )
  }

  const isImageLoading = imageStatus !== 'idle'
  const TOTAL_STEPS = 4

  const stepTitle = [
    '사용하실 아이디를 \n입력해주세요',
    '프로필 이름을 \n입력해주세요',
    '프로필 사진을 \n설정해주세요',
    '간단한 자기소개를 \n입력해주세요',
  ][onboardingStep]

  const stepDesc = [
    '아이디는 영어, 숫자, 언더스코어만 사용 가능합니다 (3-20자)',
    '실명이나 닉네임 등 원하는 이름을 입력해주세요 (30자 이내)',
    '나중에 마이페이지에서도 변경할 수 있어요',
    '자신을 간단히 소개할 수 있는 글을 입력해주세요 (150자 이내)',
  ][onboardingStep]

  return (
    <Screen className={classNames('bg-[#242424] flex flex-col justify-between items-center')}>
      {/* Header */}
      <div className='w-full flex flex-col justify-start items-start gap-4 p-6'>
        <span className='text-sm text-gray-500'>{onboardingStep + 1} / {TOTAL_STEPS}</span>
        <h1 className='text-2xl font-semibold text-white whitespace-pre-line'>{stepTitle}</h1>
        <p className='text-xs text-gray-400'>{stepDesc}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='w-full h-full flex flex-col'>
        <div className='w-full h-full flex flex-col gap-2'>

          {/* Step 0: 아이디 */}
          {onboardingStep === 0 && (
            <div className='w-full h-full flex flex-col gap-2 p-6'>
              <div className='relative'>
                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>@</span>
                <input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  placeholder='myminglz_user'
                  maxLength={20}
                  className='w-full h-12 pl-9 pr-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
                />
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-gray-500'>영어, 숫자, 언더스코어 (3-20자)</span>
                {usernameStatus === 'checking' && <span className='text-xs text-gray-400'>확인 중...</span>}
                {usernameStatus === 'available' && <span className='text-xs text-green-400'>사용 가능</span>}
                {usernameStatus === 'taken' && <span className='text-xs text-red-400'>이미 사용 중</span>}
              </div>
            </div>
          )}

          {/* Step 1: 이름 */}
          {onboardingStep === 1 && (
            <div className='w-full h-full flex flex-col gap-2 p-6'>
              <input
                type='text'
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder='홍길동'
                maxLength={30}
                className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
                disabled={isSubmitting}
              />
              <span className='text-xs text-gray-500 text-right'>{displayName.length}/30</span>
            </div>
          )}

          {/* Step 2: 프로필 사진 */}
          {onboardingStep === 2 && (
            <div className='w-full h-full flex flex-col items-center justify-center gap-6 p-6'>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={isImageLoading}
                className='relative w-40 h-40 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 disabled:opacity-70'
              >
                <img
                  src={imageUrl ?? '/img/sample/profile.png'}
                  alt='프로필'
                  className='w-full h-full object-cover'
                />
                {isImageLoading && (
                  <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                    <svg className='w-16 h-16 -rotate-90' viewBox='0 0 64 64'>
                      <circle cx='32' cy='32' r='28' fill='none' stroke='white' strokeOpacity={0.2} strokeWidth='4' />
                      <circle
                        cx='32' cy='32' r='28'
                        fill='none' stroke='white' strokeWidth='4' strokeLinecap='round'
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - imageProgress / 100)}`}
                        className='transition-all duration-300'
                      />
                    </svg>
                  </div>
                )}
                {!isImageLoading && !imageUrl && (
                  <div className='absolute inset-0 bg-black/40 flex items-center justify-center'>
                    <span className='text-white text-xs'>탭하여 추가</span>
                  </div>
                )}
              </button>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={isImageLoading}
                className='px-5 py-2 rounded-full bg-white/10 text-white text-sm font-medium disabled:opacity-50 hover:bg-white/20 transition-colors'
              >
                {imageUrl ? '사진 변경' : '사진 선택'}
              </button>
              <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleFileChange} />
            </div>
          )}

          {/* Step 3: 한줄 소개 */}
          {onboardingStep === 3 && (
            <div className='w-full h-full flex flex-col gap-2 p-6'>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder='간단한 자기소개를 입력해주세요'
                maxLength={150}
                rows={3}
                className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors resize-none'
                disabled={isSubmitting}
              />
              <span className='text-xs text-gray-500 text-right'>{bio.length}/150</span>
            </div>
          )}
        </div>

        {/* Bottom buttons */}
        <div className='w-full p-6 h-fit flex flex-col gap-2'>
          {onboardingStep === 2 && (
            <button
              type='button'
              onClick={() => setOnboardingStep(3)}
              disabled={isImageLoading}
              className='w-full h-12 rounded-full flex justify-center items-center text-gray-400 text-sm disabled:opacity-50'
            >
              건너뛰기
            </button>
          )}
          <button
            type='submit'
            disabled={
              onboardingStep === 0
                ? !username.trim() || !/^[a-zA-Z0-9_]{3,20}$/.test(username) || usernameStatus === 'taken' || usernameStatus === 'checking'
                : onboardingStep === 1
                  ? !displayName.trim() || displayName.length > 30 || isSubmitting
                  : onboardingStep === 2
                    ? isImageLoading
                    : isSubmitting
            }
            className='w-full h-14 bg-primary rounded-full flex justify-center items-center mt-2 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <span className='text-lg font-semibold text-black'>
              {onboardingStep < 2
                ? isSubmitting ? '생성 중...' : '다음'
                : onboardingStep === 2
                  ? '다음'
                  : isSubmitting ? '저장 중...' : '시작하기'}
            </span>
          </button>
        </div>
      </form>
    </Screen>
  )
}
