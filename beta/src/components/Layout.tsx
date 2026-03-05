'use client'

import { Toaster } from 'react-hot-toast'
import { NavBar } from './NavBar'
import { PostCreateSheet } from './PostCreate/PostCreateSheet'
import { PostDetailSheet } from './PostCreate/PostDetailSheet'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export const Layout = ({ children }) => {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const showNav = user && pathname !== '/' && !pathname.includes('/auth')

  return (
    <>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          touchAction: 'auto',
        }}
        className='shadow-lg outline outline-black/10 outline-1 bg-[#121212] flex flex-col'
      >
        {children}
        {showNav && <NavBar />}
        {showNav && <PostCreateSheet />}
        {showNav && <PostDetailSheet />}
      </div>
      <Toaster containerStyle={{ zIndex: 2147483647 }} />
    </>
  )
}
