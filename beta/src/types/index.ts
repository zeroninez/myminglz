export interface Profile {
  id: string
  user_id: string
  username: string
  display_name: string
  bio: string
  link_url: string | null
  link_name: string | null
  profile_image: string | null
  is_private: boolean
  created_at: string
  updated_at: string
}
