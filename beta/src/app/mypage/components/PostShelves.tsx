import { Icon } from '@/components'
import classNames from 'classnames'

export const PostShelves = () => {
  return (
    <div className='w-full h-fit grid grid-cols-2 grid-rows-2 gap-1'>
      <Card title='my posts' icon='category' />
      <Card title='archive' icon='folder' />
      <Card title='activity' icon='user' />
      <Card title='saved posts' icon='bookmark' />
    </div>
  )
}

const Card = ({ icon, title }: { icon: string; title: string }) => {
  return (
    <div className={classNames('w-full h-auto aspect-square rounded-2xl bg-card p-4')}>
      <div className=' w-full flex flex-row justify-start items-center gap-1.5'>
        <Icon icon={icon} size={20} />
        <span className='font-medium'>{title}</span>
      </div>
    </div>
  )
}
