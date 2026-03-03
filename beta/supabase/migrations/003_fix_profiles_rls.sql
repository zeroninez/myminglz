-- profiles 테이블 RLS 정책 수정
-- 멀티프로필 지원 후 id가 랜덤 UUID로 변경됨 → user_id 컬럼으로 정책 수정
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 기존 정책 삭제 (id 컬럼 기반 → 멀티프로필에서 잘못된 동작)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. INSERT 정책: user_id로 본인 확인
CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE 정책: user_id로 본인 확인
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- 4. DELETE 정책 추가 (기존에 없었음 → 삭제 불가 원인)
CREATE POLICY "Users can delete their own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = user_id);
