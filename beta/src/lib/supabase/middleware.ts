import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 공개 라우트 (로그인 불필요, 로그인 완료 시 /map으로 리다이렉트)
  const publicRoutes = ['/', '/auth/login', '/auth/signup']
  const isPublicRoute = publicRoutes.includes(pathname)

  // 인증 관련 라우트 (로그인 후 이메일 미확인 사용자용)
  const authRoutes = ['/auth/verify']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // 프로필 설정 라우트
  const profileSetupRoute = '/auth/onboarding'
  const isProfileSetupRoute = pathname.startsWith(profileSetupRoute)

  // 활성 프로필 선택 라우트
  const profileSelectRoute = '/auth/select-profile'
  const isProfileSelectRoute = pathname.startsWith(profileSelectRoute)

  // 보호된 라우트 (로그인 + 이메일 확인 + 프로필 필요)
  const protectedRoutes = ['/feed', '/post', '/mypage', '/profile']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // 1. 비로그인 사용자
  if (!user) {
    if (isProtectedRoute || isProfileSetupRoute || isProfileSelectRoute) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // 2. 로그인된 사용자 - 이메일 확인 체크
  const isEmailVerified = !!user.email_confirmed_at

  if (!isEmailVerified) {
    if (!isAuthRoute && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/verify', request.url))
    }
    return supabaseResponse
  }

  // 3. 프로필 존재 여부 체크
  const { data: profiles } = await supabase.from('profiles').select('id').eq('user_id', user.id).limit(1)
  const hasProfile = !!profiles && profiles.length > 0

  if (!hasProfile) {
    if (!isProfileSetupRoute && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url))
    }
    return supabaseResponse
  }

  // 4. 활성 프로필(user_settings) 존재 여부 체크
  // 테이블이 없거나 레코드가 없으면 data: null → select-profile로 이동
  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('active_profile_id')
    .eq('user_id', user.id)
    .maybeSingle()
  const hasActiveProfile = !!userSettings?.active_profile_id

  if (!hasActiveProfile) {
    if (!isProfileSelectRoute && !isPublicRoute && !isProfileSetupRoute) {
      return NextResponse.redirect(new URL('/auth/select-profile', request.url))
    }
    return supabaseResponse
  }

  // 5. 모든 조건 충족 - 인증/설정 라우트 접근 시 메인으로
  if (isPublicRoute || isAuthRoute || isProfileSetupRoute || isProfileSelectRoute) {
    return NextResponse.redirect(new URL('/map', request.url))
  }

  return supabaseResponse
}
