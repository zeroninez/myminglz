'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Screen, Icon, LinkAction } from '@/components'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import { useFollow } from '@/hooks/useFollow'
import { useFollowCount } from '@/hooks/useFollowCount'
import { useProfileStore } from '@/stores/profileStore'
import classNames from 'classnames'
import { ProfileCard } from '@/components'

export default function ProfileViewPage() {
  const router = useRouter()
  const params = useParams()
  const profileId = params.profileId as string

  const { profile: currentProfile } = useProfileStore()
  const [targetProfile, setTargetProfile] = useState<Profile | null>(null)
  const [isPageLoading, setIsPageLoading] = useState(true)

  const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollow(profileId)
  const { followerCount, followingCount } = useFollowCount(profileId)

  const isOwnProfile = currentProfile?.id === profileId

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', profileId).single()
      setTargetProfile(data ?? null)
      setIsPageLoading(false)
    }
    if (profileId) fetchProfile()
  }, [profileId])

  if (isPageLoading) {
    return (
      <Screen className='bg-[#242424]' header={{ title: '', left: { icon: 'left', onClick: () => router.back() } }}>
        <div className='w-full h-full flex items-center justify-center'>
          <div className='w-16 h-16 rounded-full bg-gray-800 animate-pulse' />
        </div>
      </Screen>
    )
  }

  if (!targetProfile) {
    return (
      <Screen
        className='bg-[#242424] flex flex-col items-center justify-center gap-4'
        header={{ title: '프로필', left: { icon: 'left', onClick: () => router.back() } }}
      >
        <Icon icon='user' size={48} className='text-gray-700' />
        <span className='text-sm text-gray-500'>존재하지 않는 프로필이에요</span>
      </Screen>
    )
  }

  return (
    <Screen
      className='bg-[#242424]'
      header={{
        title: `@${targetProfile.username}`,
        left: { icon: 'left', onClick: () => router.back() },
      }}
    >
      <div className='w-full h-full flex flex-col overflow-y-auto pb-24 pt-2 px-2 gap-1'>
        {/* 프로필 이미지 + 기본 정보 */}
        <ProfileCard mode='explore' profile={targetProfile} />
        <LinkAction
          mode='explore'
          name={targetProfile?.link_name || '링크'}
          link={targetProfile?.link_url || undefined}
        />

        {/* 비공개 계정 안내 */}
        {targetProfile.is_private && !isOwnProfile && !isFollowing && (
          <div className='mx-4 mt-4 flex flex-col items-center gap-2 py-10'>
            <Icon icon='folder' size={36} className='text-gray-700' />
            <span className='text-sm text-gray-500 text-center'>
              비공개 계정이에요.
              <br />
              팔로우하면 게시물을 볼 수 있어요.
            </span>
          </div>
        )}
      </div>
    </Screen>
  )
}
