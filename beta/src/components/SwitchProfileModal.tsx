'use client'

import { Sheet } from 'react-modal-sheet'
import { Icon } from '@/components'
import { Profile } from '@/types'
import classNames from 'classnames'

interface SwitchProfileModalProps {
  open: boolean
  onClose: () => void
  profiles: Profile[]
  currentProfileId?: string
  onSwitch: (profileId: string) => void
  onCreateNew: () => void
}

export const SwitchProfileModal = ({
  open,
  onClose,
  profiles,
  currentProfileId,
  onSwitch,
  onCreateNew,
}: SwitchProfileModalProps) => {
  const handleSwitch = (profileId: string) => {
    if (profileId === currentProfileId) return
    onSwitch(profileId)
    onClose()
  }

  const handleCreateNew = () => {
    onClose()
    onCreateNew()
  }

  return (
    <Sheet isOpen={open} onClose={onClose} detent='content-height'>
      <Sheet.Container style={{ backgroundColor: '#1a1a1a' }}>
        <Sheet.Header />
        <Sheet.Content disableDrag>
          {/* 헤더 */}
          <div className='w-full flex flex-row justify-between items-center px-6 pt-2 pb-4'>
            <h2 className='text-lg font-semibold text-white'>프로필 전환</h2>
            <button onClick={onClose} className='p-2'>
              <Icon icon='close' size={20} />
            </button>
          </div>

          {/* 프로필 목록 */}
          <div className='w-full flex flex-col gap-2 px-6 pb-4'>
            {profiles.map((p) => {
              const isActive = p.id === currentProfileId
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitch(p.id)}
                  disabled={isActive}
                  className={classNames(
                    'w-full flex flex-row items-center gap-4 p-4 rounded-2xl transition-colors duration-150',
                    isActive
                      ? 'bg-white/10 border border-primary cursor-default'
                      : 'bg-gray-800 border border-gray-700 active:scale-95 active:bg-gray-700 transition-transform',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.profile_image ?? '/img/sample/profile.png'}
                    alt={p.username}
                    className='w-12 h-12 rounded-full object-cover bg-gray-700 shrink-0'
                  />
                  <div className='flex flex-col items-start gap-0.5 min-w-0 flex-1'>
                    <span className='text-base font-semibold text-white truncate'>{p.display_name}</span>
                    <span className='text-sm text-gray-400 truncate'>@{p.username}</span>
                  </div>
                  {isActive && (
                    <span className='text-xs text-primary font-medium shrink-0'>현재 프로필</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* 새 프로필 추가 */}
          <div className='w-full px-6 pb-10'>
            <button
              onClick={handleCreateNew}
              className='w-full flex flex-row items-center gap-4 p-4 rounded-2xl border border-dashed border-gray-600 active:scale-95 transition-transform'
            >
              <div className='w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0'>
                <Icon icon='plus' size={20} />
              </div>
              <span className='text-sm text-gray-400'>새 프로필 추가</span>
            </button>
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onClose} />
    </Sheet>
  )
}
