'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PostImageState } from '@/types/post'

interface SortableImageItemProps {
  image: PostImageState
  index: number
  onEdit: (id: string) => void
  onRemove: (id: string) => void
}

export function SortableImageItem({ image, index, onEdit, onRemove }: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    touchAction: 'none',
  }

  const displaySrc = image.previewSrc ?? image.src

  return (
    <div ref={setNodeRef} style={style} className="relative aspect-square select-none">
      {/* 드래그 핸들: 이미지 전체 */}
      <div {...attributes} {...listeners} className="w-full h-full cursor-grab active:cursor-grabbing">
        <img
          src={displaySrc}
          alt={`이미지 ${index + 1}`}
          className="w-full h-full object-cover rounded-xl"
          draggable={false}
        />
      </div>

      {/* 순서 뱃지 */}
      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">
        {index + 1}
      </div>

      {/* 삭제 버튼 */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(image.id)}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center active:bg-black"
      >
        ✕
      </button>

      {/* 편집 버튼 */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onEdit(image.id)}
        className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium active:bg-black"
      >
        편집
      </button>
    </div>
  )
}
