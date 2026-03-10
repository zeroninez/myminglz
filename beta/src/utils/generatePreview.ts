import { CropArea, ImageFilter } from '@/types/post'

/** canvas에서 크롭 + 필터 적용한 data URL 생성 (미리보기용) */
export async function generatePreview(src: string, cropArea: CropArea, filter: ImageFilter): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 400
      const scale = Math.min(maxSize / cropArea.width, maxSize / cropArea.height, 1)
      canvas.width = Math.round(cropArea.width * scale)
      canvas.height = Math.round(cropArea.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.filter = `brightness(${filter.brightness}%) contrast(${filter.contrast}%) saturate(${filter.saturation}%)`
      ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/webp', 0.8))
    }
    img.onerror = reject
    img.src = src
  })
}
