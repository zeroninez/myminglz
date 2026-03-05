-- posts 테이블에 만료 시간 추가
-- 기본값: 생성 후 24시간

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours');

-- 기존 포스트: created_at + 24시간으로 소급 적용 (이미 지난 건 마이그레이션 시점 + 24h 유지)
UPDATE public.posts
SET expires_at = GREATEST(created_at + INTERVAL '24 hours', NOW() + INTERVAL '1 hour')
WHERE expires_at = (NOW() + INTERVAL '24 hours');

-- 만료 시간 인덱스 (빠른 필터링용)
CREATE INDEX IF NOT EXISTS posts_expires_at_idx ON public.posts(expires_at);

-- 기존 RLS SELECT 정책 교체 (만료된 포스트 제외)
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.posts;
CREATE POLICY "Public posts are viewable by everyone"
ON public.posts FOR SELECT
USING (visibility = 'public' AND expires_at > NOW());

DROP POLICY IF EXISTS "Followers can view followers-only posts" ON public.posts;
CREATE POLICY "Followers can view followers-only posts"
ON public.posts FOR SELECT
USING (
  visibility = 'followers'
  AND expires_at > NOW()
  AND profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);
