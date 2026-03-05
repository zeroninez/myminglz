// lib/uploadPostImages.ts
import { createClient } from '@/lib/supabase'
import imageCompression from 'browser-image-compression'

const BUCKET = 'post-images'
const COMPRESSION_OPTIONS = {
  maxSizeMB: 2,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp',
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageFilter {
  brightness: number  // 0~200, default 100
  contrast: number    // 0~200, default 100
  saturation: number  // 0~200, default 100
}

export const DEFAULT_FILTER: ImageFilter = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
}

/** 크롭 + 필터를 canvas에서 처리해 WebP Blob으로 변환 */
export async function applyEditAndGetBlob(
  imageSrc: string,
  cropArea: CropArea,
  filter: ImageFilter,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = cropArea.width
      canvas.height = cropArea.height

      const ctx = canvas.getContext('2d')!

      // CSS filter를 canvas filter로 적용
      ctx.filter = [
        `brightness(${filter.brightness}%)`,
        `contrast(${filter.contrast}%)`,
        `saturate(${filter.saturation}%)`,
      ].join(' ')

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height,
      )

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('canvas toBlob 실패'))
        },
        'image/webp',
        0.9,
      )
    }
    img.onerror = () => reject(new Error('이미지 로드 실패'))
    img.src = imageSrc
  })
}

/** 단일 이미지 업로드 (편집 적용 후) */
export async function uploadSinglePostImage(
  postId: string,
  orderIndex: number,
  blob: Blob,
  token: string,
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const filePath = `${postId}/${orderIndex}.webp`
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${filePath}`

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/webp',
      'x-upsert': 'true',
    },
    body: blob,
  })

  if (!response.ok) {
    throw new Error(`업로드 실패: ${response.status}`)
  }

  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  return `${data.publicUrl}?t=${Date.now()}`
}

export interface PostImageInput {
  src: string         // 로컬 object URL 또는 data URL
  cropArea: CropArea
  filter: ImageFilter
  orderIndex: number
}

/** 포스트의 모든 이미지를 편집 적용 후 업로드, 각 URL 배열 반환 */
export async function uploadPostImages(
  postId: string,
  images: PostImageInput[],
  onProgress?: (current: number, total: number) => void,
): Promise<string[]> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const token = session?.access_token

  if (!token) throw new Error('로그인이 필요해요.')

  const urls: string[] = []

  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    onProgress?.(i, images.length)

    // 크롭 + 필터 적용 → Blob
    const blob = await applyEditAndGetBlob(img.src, img.cropArea, img.filter)

    // 압축
    const compressedFile = await imageCompression(
      new File([blob], `${img.orderIndex}.webp`, { type: 'image/webp' }),
      COMPRESSION_OPTIONS,
    )

    // 업로드
    const url = await uploadSinglePostImage(postId, img.orderIndex, compressedFile, token)
    urls.push(url)
  }

  onProgress?.(images.length, images.length)
  return urls
}

/** 포스트 이미지 전체 삭제 (포스트 삭제 시) */
export async function deletePostImages(postId: string, count: number): Promise<void> {
  const supabase = createClient()
  const paths = Array.from({ length: count }, (_, i) => `${postId}/${i}.webp`)
  await supabase.storage.from(BUCKET).remove(paths)
}
