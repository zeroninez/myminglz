'use client'

import { useEffect, PropsWithChildren } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'

export default function AuthProvider({ children }: PropsWithChildren) {
  const { setUser, setSession, setIsLoading } = useAuthStore()

  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    initializeAuth()

    // 인증 상태 변화 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setSession, setIsLoading])

  return <>{children}</>
}
