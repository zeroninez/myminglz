'use client'

import { useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { SortableImageItem } from './SortableImageItem'
import { ImageEditModal } from './ImageEditModal'
import { PostImageState, CropArea, ImageFilter, DEFAULT_FILTER } from '@/types/post'

const MAX_IMAGES = 10

interface StepImageSelectProps {
  images: PostImageState[]
  onChange: (images: PostImageState[]) => void
}

function getInitialCropArea(file: File): Promise<CropArea> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      resolve({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

export function StepImageSelect({ images, onChange }: StepImageSelectProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_IMAGES - images.length
    const toAdd = Array.from(files).slice(0, remaining)

    const newImages: PostImageState[] = await Promise.all(
      toAdd.map(async (file) => {
        const src = URL.createObjectURL(file)
        const cropArea = await getInitialCropArea(file)
        return {
          id: crypto.randomUUID(),
          src,
          file,
          cropArea,
          filter: { ...DEFAULT_FILTER },
        }
      }),
    )

    onChange([...images, ...newImages])
  }

  const handleRemove = (id: string) => {
    const target = images.find((img) => img.id === id)
    if (target) URL.revokeObjectURL(target.src)
    onChange(images.filter((img) => img.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex((img) => img.id === active.id)
    const newIndex = images.findIndex((img) => img.id === over.id)
    onChange(arrayMove(images, oldIndex, newIndex))
  }

  const handleEditConfirm = (id: string, cropArea: CropArea, filter: ImageFilter, previewSrc: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, cropArea, filter, previewSrc } : img)))
    setEditingId(null)
  }

  const editingImage = images.find((img) => img.id === editingId)

  return (
    <>
      <div className="flex flex-col gap-4 px-4 pt-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <SortableImageItem
                  key={img.id}
                  image={img}
                  index={index}
                  onEdit={setEditingId}
                  onRemove={handleRemove}
                />
              ))}

              {/* 이미지 추가 버튼 */}
              {images.length < MAX_IMAGES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-1 active:border-gray-400"
                >
                  <span className="text-gray-400 text-2xl leading-none">+</span>
                  <span className="text-gray-500 text-[10px]">{images.length}/{MAX_IMAGES}</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {images.length === 0 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-16 rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center gap-2 active:border-gray-500"
          >
            <span className="text-4xl">🖼️</span>
            <span className="text-gray-400 text-sm">사진을 선택하세요</span>
            <span className="text-gray-600 text-xs">최대 {MAX_IMAGES}장</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => ((e.target as HTMLInputElement).value = '')}
      />

      {editingImage && (
        <ImageEditModal
          src={editingImage.src}
          initialCropArea={editingImage.cropArea}
          initialFilter={editingImage.filter}
          onConfirm={(cropArea, filter, previewSrc) => handleEditConfirm(editingImage.id, cropArea, filter, previewSrc)}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  )
}
