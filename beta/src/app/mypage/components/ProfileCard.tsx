import { Icon } from '@/components'

interface ProfileCardProps {
  id: string
  follower: number
  following: number
  profileImage: string
  name: string
  subname: string
  description: string
}

export const ProfileCard = (props: ProfileCardProps) => {
  const { id, follower, following, profileImage, name, subname, description } = props
  return (
    <div className='w-full h-full rounded-2xl bg-card flex flex-col justify-start items-center'>
      {/* header */}
      <div className='w-full h-fit flex flex-row justify-between items-center px-4 py-4 '>
        <div className='h-fit flex flex-row justify-start items-center gap-2'>
          <div className='h-fit flex flex-row justify-start items-center -space-x-3'>
            <div className='w-10 h-10 bg-white outline outline-2 outline-card rounded-full z-10'></div>
            <div className='w-10 h-10 bg-white outline outline-2 outline-card rounded-full'></div>
          </div>
          <div className='w-10 h-10 bg-white/10 flex justify-center items-center rounded-full z-10'>
            <Icon icon='plus' size={24} />
          </div>
        </div>
        <button className='w-fit h-10'>
          <Icon icon='down' size={24} />
        </button>
      </div>
      {/* contents */}
      {/* top */}
      <div className='w-full h-full relative px-4 pb-4 flex flex-col justify-center items-center gap-4'>
        <div className=' w-full h-fit flex flex-col justify-start items-start gap-3'>
          <div className=' w-full h-fit'>
            <h1 className='text-3xl font-semibold leading-tight'>{id}</h1>
          </div>
          <div className=' w-fit h-fit flex flex-row justify-start items-center gap-4'>
            <div className='w-fit h-fit flex flex-row text-sm leading-tight justify-start items-center gap-1'>
              <span className='opacity-80'>팔로워</span>
              <span className=''>{follower}</span>
            </div>
            <div className='w-fit h-fit flex flex-row text-sm leading-tight justify-start items-center gap-1'>
              <span className='opacity-80'>팔로잉</span>
              <span className=''>{following}</span>
            </div>
          </div>
        </div>
        {/* middle */}
        <div className='w-full h-full'>
          <div className='w-full h-full rounded-2xl bg-white/10 outline outline-1 outline-card'></div>
        </div>
        {/* bottom */}
        <div className='w-full h-fit flex flex-col justify-start items-start gap-2'>
          <div className='w-full h-fit text-xl font-semibold leading-tight'>{name}</div>
          <div className='w-full h-fit text-base font-medium leading-tight'>{subname}</div>
          <p className='w-full h-fit text-sm font-normal leading-normal opacity-90'>{description}</p>
        </div>
      </div>
    </div>
  )
}
