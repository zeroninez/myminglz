'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Screen } from '@/components'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function FindEmailPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast.error('아이디를 입력해주세요')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/auth/find-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || '이메일을 찾을 수 없습니다')
        return
      }

      setMaskedEmail(data.maskedEmail)
    } catch {
      toast.error('오류가 발생했습니다. 다시 시도해주세요')
    } finally {
      setIsSubmitting(false)
    }
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
          <h1 className='text-2xl font-bold text-white'>이메일 찾기</h1>
          <p className='text-sm text-gray-400'>가입 시 설정한 아이디(username)를 입력하면 등록된 이메일을 확인할 수 있어요</p>
        </div>

        {maskedEmail ? (
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-3 p-5 bg-gray-800 rounded-2xl border border-gray-700'>
              <p className='text-sm text-gray-400'>가입된 이메일</p>
              <p className='text-lg font-semibold text-white'>{maskedEmail}</p>
            </div>

            <div className='flex flex-col gap-3'>
              <Link
                href='/auth/login'
                className='w-full h-14 bg-primary rounded-full flex justify-center items-center active:scale-95 transition-transform duration-200'
              >
                <span className='text-lg font-semibold text-black'>로그인하기</span>
              </Link>
              <Link
                href='/auth/find-password'
                className='w-full h-14 rounded-full border border-gray-600 flex justify-center items-center active:scale-95 transition-transform duration-200'
              >
                <span className='text-base font-medium text-gray-300'>비밀번호 찾기</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <label htmlFor='username' className='text-sm text-gray-400'>
                아이디
              </label>
              <input
                id='username'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='아이디를 입력하세요'
                className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
                disabled={isSubmitting}
                autoComplete='username'
              />
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full h-14 bg-primary rounded-full flex justify-center items-center mt-2 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <span className='text-lg font-semibold text-black'>{isSubmitting ? '확인 중...' : '이메일 찾기'}</span>
            </button>
          </form>
        )}

        <div className='flex justify-center items-center gap-2'>
          <span className='text-sm text-gray-500'>비밀번호를 잊으셨나요?</span>
          <Link href='/auth/find-password' className='text-sm text-primary font-medium'>
            비밀번호 찾기
          </Link>
        </div>
      </div>

      <div className='w-full h-fit py-8 text-center text-sm font-normal leading-[1.2] opacity-40'>© ZERONINEZ</div>
    </Screen>
  )
}
