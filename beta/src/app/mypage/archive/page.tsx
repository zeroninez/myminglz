// mypages/archive/page.tsx
'use client'

import classNames from 'classnames'
import { Screen } from '@/components'
import { useRouter } from 'next/navigation'
import { NavBarHeight } from '@/constants/sizeguide'

export default function Page() {
  const router = useRouter()

  return (
    <Screen
      className={classNames(``)}
      header={{
        title: 'archive',
        left: {
          icon: 'left',
          onClick: () => router.back(),
        },
        right: {
          icon: 'search',
          onClick: () => alert('검색 버튼을 눌렀습니다!'),
        },
      }}
    >
      <div
        style={{
          paddingBottom: `${NavBarHeight + 16}px`,
        }}
        className='w-full h-fit grid grid-cols-3 gap-1 px-4'
      >
        {[...Array(30)].map((_, index) => (
          <div key={index} className='w-full h-fit flex flex-col justify-center items-center gap-1.5 pb-3'>
            <div key={index} className='w-full aspect-post flex justify-center items-center '>
              asdteroider
            </div>
            <div className='max-w-[84px] w-fit h-fit flex flex-col justify-center items-center gap-0.5 bg-white/10 rounded-full px-5 py-1'>
              <span className='w-fit text-center text-sm font-normal leading-[1.1]'>Title {index + 1}</span>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  )
}
