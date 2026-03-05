'use client'
import classNames from 'classnames'
import { Icon } from './Icon'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { NavBarHeight } from '@/constants/sizeguide'

export const NavBar = () => {
  const pathname = usePathname()
  const navItems = [
    { label: '맵', icon: 'map', link: '/map' },
    { label: '피드', icon: 'feed', link: '/feed' },
    { label: '발행', icon: 'add', link: '/post' },
    { label: '마이', icon: 'profile', link: '/mypage' },
  ]

  return (
    <div
      className={classNames(
        // NavBar container
        `fixed bottom-0 z-40 inset-x-0 h-[${NavBarHeight}px] max-w-lg mx-auto`,
        `flex flex-row justify-center items-center`,
        `bg-navbar rounded-t-xl`,
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.link}
          className={classNames(
            // NavBar item
            'flex flex-col justify-center items-center',
            pathname === item.link ? 'text-white' : 'text-dim-text',
            'flex-1 pt-4 pb-4',
          )}
        >
          <div className='flex flex-col justify-center items-center gap-1'>
            <Icon icon={item.icon} size={24} />
            <span className='text-xs'>{item.label}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
