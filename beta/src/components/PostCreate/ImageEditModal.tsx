'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { CropArea, ImageFilter, DEFAULT_FILTER } from '@/types/post'

const ASPECT_RATIOS = [
  { label: '1:1', value: 1 },
  { label: '4:5', value: 4 / 5 },
  { label: '16:9', value: 16 / 9 },
  { label: '원본', value: 0 },
]

interface ImageEditModalProps {
  src: string
  initialCropArea: CropArea
  initialFilter: ImageFilter
  onConfirm: (cropArea: CropArea, filter: ImageFilter, previewSrc: string) => void
  onClose: () => void
}

/** canvas에서 크롭 + 필터 적용한 data URL 생성 (미리보기용) */
async function generatePreview(src: string, cropArea: CropArea, filter: ImageFilter): Promise<string> {
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

export function ImageEditModal({ src, initialCropArea, initialFilter, onConfirm, onClose }: ImageEditModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea>(initialCropArea)
  const [filter, setFilter] = useState<ImageFilter>(initialFilter)
  const [tab, setTab] = useState<'crop' | 'filter'>('crop')
  const [isConfirming, setIsConfirming] = useState(false)

  const onCropComplete = useCallback((_: unknown, pixelCrop: CropArea) => {
    setCroppedAreaPixels(pixelCrop)
  }, [])

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      const previewSrc = await generatePreview(src, croppedAreaPixels, filter)
      onConfirm(croppedAreaPixels, filter, previewSrc)
    } finally {
      setIsConfirming(false)
    }
  }

  const filterStyle = {
    filter: `brightness(${filter.brightness}%) contrast(${filter.contrast}%) saturate(${filter.saturation}%)`,
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 pt-safe-offset-4 pb-3">
        <button onClick={onClose} className="text-white text-sm active:text-gray-400">
          취소
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setTab('crop')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${tab === 'crop' ? 'bg-white text-black' : 'text-gray-400'}`}
          >
            크롭
          </button>
          <button
            onClick={() => setTab('filter')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${tab === 'filter' ? 'bg-white text-black' : 'text-gray-400'}`}
          >
            보정
          </button>
        </div>
        <button
          onClick={handleConfirm}
          disabled={isConfirming}
          className="text-white text-sm font-semibold active:text-gray-400 disabled:text-gray-600"
        >
          완료
        </button>
      </div>

      {/* 크롭 영역 */}
      {tab === 'crop' && (
        <>
          <div className="relative flex-1" style={filterStyle}>
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio || undefined}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { background: '#000' },
              }}
            />
          </div>

          {/* 비율 선택 */}
          <div className="flex justify-center gap-3 py-4 px-4 bg-black">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.label}
                onClick={() => setAspectRatio(r.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  aspectRatio === r.value ? 'bg-white text-black' : 'text-gray-400 border border-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* 줌 슬라이더 */}
          <div className="px-6 pb-safe-offset-4">
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
        </>
      )}

      {/* 필터/보정 탭 */}
      {tab === 'filter' && (
        <>
          {/* 미리보기 */}
          <div className="flex-1 flex items-center justify-center bg-black">
            <img src={src} alt="미리보기" className="max-h-full max-w-full object-contain" style={filterStyle} />
          </div>

          {/* 슬라이더 */}
          <div className="px-6 py-4 pb-safe-offset-4 bg-black space-y-4">
            {(
              [
                { key: 'brightness', label: '밝기', min: 50, max: 150 },
                { key: 'contrast', label: '대비', min: 50, max: 150 },
                { key: 'saturation', label: '채도', min: 0, max: 200 },
              ] as const
            ).map(({ key, label, min, max }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-white text-xs">{label}</span>
                  <button
                    onClick={() => setFilter((f) => ({ ...f, [key]: DEFAULT_FILTER[key] }))}
                    className="text-gray-500 text-xs active:text-white"
                  >
                    초기화
                  </button>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={filter[key]}
                  onChange={(e) => setFilter((f) => ({ ...f, [key]: Number(e.target.value) }))}
                  className="w-full accent-white"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
