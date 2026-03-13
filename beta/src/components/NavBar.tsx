'use client'

import classNames from 'classnames'
import { Icon } from './Icon'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { NavBarHeight } from '@/constants/sizeguide'
import { fbtn_classNames } from '@/theme'
import { useAuthStore } from '@/stores/authStore'

const NAV_ITEMS_LEFT = [
  { label: '맵', icon: 'map', link: '/map' },
  { label: '피드', icon: 'feed', link: '/feed' },
]

const NAV_ITEMS_RIGHT = [{ label: '마이', icon: 'profile', link: '/mypage' }]

export const NavBar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const isGuest = !user
  const isPostOpen = searchParams.get('post') !== null

  const handlePostOpen = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('post', '1')
    router.push(`${pathname}?${params}`, { scroll: false })
  }

  return (
    <div
      style={{
        height: NavBarHeight,
      }}
      className={classNames(
        `fixed bottom-0 z-40 inset-x-0 w-full max-w-lg mx-auto`,
        `flex flex-col justify-start items-center px-3`,
      )}
    >
      <div
        className={classNames(
          'flex flex-row justify-center items-center',
          fbtn_classNames,
          'rounded-2xl',
          'w-full h-fit',
        )}
      >
        {isGuest ? (
          <>
            {/* Guest 모드: 맵 아이콘 + 로그인 버튼 */}
            <Link
              href='/map'
              className={classNames(
                'flex flex-col justify-center items-center',
                'text-white',
                'flex-1 px-3 py-2.5',
              )}
            >
              <div className='flex flex-col justify-center items-center gap-1'>
                <Icon icon='map' size={24} />
                <span className='text-xs'>맵</span>
              </div>
            </Link>
            <Link
              href='/auth/login'
              className={classNames(
                'flex flex-col justify-center items-center',
                'text-white/50',
                'flex-1 px-3 py-2.5',
              )}
            >
              <div className='flex flex-col justify-center items-center gap-1'>
                <Icon icon='profile' size={24} />
                <span className='text-xs'>로그인</span>
              </div>
            </Link>
          </>
        ) : (
          <>
            {NAV_ITEMS_LEFT.map((item) => (
              <Link
                key={item.label}
                href={item.link}
                className={classNames(
                  'flex flex-col justify-center items-center',
                  pathname === item.link && !isPostOpen ? 'text-white' : 'text-white/50',
                  'flex-1 px-3 py-2.5',
                )}
              >
                <div className='flex flex-col justify-center items-center gap-1'>
                  <Icon icon={item.icon} size={24} />
                  <span className='text-xs'>{item.label}</span>
                </div>
              </Link>
            ))}

            {/* 발행 버튼 — URL 쿼리로 PostCreateSheet 오픈 */}
            <button
              onClick={handlePostOpen}
              className={classNames(
                'flex flex-col justify-center items-center',
                isPostOpen ? 'text-white' : 'text-white/50',
                'flex-1 px-3 py-2.5',
              )}
            >
              <div className='flex flex-col justify-center items-center gap-1'>
                <Icon icon='add' size={24} />
                <span className='text-xs'>발행</span>
              </div>
            </button>

            {NAV_ITEMS_RIGHT.map((item) => (
              <Link
                key={item.label}
                href={item.link}
                className={classNames(
                  'flex flex-col justify-center items-center',
                  pathname === item.link && !isPostOpen ? 'text-white' : 'text-white/50',
                  'flex-1 px-3 py-2.5',
                )}
              >
                <div className='flex flex-col justify-center items-center gap-1'>
                  <Icon icon={item.icon} size={24} />
                  <span className='text-xs'>{item.label}</span>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
