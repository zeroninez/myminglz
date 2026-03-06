'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Screen } from '@/components'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function FindPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('이메일을 입력해주세요')
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      toast.error(error.message || '이메일 발송에 실패했습니다')
      setIsSubmitting(false)
      return
    }

    setIsSent(true)
    setIsSubmitting(false)
  }

  return (
    <Screen className='bg-[#242424] flex flex-col justify-between items-center'>
      <div className='w-full flex items-center px-4 pt-4'>
        <button
          onClick={() => router.back()}
          className='w-10 h-10 flex items-center justify-center rounded-full border border-[#555] active:scale-95 transition-transform duration-200'
          aria-label='뒤로가기'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='text-gray-400'
          >
            <path d='m15 18-6-6 6-6' />
          </svg>
        </button>
      </div>

      <div className='w-full max-w-sm flex-1 flex flex-col justify-center gap-8 px-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold text-white'>비밀번호 찾기</h1>
          <p className='text-sm text-gray-400'>가입한 이메일로 비밀번호 재설정 링크를 보내드려요</p>
        </div>

        {isSent ? (
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3 p-5 bg-gray-800 rounded-2xl border border-gray-700'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='text-primary'
                  >
                    <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.27a16 16 0 0 0 6.56 6.56l1.64-1.64a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z' />
                  </svg>
                </div>
                <div>
                  <p className='text-sm font-medium text-white'>이메일을 전송했어요</p>
                  <p className='text-xs text-gray-400 mt-0.5'>{email}</p>
                </div>
              </div>
              <p className='text-sm text-gray-400 leading-relaxed'>
                메일함을 확인하고 링크를 클릭해 비밀번호를 재설정하세요. 메일이 보이지 않으면 스팸함도 확인해주세요.
              </p>
            </div>

            <button
              onClick={() => setIsSent(false)}
              className='w-full h-14 rounded-full border border-gray-600 flex justify-center items-center active:scale-95 transition-transform duration-200'
            >
              <span className='text-base font-medium text-gray-300'>다른 이메일로 재전송</span>
            </button>

            <Link
              href='/auth/login'
              className='text-sm text-primary font-medium text-center'
            >
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
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
                autoComplete='email'
              />
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full h-14 bg-primary rounded-full flex justify-center items-center mt-2 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <span className='text-lg font-semibold text-black'>
                {isSubmitting ? '전송 중...' : '재설정 링크 전송'}
              </span>
            </button>
          </form>
        )}

        <div className='flex justify-center items-center gap-2'>
          <span className='text-sm text-gray-500'>이메일이 기억나지 않으세요?</span>
          <Link href='/auth/find-email' className='text-sm text-primary font-medium'>
            아이디 찾기
          </Link>
        </div>
      </div>

      <div className='w-full h-fit py-8 text-center text-sm font-normal leading-[1.2] opacity-40'>© ZERONINEZ</div>
    </Screen>
  )
}
