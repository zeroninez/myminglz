'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Sheet } from 'react-modal-sheet'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { createClient } from '@/lib/supabase'
import { useProfileStore } from '@/stores/profileStore'
import { Icon } from '@/components/Icon'

interface CommentWithProfile {
  id: string
  content: string
  created_at: string
  profiles: { username: string; display_name: string; profile_image: string | null } | null
}

interface PostDetail {
  id: string
  profile_id: string
  content: string
  location_name: string | null
  visibility: string
  created_at: string
  profiles: { username: string; display_name: string; profile_image: string | null } | null
  post_images: { url: string; order_index: number }[]
  post_likes: { profile_id: string }[]
  post_comments: CommentWithProfile[]
}

export function PostDetailSheet() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useProfileStore()

  const viewParam = searchParams.get('view')
  const isOpen = viewParam !== null

  // undefined = 아직 fetch 안 함, null = fetch 했지만 없음, PostDetail = 로드 완료
  const [post, setPost] = useState<PostDetail | null | undefined>(undefined)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const closeSheet = useCallback(() => {
    router.back()
  }, [router])

  useEffect(() => {
    if (!viewParam) {
      setPost(undefined)
      return
    }
    fetchPost(viewParam)
    recordView(viewParam)
  }, [viewParam]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchPost(postId: string) {
    setPost(undefined) // 로딩 상태로 초기화
    const supabase = createClient()

    // 1. 포스트 기본 정보
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('id, profile_id, content, location_name, visibility, created_at')
      .eq('id', postId)
      .single()

    if (postError || !postData) {
      console.error('[PostDetailSheet] post fetch error:', postError)
      setPost(null)
      return
    }

    // 2. 관련 데이터 병렬 조회 (profiles 중첩 쿼리 충돌 방지)
    const [{ data: authorData }, { data: imagesData }, { data: likesData }, { data: commentsData }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('username, display_name, profile_image')
          .eq('id', postData.profile_id)
          .single(),
        supabase.from('post_images').select('url, order_index').eq('post_id', postId).order('order_index'),
        supabase.from('post_likes').select('profile_id').eq('post_id', postId),
        supabase.from('post_comments').select('id, content, created_at, profile_id').eq('post_id', postId).order('created_at'),
      ])

    // 3. 댓글 작성자 프로필 일괄 조회
    const commentProfileIds = [...new Set((commentsData ?? []).map((c: any) => c.profile_id as string))]
    let commentProfiles: Record<string, any> = {}

    if (commentProfileIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, display_name, profile_image')
        .in('id', commentProfileIds)
      commentProfiles = Object.fromEntries((profilesData ?? []).map((p: any) => [p.id, p]))
    }

    const commentsWithProfiles: CommentWithProfile[] = (commentsData ?? []).map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      profiles: commentProfiles[c.profile_id] ?? null,
    }))

    const fullPost: PostDetail = {
      ...postData,
      profiles: authorData ?? null,
      post_images: imagesData ?? [],
      post_likes: likesData ?? [],
      post_comments: commentsWithProfiles,
    }

    setPost(fullPost)
    const likes = likesData ?? []
    setLikeCount(likes.length)
    if (profile) setIsLiked(likes.some((l: any) => l.profile_id === profile.id))
  }

  async function recordView(postId: string) {
    if (!profile) return
    const supabase = createClient()
    await supabase
      .from('post_views')
      .upsert(
        { post_id: postId, profile_id: profile.id, viewed_at: new Date().toISOString() },
        { onConflict: 'post_id,profile_id', ignoreDuplicates: true },
      )
  }

  async function toggleLike() {
    if (!profile || !viewParam) return
    const supabase = createClient()
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', viewParam).eq('profile_id', profile.id)
      setIsLiked(false)
      setLikeCount((c) => c - 1)
    } else {
      await supabase.from('post_likes').insert({ post_id: viewParam, profile_id: profile.id })
      setIsLiked(true)
      setLikeCount((c) => c + 1)
    }
  }

  async function submitComment() {
    if (!profile || !commentText.trim() || !viewParam) return
    setIsSubmittingComment(true)
    const supabase = createClient()
    const { error } = await supabase.from('post_comments').insert({
      post_id: viewParam,
      profile_id: profile.id,
      content: commentText.trim(),
    })
    if (!error) {
      setCommentText('')
      fetchPost(viewParam)
    }
    setIsSubmittingComment(false)
  }

  const images = post ? [...post.post_images].sort((a, b) => a.order_index - b.order_index) : []
  const comments = post
    ? [...post.post_comments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : []

  return (
    <Sheet isOpen={isOpen} onClose={closeSheet} detent="full-height" tweenConfig={{ ease: 'easeOut', duration: 0.2 }}>
      <Sheet.Backdrop onTap={closeSheet} />
      <Sheet.Container
        style={{
          backgroundColor: '#121212',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
        }}
      >
        <Sheet.Header disableDrag />

        <Sheet.Content disableDrag style={{ paddingBottom: 0 }}>
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 pb-3">
            <button onClick={closeSheet} className="text-white active:text-gray-400 min-w-[40px]">
              <Icon icon="left" size={20} motion={false} />
            </button>
            <span className="text-white text-base font-medium">포스트</span>
            <div className="min-w-[40px]" />
          </div>

          {/* 스크롤 컨텐츠 */}
          <div className="flex-1 overflow-y-auto pb-safe-offset-6">
            {/* 로딩 (post === undefined = 아직 fetch 안 됨) */}
            {post === undefined && (
              <div className="flex items-center justify-center h-64 text-gray-600 text-sm">불러오는 중...</div>
            )}

            {/* 찾을 수 없음 (post === null = fetch 완료지만 없음) */}
            {post === null && (
              <div className="flex items-center justify-center h-64 text-gray-600 text-sm">
                포스트를 찾을 수 없어요.
              </div>
            )}

            {/* 포스트 내용 */}
            {post && (
              <>
                {images.length > 0 && (
                  <div className="relative">
                    <Swiper slidesPerView={1} className="w-full aspect-square">
                      {images.map((img, i) => (
                        <SwiperSlide key={i}>
                          <img src={img.url} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover" />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    {images.length > 1 && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs z-10">
                        1 / {images.length}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-4 px-4 py-4">
                  {/* 작성자 */}
                  <div className="flex items-center gap-2">
                    {post.profiles?.profile_image ? (
                      <img src={post.profiles.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-800" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{post.profiles?.display_name}</p>
                      <p className="text-gray-500 text-xs">@{post.profiles?.username}</p>
                    </div>
                  </div>

                  {post.content && <p className="text-white text-sm leading-relaxed">{post.content}</p>}
                  {post.location_name && <p className="text-gray-500 text-xs">📍 {post.location_name}</p>}

                  {/* 좋아요 + 날짜 */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={toggleLike}
                      className="flex items-center gap-1.5 active:scale-90 transition-transform"
                    >
                      <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
                      <span className="text-gray-400 text-sm">{likeCount}</span>
                    </button>
                    <span className="text-gray-600 text-xs">
                      {new Date(post.created_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* 댓글 */}
                  {comments.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-900 pt-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          {comment.profiles?.profile_image ? (
                            <img
                              src={comment.profiles.profile_image}
                              alt=""
                              className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gray-800 flex-shrink-0" />
                          )}
                          <div>
                            <span className="text-white text-xs font-semibold mr-2">{comment.profiles?.username}</span>
                            <span className="text-gray-300 text-xs">{comment.content}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 댓글 입력 */}
                  {profile && (
                    <div className="flex items-center gap-2 border-t border-gray-900 pt-4">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="댓글 달기..."
                        className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                      />
                      <button
                        onClick={submitComment}
                        disabled={!commentText.trim() || isSubmittingComment}
                        className="text-primary-400 text-sm font-semibold disabled:text-gray-700"
                      >
                        게시
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
    </Sheet>
  )
}
