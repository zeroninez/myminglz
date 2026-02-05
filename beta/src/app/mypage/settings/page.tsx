'use client'

import { useRouter } from 'next/navigation'
import { Screen, Icon } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import classNames from 'classnames'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()

  const handleSignOut = async () => {
    await signOut()
    toast.success('로그아웃 되었습니다')
    router.push('/')
  }

  return (
    <Screen
      className={classNames('bg-[#242424]')}
      header={{
        title: '설정',
        left: {
          icon: 'arrow-left',
          onClick: () => router.back(),
        },
      }}
    >
      <div className='w-full h-full flex flex-col px-4 py-4 gap-6'>
        {/* 계정 정보 섹션 */}
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-medium text-gray-400'>계정 정보</h2>
          <div className='bg-gray-800 rounded-xl p-4 flex flex-col gap-3'>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm text-gray-400'>이메일</span>
              <span className='text-sm text-white'>{user?.email || '-'}</span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm text-gray-400'>가입일</span>
              <span className='text-sm text-white'>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '-'}
              </span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm text-gray-400'>마지막 로그인</span>
              <span className='text-sm text-white'>
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('ko-KR') : '-'}
              </span>
            </div>
          </div>
        </section>

        {/* 계정 관리 섹션 */}
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-medium text-gray-400'>계정 관리</h2>
          <div className='flex flex-col gap-2'>
            <button
              onClick={handleSignOut}
              className='w-full bg-gray-800 rounded-xl p-4 flex flex-row justify-between items-center active:bg-gray-700 transition-colors'
            >
              <span className='text-sm text-red-400'>로그아웃</span>
              <Icon icon='log-out' size={18} className='text-red-400' />
            </button>
          </div>
        </section>

        {/* 앱 정보 섹션 */}
        <section className='flex flex-col gap-3'>
          <h2 className='text-sm font-medium text-gray-400'>앱 정보</h2>
          <div className='bg-gray-800 rounded-xl p-4 flex flex-col gap-3'>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm text-gray-400'>버전</span>
              <span className='text-sm text-white'>{process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}</span>
            </div>
          </div>
        </section>
      </div>
    </Screen>
  )
}
