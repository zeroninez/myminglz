'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Screen } from '@/components'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import { Profile } from '@/types'
import classNames from 'classnames'
import toast from 'react-hot-toast'

export default function SelectProfilePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthStore()
  const { fetchAllProfiles, switchProfile } = useProfileStore()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectingId, setSelectingId] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user?.id) return

    fetchAllProfiles(user.id).then((all) => {
      if (all.length === 0) {
        // 프로필 자체가 없으면 온보딩으로
        router.replace('/auth/onboarding')
        return
      }
      if (all.length === 1) {
        // 프로필이 1개면 자동 선택
        handleSelect(all[0])
        return
      }
      setProfiles(all)
      setIsLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id])

  const handleSelect = async (profile: Profile) => {
    if (!user?.id || selectingId) return
    setSelectingId(profile.id)
    try {
      await switchProfile(user.id, profile.id)
      router.replace('/map')
    } catch {
      toast.error('프로필 선택에 실패했습니다')
      setSelectingId(null)
    }
  }

  if (authLoading || isLoading) {
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
      {/* Header */}
      <div className='w-full flex flex-col justify-start items-start gap-2 p-6'>
        <h1 className='text-2xl font-semibold text-white'>어떤 프로필로 시작할까요?</h1>
        <p className='text-sm text-gray-400'>사용할 프로필을 선택해주세요</p>
      </div>

      {/* Profile List */}
      <div className='w-full flex-1 flex flex-col gap-3 px-6'>
        {profiles.map((profile) => (
          <button
            key={profile.id}
            onClick={() => handleSelect(profile)}
            disabled={!!selectingId}
            className={classNames(
              'w-full flex flex-row items-center gap-4 p-4 rounded-2xl bg-gray-800 border border-gray-700',
              'active:scale-95 transition-transform duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selectingId === profile.id && 'border-primary',
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.profile_image ?? '/img/sample/profile.png'}
              alt={profile.username}
              className='w-14 h-14 rounded-full object-cover bg-gray-700 shrink-0'
            />
            <div className='flex flex-col items-start gap-0.5 min-w-0'>
              <span className='text-base font-semibold text-white truncate'>{profile.display_name}</span>
              <span className='text-sm text-gray-400 truncate'>@{profile.username}</span>
              {profile.bio && <span className='text-xs text-gray-500 truncate'>{profile.bio}</span>}
            </div>
            {selectingId === profile.id && (
              <span className='ml-auto text-xs text-primary shrink-0'>선택 중...</span>
            )}
          </button>
        ))}
      </div>

      <div className='w-full p-6' />
    </Screen>
  )
}
