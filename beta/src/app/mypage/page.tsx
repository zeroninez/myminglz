'use client'

import classNames from 'classnames'
import {
  Icon,
  LinkAction,
  Screen,
  ProfileCard,
  CreateProfileModal,
  SwitchProfileModal,
  PostShelves,
  StatusBar,
} from '@/components'
import { useRouter } from 'next/navigation'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import { Profile } from '@/types'
import { useEffect, useState } from 'react'

export default function Page() {
  const router = useRouter()

  const { user, signOut } = useAuthStore()
  // AuthProvider가 로그인 시 자동으로 프로필을 로드하므로 별도 fetch 불필요
  const { profile, fetchAllProfiles, switchProfile } = useProfileStore()

  const [restProfiles, setRestProfiles] = useState<Profile[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false)

  useEffect(() => {
    if (!user?.id || !profile?.id) {
      setRestProfiles([])
      return
    }
    fetchAllProfiles(user.id).then((all) => {
      setRestProfiles(all.filter((p) => p.id !== profile.id))
    })
  }, [user?.id, profile?.id])

  const MYPOSTS = [
    { id: 1, title: '첫 번째 글', content: '안녕하세요! 이것은 첫 번째 글입니다.' },
    { id: 2, title: '두 번째 글', content: '두 번째 글도 재미있어요!' },
    { id: 3, title: '세 번째 글', content: '세 번째 글입니다. 잘 부탁드려요!' },
    { id: 4, title: '네 번째 글', content: '네 번째 글도 열심히 작성 중입니다.' },
    { id: 5, title: '다섯 번째 글', content: '다섯 번째 글이에요. 읽어주세요!' },
    { id: 6, title: '여섯 번째 글', content: '여섯 번째 글도 기대해주세요!' },
    { id: 7, title: '일곱 번째 글', content: '일곱 번째 글입니다.' },
  ]

  return (
    <Screen nav className={classNames(`px-3 pt-3 space-y-3`, ``)}>
      <StatusBar credit={0} />
      <ProfileCard
        mode='mypage'
        profile={profile}
        restProfiles={restProfiles}
        onOpenSwitchModal={() => setIsSwitchModalOpen(true)}
        onHandleMultiprofile={() => setIsCreateModalOpen(true)}
      />
      <LinkAction mode='mypage' name={profile?.link_name || '링크'} link={profile?.link_url || undefined} />
      <PostShelves />
      <SwitchProfileModal
        open={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        profiles={profile ? [profile, ...restProfiles] : restProfiles}
        currentProfileId={profile?.id}
        onSwitch={(profileId) => user?.id && switchProfile(user.id, profileId)}
        onCreateNew={() => setIsCreateModalOpen(true)}
      />
      <CreateProfileModal open={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </Screen>
  )
}
