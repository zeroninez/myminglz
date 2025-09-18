'use client'

import classNames from 'classnames'
import { NavBar, Screen } from '@/components'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <Screen className={classNames(`bg-[#242424] flex flex-col justify-between items-center`)}>
      <span className='w-full text-center text-sm font-normal leading-[1.2] opacity-20 mt-4'>
        @beta {process.env.NEXT_PUBLIC_APP_VERSION}
      </span>
      <div className='w-full h-fit flex flex-col justify-center items-center gap-2 px-6'>
        <img src='/img/sample/profile.png' alt='logo' className='w-auto h-48' />
        <div className='w-full h-fit flex flex-col justify-center items-center gap-1'>
          <span className='w-full text-center text-primary text-4xl font-semibold leading-[1.4]'>myminglz</span>
          <p className='w-full text-center text-sm font-normal leading-[1.2] opacity-60'>
            걸어다니며 지역을 탐방하는 로컬 기반 SNS 플랫폼 안내서
          </p>
        </div>

        <button
          className='w-fit px-8 h-12 bg-primary rounded-full flex justify-center items-center mt-8 active:scale-95 transition-transform duration-200'
          onClick={() => router.push('/map')}
        >
          <span className='text-lg font-medium leading-[1.2] text-black'>Start Exploring</span>
        </button>
      </div>

      <div className='w-full h-fit py-8 text-center text-sm font-normal leading-[1.2] opacity-40'>© ZERONINEZ</div>
    </Screen>
  )
}
