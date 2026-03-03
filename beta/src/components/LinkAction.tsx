'use client'

import { Icon } from '@/components'
import { active_classNames } from '@/theme'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'

interface LinkActionProps {
  mode: 'explore' | 'mypage'
  name: string
  link?: string
}

export const LinkAction = ({ mode, name, link }: LinkActionProps) => {
  const router = useRouter()

  if (mode === 'explore' && !link) {
    return null
  }

  return (
    <div
      className={classNames(
        'w-full bg-card h-fit px-4 py-5 rounded-2xl flex flex-row justify-between items-center gap-3',
      )}
    >
      {link ? (
        <span className='text-2xl font-semibold leading-tight opacity-90'>{name || '-'}</span>
      ) : (
        <span className='text-base font-semibold leading-tight opacity-90'>나의 링크를 등록해 보세요!</span>
      )}
      <button
        onClick={() => {
          if (link) {
            window.open(link, '_blank')
          } else {
            router.push('/mypage/settings')
          }
        }}
        className={classNames(
          'w-auto h-fit aspect-auto p-1 rounded-full bg-white text-black flex justify-center items-center',
          active_classNames,
        )}
      >
        {link ? <Icon icon='alias' size={24} /> : <Icon icon='plus' size={24} />}
      </button>
    </div>
  )
}
