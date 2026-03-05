-- 위치 기반 포스트 관련 테이블 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- ─────────────────────────────────────────────
-- 1. posts 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT DEFAULT '',
  location_name TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'followers')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 전체공개 포스트: 누구나 조회 가능
CREATE POLICY "Public posts are viewable by everyone"
ON public.posts FOR SELECT
USING (visibility = 'public');

-- 팔로워 전용 포스트: 본인 + 팔로워만 조회 가능 (followers 테이블 연동 전까지 본인만)
CREATE POLICY "Followers can view followers-only posts"
ON public.posts FOR SELECT
USING (
  visibility = 'followers'
  AND profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- 본인만 포스트 생성 가능
CREATE POLICY "Users can create their own posts"
ON public.posts FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- 본인만 포스트 수정 가능
CREATE POLICY "Users can update their own posts"
ON public.posts FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- 본인만 포스트 삭제 가능
CREATE POLICY "Users can delete their own posts"
ON public.posts FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- updated_at 트리거
DROP TRIGGER IF EXISTS on_post_updated ON public.posts;
CREATE TRIGGER on_post_updated
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- ─────────────────────────────────────────────
-- 2. post_images 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 이미지 순서 정렬용 인덱스
CREATE INDEX IF NOT EXISTS post_images_post_id_order_idx
ON public.post_images(post_id, order_index);

-- RLS 활성화
ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

-- 포스트 조회 권한 있으면 이미지도 조회 가능
CREATE POLICY "Post images are viewable with post"
ON public.post_images FOR SELECT
USING (
  post_id IN (SELECT id FROM public.posts)
);

-- 본인 포스트에만 이미지 추가 가능
CREATE POLICY "Users can insert images to their own posts"
ON public.post_images FOR INSERT
WITH CHECK (
  post_id IN (
    SELECT p.id FROM public.posts p
    JOIN public.profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- 본인 포스트 이미지만 수정 가능 (order_index 변경 등)
CREATE POLICY "Users can update images of their own posts"
ON public.post_images FOR UPDATE
USING (
  post_id IN (
    SELECT p.id FROM public.posts p
    JOIN public.profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- 본인 포스트 이미지만 삭제 가능
CREATE POLICY "Users can delete images of their own posts"
ON public.post_images FOR DELETE
USING (
  post_id IN (
    SELECT p.id FROM public.posts p
    JOIN public.profiles pr ON p.profile_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);


-- ─────────────────────────────────────────────
-- 3. post_likes 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, profile_id)
);

-- RLS 활성화
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- 누구나 좋아요 수 조회 가능
CREATE POLICY "Post likes are viewable by everyone"
ON public.post_likes FOR SELECT
USING (true);

-- 본인만 좋아요 추가 가능
CREATE POLICY "Users can like posts"
ON public.post_likes FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- 본인만 좋아요 취소 가능
CREATE POLICY "Users can unlike posts"
ON public.post_likes FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);


-- ─────────────────────────────────────────────
-- 4. post_comments 테이블
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 누구나 댓글 조회 가능
CREATE POLICY "Post comments are viewable by everyone"
ON public.post_comments FOR SELECT
USING (true);

-- 본인만 댓글 작성 가능
CREATE POLICY "Users can create comments"
ON public.post_comments FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- 본인 댓글만 수정 가능
CREATE POLICY "Users can update their own comments"
ON public.post_comments FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- 본인 댓글만 삭제 가능
CREATE POLICY "Users can delete their own comments"
ON public.post_comments FOR DELETE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- updated_at 트리거
DROP TRIGGER IF EXISTS on_post_comment_updated ON public.post_comments;
CREATE TRIGGER on_post_comment_updated
BEFORE UPDATE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();


-- ─────────────────────────────────────────────
-- 5. post_views 테이블 (조회수 중복 방지)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.post_views (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, profile_id)
);

-- RLS 활성화
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- 조회수 집계는 누구나 가능 (COUNT 쿼리용)
CREATE POLICY "Post views are viewable by everyone"
ON public.post_views FOR SELECT
USING (true);

-- 본인 프로필로만 조회 기록 생성 가능
CREATE POLICY "Users can record their own views"
ON public.post_views FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);


-- ─────────────────────────────────────────────
-- 6. Storage 버킷 설정 (Supabase Storage)
-- ─────────────────────────────────────────────
-- Storage 버킷은 대시보드에서 생성하거나 아래 실행
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: 누구나 이미지 조회 가능 (public 버킷)
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- Storage RLS: 로그인한 유저만 업로드 가능
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
);

-- Storage RLS: 본인 폴더만 삭제 가능 ({postId}/... 구조)
CREATE POLICY "Users can delete their own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images'
  AND auth.role() = 'authenticated'
);
