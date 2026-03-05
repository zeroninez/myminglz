'use client'

import { Toaster } from 'react-hot-toast'
import { NavBar } from './NavBar'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export const Layout = ({ children }) => {
  const pathname = usePathname()
  const { user } = useAuthStore()

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
        <Toaster />
        {user && pathname !== '/' && !pathname.includes('/auth') && <NavBar />}
      </div>
    </>
  )
}
