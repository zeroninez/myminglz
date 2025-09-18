// mypages/my-posts/page.tsx
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
        title: 'my posts',
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
            <div key={index} className='w-full aspect-post bg-card rounded-lg' />
            <div className='w-full h-fit flex flex-col justify-center items-center gap-0.5'>
              <span className='w-full text-center text-sm font-medium leading-[1.4]'>Post Title {index + 1}</span>
              <span className='w-full text-center text-[13px] font-normal leading-[1.2] opacity-60'>
                Post Title {index + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  )
}
