'use client'

import { Icon } from '@/components'
import classNames from 'classnames'
import { useRouter } from 'next/navigation'

export const PostShelves = () => {
  return (
    <div className='w-full h-fit grid grid-cols-2 grid-rows-2 gap-1'>
      <Card title='my posts' path='my-posts' icon='category' />
      <Card title='archive' path='archive' icon='folder' />
      <Card title='activity' path='activity' icon='user' />
      <Card title='saved posts' path='saved-posts' icon='bookmark' />
    </div>
  )
}

const Card = ({ icon, title, path }: { icon: string; title: string; path: string }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/mypage/${path}`)
  }

  return (
    <section
      onClick={handleClick}
      className={classNames(
        'w-full h-auto flex flex-col justify-between items-start aspect-square rounded-2xl bg-card p-4',
        'active:scale-95 transition-all duration-200 ease-in-out',
      )}
    >
      <div className='w-full h-fit flex flex-row justify-start items-center gap-1.5'>
        <Icon icon={icon} size={20} />
        <span className='font-medium'>{title}</span>
      </div>
      <div className='h-fit flex flex-row justify-start items-center -space-x-3'>
        <div className='w-14 h-14 bg-[#1F211E] rounded-full'></div>
        <div className='w-14 h-14 bg-[#1F211E] rounded-full'></div>
        <div className='w-14 h-14 bg-[#F5F5F5] rounded-full flex justify-center items-center'>
          <span className='text-card/50 font-medium text-lg leading-none'>+3</span>
        </div>
      </div>
      <span className='text-sm font-normal opacity-80'>times</span>
    </section>
  )
}
