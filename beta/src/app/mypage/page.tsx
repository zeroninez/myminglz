'use client'

import classNames from 'classnames'
import { Icon, NavBar, Screen } from '@/components'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <Screen className={classNames(``)}>
      <div className=' w-full h-fit flex flex-row justify-between items-end px-4 pt-4'>
        <div className='w-fit h-fit flex flex-row justify-center items-center gap-2'>
          <div className='w-6 h-6 rounded-full bg-yellow text-black flex justify-center items-center text-sm font-medium leading-none'>
            C
          </div>
          <span className='text-sm font-normal leading-none'>1,300</span>
        </div>
        <Icon icon='star' size={24} />
      </div>
      <div className='w-full h-full flex flex-col justify-start items-center px-2 py-4'>
        <ProfileCard />
      </div>
    </Screen>
  )
}
const ProfileCard = () => {
  return (
    <div className='w-full h-[70vh] rounded-2xl bg-card flex flex-col justify-start items-center'>
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
            <h1 className='text-3xl font-semibold leading-tight'>Zeroninez</h1>
          </div>
          <div className=' w-fit h-fit flex flex-row justify-start items-center gap-4'>
            <div className='w-full h-fit flex flex-row text-sm leading-tight justify-start items-center gap-1'>
              <span className='opacity-80'>팔로우</span>
              <span className=''>300</span>
            </div>
            <div className='w-full h-fit flex flex-row text-sm leading-tight justify-start items-center gap-1'>
              <span className='opacity-80'>팔로잉</span>
              <span className=''>300</span>
            </div>
          </div>
        </div>
        {/* middle */}
        <div className='w-full h-full'>
          <div className='w-full h-full rounded-2xl bg-white/10 outline outline-1 outline-card'></div>
        </div>
        {/* bottom */}
        <div className='w-full h-fit flex flex-col justify-start items-start gap-2'>
          <div className='w-full h-fit text-xl font-semibold leading-tight'>제로나인즈</div>
          <div className='w-full h-fit text-base font-medium leading-tight'>대표이사/PM</div>
          <p className='w-full h-fit text-sm font-normal leading-normal opacity-90'>
            아이디어 장전 완료🎯 | 서비스 기획러 | UX 탐험가 | IT 마법사 사람을 잇는 디자인, 경험을 만드는 기획 | IT &
            UX 설계자아아아아아아아아아아아아아아아입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
