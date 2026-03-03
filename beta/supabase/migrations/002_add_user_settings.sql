-- user_settings 테이블: 유저당 활성 프로필(active_profile_id) 저장
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. user_settings 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  active_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS 활성화
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책: 본인 설정만 조회 가능
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (auth.uid() = user_id);

-- 4. RLS 정책: 본인 설정만 생성 가능
CREATE POLICY "Users can insert their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. RLS 정책: 본인 설정만 수정 가능
CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (auth.uid() = user_id);

-- 6. updated_at 자동 업데이트 함수 (이미 존재하면 대체)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. updated_at 트리거
DROP TRIGGER IF EXISTS on_user_settings_updated ON public.user_settings;
CREATE TRIGGER on_user_settings_updated
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
