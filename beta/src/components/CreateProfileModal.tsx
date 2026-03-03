'use client'

import { useState, useEffect } from 'react'
import { Sheet } from 'react-modal-sheet'
import { Icon } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import toast from 'react-hot-toast'

interface CreateProfileModalProps {
  open: boolean
  onClose: () => void
}

export const CreateProfileModal = ({ open, onClose }: CreateProfileModalProps) => {
  const { user } = useAuthStore()
  const { createProfile, switchProfile, checkUsernameAvailable, fetchAllProfiles } = useProfileStore()

  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setStep(0)
      setUsername('')
      setDisplayName('')
      setBio('')
      setIsSubmitting(false)
      setUsernameStatus('idle')
    }
  }, [open])

  // username 중복 체크 (디바운스)
  useEffect(() => {
    if (!username || username.length < 3 || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
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

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 0) {
      if (!username.trim() || !/^[a-zA-Z0-9_]{3,20}$/.test(username) || usernameStatus === 'taken') return
      setStep(1)
    } else if (step === 1) {
      if (!displayName.trim() || displayName.length > 30) return
      setStep(2)
    } else {
      if (!user) return
      setIsSubmitting(true)

      const { error } = await createProfile(user.id, {
        username: username.toLowerCase(),
        display_name: displayName.trim(),
        bio: bio.trim(),
      })

      if (error) {
        toast.error(error.message || '프로필 생성에 실패했습니다')
        setIsSubmitting(false)
        return
      }

      const all = await fetchAllProfiles(user.id)
      const newProfile = all.find((p) => p.username === username.toLowerCase())
      if (newProfile) {
        await switchProfile(user.id, newProfile.id)
      }

      toast.success('새 프로필이 생성됐습니다!')
      onClose()
    }
  }

  const canProceed =
    step === 0
      ? !!username.trim() && /^[a-zA-Z0-9_]{3,20}$/.test(username) && usernameStatus === 'available'
      : step === 1
        ? !!displayName.trim() && displayName.length <= 30
        : !isSubmitting

  return (
    <Sheet isOpen={open} onClose={onClose} detent='content-height'>
      <Sheet.Container style={{ backgroundColor: '#1a1a1a' }}>
        <Sheet.Header />
        <Sheet.Content disableDrag>
          {/* 헤더 */}
          <div className='w-full flex flex-row justify-between items-center px-6 pt-2 pb-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-gray-500'>{step + 1} / 3</span>
              <h2 className='text-xl font-semibold text-white'>
                {step === 0 ? '새 프로필 아이디' : step === 1 ? '프로필 이름' : '한줄 소개'}
              </h2>
              <p className='text-xs text-gray-400'>
                {step === 0
                  ? '영어, 숫자, 언더스코어 (3-20자)'
                  : step === 1
                    ? '실명이나 닉네임 (30자 이내)'
                    : '자신을 간단히 소개해보세요 (150자 이내)'}
              </p>
            </div>
            <button onClick={onClose} className='p-2'>
              <Icon icon='close' size={20} />
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleNext} className='w-full flex flex-col gap-4 px-6 pb-10'>
            {step === 0 && (
              <div className='flex flex-col gap-2'>
                <div className='relative'>
                  <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-500'>@</span>
                  <input
                    type='text'
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    placeholder='new_profile'
                    maxLength={20}
                    autoFocus
                    className='w-full h-12 pl-9 pr-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
                    disabled={isSubmitting}
                  />
                </div>
                <div className='flex justify-end'>
                  {usernameStatus === 'checking' && <span className='text-xs text-gray-400'>확인 중...</span>}
                  {usernameStatus === 'available' && <span className='text-xs text-green-400'>사용 가능</span>}
                  {usernameStatus === 'taken' && <span className='text-xs text-red-400'>이미 사용 중</span>}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className='flex flex-col gap-2'>
                <input
                  type='text'
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder='홍길동'
                  maxLength={30}
                  autoFocus
                  className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
                  disabled={isSubmitting}
                />
                <span className='text-xs text-gray-500 text-right'>{displayName.length}/30</span>
              </div>
            )}

            {step === 2 && (
              <div className='flex flex-col gap-2'>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder='간단한 자기소개를 입력해주세요'
                  maxLength={150}
                  rows={3}
                  autoFocus
                  className='w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors resize-none'
                  disabled={isSubmitting}
                />
                <span className='text-xs text-gray-500 text-right'>{bio.length}/150</span>
              </div>
            )}

            <button
              type='submit'
              disabled={!canProceed}
              className='w-full h-14 bg-primary rounded-full flex justify-center items-center active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <span className='text-lg font-semibold text-black'>
                {step < 2 ? '다음' : isSubmitting ? '생성 중...' : '프로필 만들기'}
              </span>
            </button>

            {step > 0 && (
              <button type='button' onClick={() => setStep((s) => s - 1)} className='text-sm text-gray-400 text-center'>
                이전
              </button>
            )}
          </form>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onClose} />
    </Sheet>
  )
}
