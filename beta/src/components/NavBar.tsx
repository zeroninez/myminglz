'use client'
import { useState } from 'react'
import classNames from 'classnames'
import { Icon } from './Icon'
import { useRouter, usePathname } from 'next/navigation'
import { NavBarHeight } from '@/constants/sizeguide'

export const NavBar = () => {
  const router = useRouter()
  const pathname = usePathname()
  const navItems = [
    { label: '맵', icon: 'map', link: '/map' },
    { label: '피드', icon: 'feed', link: '/feed' },
    { label: '발행', icon: 'add', link: '/post' },
    { label: '마이', icon: 'profile', link: '/mypage' },
  ]
  const [current, setCurrent] = useState(null)

  const handleNavClick = (label: string, link: string) => {
    setCurrent(label)
    router.push(link)
  }

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
        <div
          key={item.label}
          className={classNames(
            // NavBar item
            'flex flex-col justify-center items-center',
            current === item.label || pathname === item.link ? 'text-white' : 'text-dim-text',
            'flex-1 pt-4 pb-4',
          )}
          onClick={() => handleNavClick(item.label, item.link)}
        >
          <div className='flex flex-col justify-center items-center gap-1'>
            <Icon icon={item.icon} size={24} />
            <span className='text-xs'>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
