import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const { username } = await request.json()

  if (!username) {
    return NextResponse.json({ error: '아이디를 입력해주세요' }, { status: 400 })
  }

  const supabase = await createServerClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: '해당 아이디로 등록된 계정이 없습니다' }, { status: 404 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const {
    data: { user },
    error: userError,
  } = await adminClient.auth.admin.getUserById(profile.user_id)

  if (userError || !user?.email) {
    return NextResponse.json({ error: '계정 정보를 가져올 수 없습니다' }, { status: 500 })
  }

  const [localPart, domain] = user.email.split('@')
  const maskedLocal = localPart.slice(0, 2) + '***'
  const maskedEmail = `${maskedLocal}@${domain}`

  return NextResponse.json({ maskedEmail })
}
