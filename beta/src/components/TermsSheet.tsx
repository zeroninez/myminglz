'use client'

import { useEffect, useState } from 'react'
import { Sheet } from 'react-modal-sheet'
import ReactMarkdown from 'react-markdown'
import { Icon } from '@/components'

interface TermsSheetProps {
  open: boolean
  onClose: () => void
  title: string
  contentPath: string
}

export const TermsSheet = ({ open, onClose, title, contentPath }: TermsSheetProps) => {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open || !contentPath) return
    setIsLoading(true)
    fetch(contentPath)
      .then((r) => r.text())
      .then(setContent)
      .finally(() => setIsLoading(false))
  }, [open, contentPath])

  return (
    <Sheet isOpen={open} onClose={onClose} detent='full-height'>
      <Sheet.Backdrop onTap={onClose} />
      <Sheet.Container
        style={{
          backgroundColor: '#242424',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          border: '1px solid #555',
          borderBottom: 'none',
        }}
      >
        <Sheet.Header />
        <Sheet.Content disableDrag>
          {/* <div className='w-full flex flex-row justify-between items-center px-6 pt-2 pb-3'>
            <h2 className='text-lg font-semibold text-white'>{title}</h2>
            <div className='flex items-center gap-2'>
              <button onClick={onClose} className='p-2'>
                <Icon icon='close' size={20} />
              </button>
            </div>
          </div> */}

          <div className='flex-1 w-full overflow-y-auto px-6 pb-12'>
            {isLoading ? (
              <div className='flex items-center justify-center py-20'>
                <div className='w-6 h-6 border-2 border-gray-600 border-t-primary rounded-full animate-spin' />
              </div>
            ) : (
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className='text-xl font-semibold text-white mb-4 mt-2'>{children}</h1>,
                  h2: ({ children }) => <h2 className='text-base font-semibold text-white mb-2 mt-5'>{children}</h2>,
                  h3: ({ children }) => <h3 className='text-sm font-semibold text-gray-200 mb-1 mt-4'>{children}</h3>,
                  p: ({ children }) => <p className='text-sm text-gray-400 leading-relaxed mb-1'>{children}</p>,
                  ul: ({ children }) => <ul className='list-disc list-inside mb-3 space-y-1'>{children}</ul>,
                  ol: ({ children }) => <ol className='list-decimal list-inside mb-3 space-y-1'>{children}</ol>,
                  li: ({ children }) => <li className='text-sm text-gray-400 leading-relaxed'>{children}</li>,
                  strong: ({ children }) => <strong className='text-gray-200'>{children}</strong>,
                  table: ({ children }) => <table className='w-full mb-3 border-collapse text-sm'>{children}</table>,
                  th: ({ children }) => (
                    <th className='text-left text-gray-300 font-semibold py-1 pr-4 border-b border-gray-700'>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className='text-gray-400 py-1 pr-4 border-b border-gray-800'>{children}</td>
                  ),
                  hr: () => <hr className='border-gray-700 my-4' />,
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop onTap={onClose} />
    </Sheet>
  )
}
