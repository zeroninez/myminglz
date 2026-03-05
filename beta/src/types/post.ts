import { CropArea, ImageFilter, DEFAULT_FILTER } from '@/lib/uploadPostImages'

export type { CropArea, ImageFilter }
export { DEFAULT_FILTER }

export interface PostImageState {
  id: string              // DnD 추적용 로컬 UUID
  src: string             // object URL (File에서 생성)
  file: File
  cropArea: CropArea      // 크롭 영역 (픽셀 기준, 자연 크기)
  filter: ImageFilter     // 필터 값
  previewSrc?: string     // 편집 후 썸네일 data URL
}

export interface PostLocation {
  name: string            // 주소 텍스트
  lat: number
  lng: number
}

export type PostVisibility = 'public' | 'followers'

export interface PostFormState {
  images: PostImageState[]
  content: string
  location: PostLocation | null
  visibility: PostVisibility
  durationHours: number
}
