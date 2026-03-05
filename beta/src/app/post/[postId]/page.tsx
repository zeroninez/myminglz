'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

// 상세 페이지는 바텀시트(PostDetailSheet)로 이전됨
// 직접 URL 접근 시 /map?view=postId 로 리다이렉트
export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>()
  const router = useRouter()

  useEffect(() => {
    router.replace(`/map?view=${postId}`)
  }, [postId, router])

  return null
}
