'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Screen } from '@/components'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error('유효하지 않은 접근입니다. 비밀번호 찾기를 다시 시도해주세요')
        router.replace('/auth/find-password')
      } else {
        setIsReady(true)
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error('비밀번호를 입력해주세요')
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
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message || '비밀번호 변경에 실패했습니다')
      setIsSubmitting(false)
      return
    }

    toast.success('비밀번호가 변경되었습니다')
    router.replace('/map')
  }

  if (!isReady) {
    return (
      <Screen className='bg-[#242424] flex flex-col justify-center items-center'>
        <div className='animate-pulse'>
          <img src='/img/sample/profile.png' alt='logo' className='w-auto h-24' />
        </div>
      </Screen>
    )
  }

  return (
    <Screen className='bg-[#242424] flex flex-col justify-between items-center'>
      <div className='w-full flex items-center px-4 pt-4'>
        <div className='w-10 h-10' />
      </div>

      <div className='w-full max-w-sm flex-1 flex flex-col justify-center gap-8 px-6'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold text-white'>비밀번호 변경</h1>
          <p className='text-sm text-gray-400'>새로운 비밀번호를 설정해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='password' className='text-sm text-gray-400'>
              새 비밀번호
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='6자 이상 입력하세요'
              className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
              disabled={isSubmitting}
              autoComplete='new-password'
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='confirmPassword' className='text-sm text-gray-400'>
              새 비밀번호 확인
            </label>
            <input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder='비밀번호를 다시 입력하세요'
              className='w-full h-12 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-primary transition-colors'
              disabled={isSubmitting}
              autoComplete='new-password'
            />
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full h-14 bg-primary rounded-full flex justify-center items-center mt-2 active:scale-95 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <span className='text-lg font-semibold text-black'>
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </span>
          </button>
        </form>
      </div>

      <div className='w-full h-fit py-8 text-center text-sm font-normal leading-[1.2] opacity-40'>© ZERONINEZ</div>
    </Screen>
  )
}
