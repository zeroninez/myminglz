'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useProfileStore } from '@/stores/profileStore'

export interface CommentWithProfile {
  id: string
  content: string
  created_at: string
  profiles: { username: string; display_name: string; profile_image: string | null } | null
}

export interface PostDetail {
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

export function usePostDetail() {
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

  const fetchPost = useCallback(
    async (postId: string) => {
      setPost(undefined)
      const supabase = createClient()

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('id, profile_id, content, location_name, visibility, created_at')
        .eq('id', postId)
        .single()

      if (postError || !postData) {
        setPost(null)
        return
      }

      const [{ data: authorData }, { data: imagesData }, { data: likesData }, { data: commentsData }] =
        await Promise.all([
          supabase.from('profiles').select('username, display_name, profile_image').eq('id', postData.profile_id).single(),
          supabase.from('post_images').select('url, order_index').eq('post_id', postId).order('order_index'),
          supabase.from('post_likes').select('profile_id').eq('post_id', postId),
          supabase.from('post_comments').select('id, content, created_at, profile_id').eq('post_id', postId).order('created_at'),
        ])

      const commentProfileIds = [...new Set((commentsData ?? []).map((c: any) => c.profile_id as string))]
      let commentProfiles: Record<string, any> = {}
      if (commentProfileIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, display_name, profile_image')
          .in('id', commentProfileIds)
        commentProfiles = Object.fromEntries((profilesData ?? []).map((p: any) => [p.id, p]))
      }

      const fullPost: PostDetail = {
        ...postData,
        profiles: authorData ?? null,
        post_images: imagesData ?? [],
        post_likes: likesData ?? [],
        post_comments: (commentsData ?? []).map((c: any) => ({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          profiles: commentProfiles[c.profile_id] ?? null,
        })),
      }

      setPost(fullPost)
      const likes = likesData ?? []
      setLikeCount(likes.length)
      if (profile) setIsLiked(likes.some((l: any) => l.profile_id === profile.id))
    },
    [profile],
  )

  const recordView = useCallback(
    async (postId: string) => {
      if (!profile) return
      const supabase = createClient()
      await supabase
        .from('post_views')
        .upsert(
          { post_id: postId, profile_id: profile.id, viewed_at: new Date().toISOString() },
          { onConflict: 'post_id,profile_id', ignoreDuplicates: true },
        )
    },
    [profile],
  )

  useEffect(() => {
    if (!viewParam) {
      setPost(undefined)
      return
    }
    fetchPost(viewParam)
    recordView(viewParam)
  }, [viewParam]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLike = useCallback(async () => {
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
  }, [profile, viewParam, isLiked])

  const submitComment = useCallback(async () => {
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
  }, [profile, commentText, viewParam, fetchPost])

  const images = post ? [...post.post_images].sort((a, b) => a.order_index - b.order_index) : []
  const comments = post
    ? [...post.post_comments].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : []

  return {
    isOpen,
    post,
    images,
    comments,
    isLiked,
    likeCount,
    commentText,
    setCommentText,
    isSubmittingComment,
    closeSheet,
    toggleLike,
    submitComment,
  }
}
