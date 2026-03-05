'use client'

import classNames from 'classnames'
import { Icon } from './Icon'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { NavBarHeight } from '@/constants/sizeguide'

const NAV_ITEMS_LEFT = [
  { label: '맵', icon: 'map', link: '/map' },
  { label: '피드', icon: 'feed', link: '/feed' },
]

const NAV_ITEMS_RIGHT = [
  { label: '마이', icon: 'profile', link: '/mypage' },
]

export const NavBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const isPostOpen = searchParams.get('post') !== null

  const handlePostOpen = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('post', '1')
    router.push(`${pathname}?${params}`, { scroll: false })
  }

  return (
    <div
      className={classNames(
        `fixed bottom-0 z-40 inset-x-0 h-[${NavBarHeight}px] max-w-lg mx-auto`,
        `flex flex-row justify-center items-center`,
        `bg-navbar rounded-t-xl`,
      )}
    >
      {NAV_ITEMS_LEFT.map((item) => (
        <Link
          key={item.label}
          href={item.link}
          className={classNames(
            'flex flex-col justify-center items-center',
            pathname === item.link && !isPostOpen ? 'text-white' : 'text-dim-text',
            'flex-1 pt-4 pb-4',
          )}
        >
          <div className="flex flex-col justify-center items-center gap-1">
            <Icon icon={item.icon} size={24} />
            <span className="text-xs">{item.label}</span>
          </div>
        </Link>
      ))}

      {/* 발행 버튼 — URL 쿼리로 PostCreateSheet 오픈 */}
      <button
        onClick={handlePostOpen}
        className={classNames(
          'flex flex-col justify-center items-center',
          isPostOpen ? 'text-white' : 'text-dim-text',
          'flex-1 pt-4 pb-4',
        )}
      >
        <div className="flex flex-col justify-center items-center gap-1">
          <Icon icon="add" size={24} />
          <span className="text-xs">발행</span>
        </div>
      </button>

      {NAV_ITEMS_RIGHT.map((item) => (
        <Link
          key={item.label}
          href={item.link}
          className={classNames(
            'flex flex-col justify-center items-center',
            pathname === item.link && !isPostOpen ? 'text-white' : 'text-dim-text',
            'flex-1 pt-4 pb-4',
          )}
        >
          <div className="flex flex-col justify-center items-center gap-1">
            <Icon icon={item.icon} size={24} />
            <span className="text-xs">{item.label}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
