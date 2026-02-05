'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Screen } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import classNames from 'classnames'
import toast from 'react-hot-toast'

type AuthTab = 'login' | 'signup'

export default function Page() {
  const router = useRouter()
  const { user, isLoading, signInWithEmail, signUpWithEmail } = useAuthStore()

  const [activeTab, setActiveTab] = useState<AuthTab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 이미 로그인된 경우 map 페이지로 이동
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/map')
    }
  }, [user, isLoading, router])

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab)
    resetForm()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요')
      return
    }

    setIsSubmitting(true)
    const { error } = await signInWithEmail(email, password)

    if (error) {
      toast.error(error.message || '로그인에 실패했습니다')
      setIsSubmitting(false)
      return
    }

    toast.success('로그인 성공!')
    router.push('/map')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !confirmPassword) {
      toast.error('모든 필드를 입력해주세요')
      return
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다')
      return
    }

    if (password.length < 6) {
      toast.error('비밀번호는 6자 이상이어야 합니다')
      return
    }

    setIsSubmitting(true)
    const { error } = await signUpWithEmail(email, password)

    if (error) {
      toast.error(error.message || '회원가입에 실패했습니다')
      setIsSubmitting(false)
      return
    }

    toast.success('회원가입 성공! 이메일을 확인해주세요')
    setActiveTab('login')
    resetForm()
    setIsSubmitting(false)
  }

  // 로딩 중이거나 이미 로그인된 경우 로딩 화면 표시
  if (isLoading || user) {
    return (
      <Screen className='bg-[#242424] flex flex-col justify-center items-center'>
        <div className='animate-pulse'>
          <img src='/img/sample/profile.png' alt='logo' className='w-auto h-24' />
        </div>
      </Screen>
    )
  }

  return (
    <Screen className={classNames('bg-[#242424] flex flex-col justify-between items-center')}>
      <span className='w-full text-center text-sm font-normal leading-[1.2] opacity-20 mt-4'>
        @beta {process.env.NEXT_PUBLIC_APP_VERSION}
      </span>

      <div className='w-full max-w-sm flex-1 flex flex-col justify-center items-center gap-6 px-6'>
        {/* Logo */}
        <div className='w-full flex flex-col items-center gap-2'>
          <img src='/img/sample/profile.png' alt='logo' className='w-auto h-24' />
          <span className='text-primary text-2xl font-semibold'>myminglz</span>
          <p className='text-sm font-normal leading-[1.2] opacity-60 text-center'>
            걸어다니며 지역을 탐방하는 로컬 기반 SNS 플랫폼
          </p>
        </div>

        {/* Tab Buttons */}
        <div className='w-full flex rounded-full bg-gray-800 p-1'>
          <button
            onClick={() => handleTabChange('login')}
            className={classNames(
              'flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
              activeTab === 'login' ? 'bg-primary text-black' : 'text-gray-400',
            )}
          >
            로그인
          </button>
          <button
            onClick={() => handleTabChange('signup')}
            className={classNames(
              'flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
              activeTab === 'signup' ? 'bg-primary text-black' : 'text-gray-400',
            )}
          >
            회원가입
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={activeTab === 'login' ? handleLogin : handleSignUp} className='w-full flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='email' className='text-sm text-gray-400'>
              이메일
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='email@example.com'
              className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
              disabled={isSubmitting}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='password' className='text-sm text-gray-400'>
              비밀번호
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={activeTab === 'signup' ? '6자 이상 입력하세요' : '비밀번호를 입력하세요'}
              className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
              disabled={isSubmitting}
            />
          </div>

          {activeTab === 'signup' && (
            <div className='flex flex-col gap-2'>
              <label htmlFor='confirmPassword' className='text-sm text-gray-400'>
                비밀번호 확인
              </label>
              <input
                id='confirmPassword'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='비밀번호를 다시 입력하세요'
                className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
                disabled={isSubmitting}
              />
            </div>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full h-14 bg-primary rounded-full flex justify-center items-center mt-2 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <span className='text-lg font-semibold text-black'>
              {isSubmitting ? (activeTab === 'login' ? '로그인 중...' : '가입 중...') : activeTab === 'login' ? '로그인' : '회원가입'}
            </span>
          </button>
        </form>
      </div>

      <div className='w-full h-fit py-8 text-center text-sm font-normal leading-[1.2] opacity-40'>© ZERONINEZ</div>
    </Screen>
  )
}
