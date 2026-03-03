'use client'

import { Icon } from '@/components'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import classNames from 'classnames'
import { Profile } from '@/types'
import { useFollowCount } from '@/hooks/useFollowCount'
import { useFollowList } from '@/hooks/useFollowList'
import { useFollow } from '@/hooks/useFollow'
import { useProfileStore } from '@/stores/profileStore'
import { active_classNames } from '@/theme'

interface ProfileCardProps {
  mode: 'explore' | 'mypage'
  profile?: Profile | null
  restProfiles?: Profile[]
  onOpenSwitchModal?: () => void
  onHandleMultiprofile?: () => void
}

export const ProfileCard = (props: ProfileCardProps) => {
  const { mode, profile, restProfiles = [], onOpenSwitchModal, onHandleMultiprofile } = props

  const { profile: currentProfile } = useProfileStore()
  const isOwnProfile = currentProfile?.id === profile?.id

  // 팔로우 기능
  const { isFollowing, isLoading: isFollowLoading, toggleFollow } = useFollow(profile?.id || '')
  const { followerCount, followingCount } = useFollowCount(profile?.id || '')
  const { list, isLoading: isFollowListLoading } = useFollowList(profile?.id || '', 'followers')

  const [isProfileImageModalOpen, setIsProfileImageModalOpen] = useState({
    open: false,
    image: '',
  })

  const handleClickImage = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    //이미지 클릭시 해당 이미지 확대 모달창 띄우기
    setIsProfileImageModalOpen({
      open: true,
      image: e.currentTarget.src,
    })
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className={classNames('w-full h-fit rounded-2xl bg-card flex flex-col justify-start items-center')}
      >
        {/* header */}
        <div className='w-full h-fit flex flex-row justify-between items-center px-4 py-4 gap-2'>
          {mode === 'mypage' ? (
            <div className='h-fit flex flex-row justify-start items-center gap-2'>
              {/* 클릭 시 프로필 전환 모달 오픈 */}
              <div
                onClick={onOpenSwitchModal}
                className={classNames('flex flex-row -space-x-2', active_classNames)}
              >
                {[profile, ...restProfiles].map((p, index, arr) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`profile-${p?.id}-${index}`}
                    src={p?.profile_image ? p.profile_image : '/img/sample/profile.png'}
                    alt={`profile-${p?.id}-${index}`}
                    style={{ zIndex: arr.length - index }}
                    className='w-10 h-10 bg-black rounded-full object-cover ring ring-1.5 ring-card shadow-xl'
                  />
                ))}
              </div>
              {/* 새 프로필 추가 */}
              <div
                onClick={onHandleMultiprofile}
                className={classNames(
                  'w-10 h-10 bg-white/10 flex justify-center items-center rounded-full',
                  active_classNames,
                )}
              >
                <Icon icon='plus' size={24} />
              </div>
            </div>
          ) : (
            <div className='h-fit flex flex-row justify-start items-center'>
              {/* 싱글 프로필 */}
              <img
                src={profile?.profile_image ? profile.profile_image : '/img/sample/profile.png'}
                alt={`profile-${profile?.id}`}
                className='w-10 h-10 bg-black rounded-full object-cover outline outline-1.5 outline-card shadow-xl'
              />
            </div>
          )}
          {/* 팔로우 버튼 (내 프로필이 아닐 때만) */}
          {!isOwnProfile && (
            <button
              onClick={toggleFollow}
              disabled={isFollowLoading}
              className={classNames(
                'w-fit px-4 h-10 rounded-2xl flex justify-center items-center text-sm font-semibold transition-colors duration-200',
                'active:scale-95 transition-transform',
                isFollowing ? 'bg-gray-800 text-white border border-gray-700' : 'bg-primary text-black',
                isFollowLoading && 'opacity-50 cursor-not-allowed',
              )}
            >
              {isFollowLoading ? '...' : isFollowing ? '언팔로우' : '팔로우'}
            </button>
          )}
        </div>
        {/* contents */}
        {/* top */}
        <div className='w-full h-full relative px-4 pb-4 flex flex-col justify-center items-center gap-4'>
          <div className=' w-full h-fit flex flex-col justify-start items-start gap-3'>
            <div className=' w-full h-fit'>
              <h1 className='text-3xl font-semibold leading-tight'>{profile?.username || 'unknown'}</h1>
            </div>
            <div className=' w-fit h-fit flex flex-row justify-start items-center gap-4'>
              <div className='w-fit h-fit flex flex-row text-sm leading-tight justify-start items-center gap-1'>
                <span className='opacity-80'>팔로워</span>
                <span className=''>{followerCount}</span>
              </div>
              <div className='w-fit h-fit flex flex-row text-sm leading-tight justify-start items-center gap-1'>
                <span className='opacity-80'>팔로잉</span>
                <span className=''>{followingCount}</span>
              </div>
            </div>
          </div>
          {/* middle */}
          <div className='w-full h-auto aspect-video flex justify-center items-center rounded-xl overflow-hidden relative'>
            {profile?.profile_image === null ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={'/img/sample/profile.png'}
                alt='sample.profile'
                className='absolute w-full h-full object-cover'
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                onClick={(e) => {
                  e.stopPropagation()
                  handleClickImage(e)
                }}
                src={profile?.profile_image || '/img/sample/profile.png'}
                alt='profile'
                className='absolute w-full h-full object-cover active:scale-95 transition-transform duration-200 ease-in-out'
              />
            )}
          </div>
          {/* bottom */}
          <div className='w-full h-fit flex flex-col justify-start items-start gap-2'>
            <div className='w-full h-fit text-xl font-semibold leading-tight'>
              {profile?.display_name || 'Unknown User'}
            </div>
            <div className='w-full h-fit text-base font-medium leading-tight'>{profile?.username || 'unknown'}</div>
            <p className='w-full h-fit text-sm font-normal leading-normal opacity-90'>{profile?.bio || ''}</p>
          </div>
        </div>
      </div>
      {/* profile image modal */}
      <AnimatePresence>
        {isProfileImageModalOpen.open && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='fixed inset-0 z-50 flex justify-center items-center bg-[#1A1A1A]/80 backdrop-blur-md'
          >
            <button
              onClick={() =>
                setIsProfileImageModalOpen({
                  open: false,
                  image: '',
                })
              }
              className='absolute top-0 right-0 p-4 text-white'
            >
              <Icon icon='close' size={20} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isProfileImageModalOpen.image}
              alt='profile enlarged'
              className='max-w-full max-h-full object-contain'
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
