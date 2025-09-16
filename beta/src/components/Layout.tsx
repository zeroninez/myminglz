'use client'

import { useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import { NavBar } from './NavBar'
import { motion } from 'framer-motion'

export const Layout = ({ children }) => {
  const ref = useRef(null)

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        ref={ref}
        style={{
          position: 'relative',
          width: ' 100%',
          height: '100%',
          touchAction: 'auto',
        }}
      >
        {children}
        <Toaster />
        <NavBar />
      </motion.div>
    </>
  )
}
