import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'
import toast from 'react-hot-toast'

interface ProfileState {
  profile: Profile | null
  isLoading: boolean
  setProfile: (profile: Profile | null) => void
  setIsLoading: (isLoading: boolean) => void
  fetchProfile: (userId: string) => Promise<Profile | null>
  fetchAllProfiles: (userId: string) => Promise<Profile[]>
  switchProfile: (userId: string, profileId: string) => Promise<void>
  createProfile: (
    userId: string,
    data: { username: string; display_name: string; bio?: string },
  ) => Promise<{ error: Error | null }>
  updateProfile: (
    profileId: string,
    data: { username?: string; display_name?: string; bio?: string; link_url?: string | null; link_name?: string | null },
  ) => Promise<{ error: Error | null }>
  checkUsernameAvailable: (username: string, currentUserId?: string) => Promise<boolean>
  refreshProfile: (userId: string) => Promise<void>
  deleteProfile: (profileId: string, userId: string) => Promise<{ error: Error | null }>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: true,

  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),

  fetchAllProfiles: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data ?? []
    } catch (error) {
      console.error('Error fetching all profiles:', error)
      return []
    }
  },

  switchProfile: async (userId, profileId) => {
    try {
      const { error: upsertError } = await supabase
        .from('user_settings')
        .upsert({ user_id: userId, active_profile_id: profileId })
      if (upsertError) throw upsertError

      const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single()
      if (error) throw error
      set({ profile: data })
      toast.success(`${data?.display_name} 프로필로 전환되었어요.`)
    } catch (error) {
      console.error('Error switching profile:', error)
      toast.error('프로필 전환에 실패했어요.')
    }
  },

  // userId = auth.users.id → user_settings.active_profile_id 우선, fallback: 가장 오래된 프로필
  fetchProfile: async (userId) => {
    try {
      set({ isLoading: true })

      // 1. user_settings에서 active_profile_id 조회
      const { data: settings } = await supabase
        .from('user_settings')
        .select('active_profile_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (settings?.active_profile_id) {
        // 2a. 저장된 활성 프로필 로드
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', settings.active_profile_id)
          .single()

        if (!error && data) {
          set({ profile: data, isLoading: false })
          return data
        }
        // active_profile_id가 유효하지 않으면 fallback으로 진행
      }

      // 2b. fallback: 가장 오래된 프로필
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 프로필 없음
          set({ profile: null, isLoading: false })
          return null
        }
        throw error
      }

      // 3. user_settings에 최초 활성 프로필 저장 (실패해도 프로필 로드에는 영향 없음)
      supabase
        .from('user_settings')
        .upsert({ user_id: userId, active_profile_id: data.id })
        .then(({ error }) => {
          if (error) console.warn('user_settings upsert skipped:', error.message)
        })

      set({ profile: data, isLoading: false })
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ profile: null, isLoading: false })
      return null
    }
  },

  // userId = auth.users.id → user_id 컬럼으로 삽입, id는 profiles.id에 DEFAULT가 없으므로 클라이언트에서 생성
  createProfile: async (userId, data) => {
    try {
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          username: data.username,
          display_name: data.display_name,
          bio: data.bio || '',
        })
        .select()
        .single()

      if (error) throw error

      set({ profile: newProfile, isLoading: false })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  // profileId = profiles.id (UUID) → eq('id', profileId)로 수정
  updateProfile: async (profileId, data) => {
    try {
      const updateData: Partial<Profile> = {}
      if (data.username !== undefined) updateData.username = data.username
      if (data.display_name !== undefined) updateData.display_name = data.display_name
      if (data.bio !== undefined) updateData.bio = data.bio
      if (data.link_url !== undefined) updateData.link_url = data.link_url
      if (data.link_name !== undefined) updateData.link_name = data.link_name

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId)
        .select()
        .single()

      if (error) throw error

      set({ profile: updatedProfile, isLoading: false })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  // user_id로 조회, 자기 자신 username인지는 user_id로 비교
  checkUsernameAvailable: async (username, currentUserId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('username', username)
        .maybeSingle()

      if (error) throw error

      // 데이터가 없으면 사용 가능
      if (!data) return true

      // 본인의 username이면 사용 가능 (user_id로 비교)
      if (currentUserId && data.user_id === currentUserId) return true

      return false
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  },

  // 현재 활성 프로필을 DB에서 다시 로드 (user_settings 존중)
  refreshProfile: async (userId: string) => {
    // fetchProfile과 동일한 로직으로 재조회 — oldest 프로필 고정 버그 방지
    await get().fetchProfile(userId)
  },

  // 프로필 삭제: 마지막 프로필은 삭제 불가 / Storage 이미지도 함께 제거
  deleteProfile: async (profileId: string, userId: string) => {
    try {
      // 마지막 프로필 여부 확인
      const all = await get().fetchAllProfiles(userId)
      if (all.length <= 1) {
        return { error: new Error('마지막 프로필은 삭제할 수 없습니다. 계정 탈퇴를 이용해주세요.') }
      }

      // Storage 이미지 삭제 (없어도 무시)
      await supabase.storage
        .from('profile-images')
        .remove([`${profileId}/avatar.webp`])
        .catch(() => {})

      // profiles 행 삭제 (FK ON DELETE SET NULL → user_settings 자동 처리)
      const { error } = await supabase.from('profiles').delete().eq('id', profileId)
      if (error) throw error

      set({ profile: null })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}))
