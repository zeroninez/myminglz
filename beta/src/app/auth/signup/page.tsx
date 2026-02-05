'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Screen } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import classNames from 'classnames'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const { signUpWithEmail } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

    setIsLoading(true)

    const { error } = await signUpWithEmail(email, password)

    if (error) {
      toast.error(error.message || '회원가입에 실패했습니다')
      setIsLoading(false)
      return
    }

    toast.success('회원가입 성공! 이메일을 확인해주세요')
    router.push('/auth/login')
  }

  return (
    <Screen className={classNames('bg-[#242424] flex flex-col justify-between items-center px-6')}>
      <div className='w-full flex-1 flex flex-col justify-center items-center'>
        <div className='w-full max-w-sm flex flex-col gap-8'>
          {/* Logo */}
          <div className='w-full flex flex-col items-center gap-2'>
            <img src='/img/sample/profile.png' alt='logo' className='w-auto h-24' />
            <span className='text-primary text-2xl font-semibold'>myminglz</span>
            <p className='text-gray-400 text-sm'>새 계정 만들기</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className='w-full flex flex-col gap-4'>
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
                disabled={isLoading}
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
                placeholder='6자 이상 입력하세요'
                className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
                disabled={isLoading}
              />
            </div>

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
                disabled={isLoading}
              />
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full h-14 bg-primary rounded-full flex justify-center items-center mt-4 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <span className='text-lg font-semibold text-black'>{isLoading ? '가입 중...' : '회원가입'}</span>
            </button>
          </form>

          {/* Login link */}
          <div className='w-full text-center'>
            <span className='text-gray-400 text-sm'>
              이미 계정이 있으신가요?{' '}
              <Link href='/auth/login' className='text-primary font-medium hover:underline'>
                로그인
              </Link>
            </span>
          </div>
        </div>
      </div>

      <div className='w-full h-fit py-8 text-center text-sm font-normal leading-[1.2] opacity-40'>© ZERONINEZ</div>
    </Screen>
  )
}
