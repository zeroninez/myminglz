'use client'

const MAX_LENGTH = 2000

interface StepContentProps {
  content: string
  onChange: (content: string) => void
}

export function StepContent({ content, onChange }: StepContentProps) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="무슨 일이 있었나요?"
          rows={8}
          className="w-full bg-transparent text-white placeholder-gray-600 text-base leading-relaxed resize-none outline-none"
          autoFocus
        />
        <div className="text-right text-gray-600 text-xs mt-1">
          {content.length} / {MAX_LENGTH}
        </div>
      </div>
    </div>
  )
}
