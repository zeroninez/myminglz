'use client'

import { Sheet } from 'react-modal-sheet'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import { useProfileStore } from '@/stores/profileStore'
import { Icon } from '@/components/Icon'
import { usePostDetail } from '../../hooks/usePostDetail'

export function PostDetailSheet() {
  const { profile } = useProfileStore()
  const {
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
  } = usePostDetail()

  return (
    <Sheet isOpen={isOpen} onClose={closeSheet} detent="full" tweenConfig={{ ease: 'easeOut', duration: 0.2 }}>
      <Sheet.Container
        style={{
          backgroundColor: '#121212',
        }}
      >
        <Sheet.Header />

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
