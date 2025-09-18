import { Icon } from '@/components'
import classNames from 'classnames'

interface AliasButtonProps {
  text: string
  link?: string
}

export const AliasButton = ({ text, link }: AliasButtonProps) => {
  return (
    <div
      className={classNames(
        'w-full bg-card h-fit px-4 py-5 rounded-2xl flex flex-row justify-between items-start gap-3',
        'active:scale-95 transition-all duration-200 ease-in-out',
      )}
    >
      <span className='text-2xl font-semibold leading-tight opacity-90'>{text}</span>
      <button
        onClick={() => {
          if (link) {
            window.open(link, '_blank')
          }
        }}
        className='w-auto h-fit aspect-auto p-1 rounded-full bg-white text-black flex justify-center items-center active:scale-95 transition'
      >
        <Icon icon='alias' size={24} />
      </button>
    </div>
  )
}
