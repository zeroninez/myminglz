-- Supabase profiles 테이블 생성 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. profiles 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. username 유효성 검사 (영어, 숫자, 언더스코어만 허용, 3-20자)
ALTER TABLE public.profiles
ADD CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,20}$');

-- 3. display_name 길이 제한 (1-30자)
ALTER TABLE public.profiles
ADD CONSTRAINT display_name_length CHECK (char_length(display_name) BETWEEN 1 AND 30);

-- 4. bio 길이 제한 (최대 150자)
ALTER TABLE public.profiles
ADD CONSTRAINT bio_length CHECK (char_length(bio) <= 150);

-- 5. RLS (Row Level Security) 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책: 누구나 프로필 조회 가능
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- 7. RLS 정책: 본인만 프로필 생성 가능
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 8. RLS 정책: 본인만 프로필 수정 가능
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 9. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. updated_at 트리거
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 11. username 중복 체크 함수 (클라이언트에서 호출용)
CREATE OR REPLACE FUNCTION public.check_username_available(check_username TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = check_username
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
