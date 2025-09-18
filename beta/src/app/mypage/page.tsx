'use client'

import classNames from 'classnames'
import { Icon, NavBar, Screen } from '@/components'
import { useRouter } from 'next/navigation'
import { AliasButton, PostShelves, ProfileCard, StatusBar } from './_components'
import { NavBarHeight } from '@/constants/sizeguide'

export default function Page() {
  const router = useRouter()

  const DUMMY = {
    profile: {
      id: 'Zeroninez',
      credit: 1300,
      follower: 365,
      following: 234,
      profileImage: null,
      name: '제로나인즈',
      subname: '대표이사/PM',
      description: `아이디어 장전 완료🎯 | 서비스 기획러 | UX 탐험가 | IT 마법사 사람을 잇는 디자인, 경험을 만드는 기획 | IT & UX 설계자아아아아아아아아아아아아아아아입니다.`,
      link: 'https://myminglz.com',
    },
  }

  const MYPOSTS = [
    { id: 1, title: '첫 번째 글', content: '안녕하세요! 이것은 첫 번째 글입니다.' },
    { id: 2, title: '두 번째 글', content: '두 번째 글도 재미있어요!' },
    { id: 3, title: '세 번째 글', content: '세 번째 글입니다. 잘 부탁드려요!' },
    { id: 4, title: '네 번째 글', content: '네 번째 글도 열심히 작성 중입니다.' },
    { id: 5, title: '다섯 번째 글', content: '다섯 번째 글이에요. 읽어주세요!' },
    { id: 6, title: '여섯 번째 글', content: '여섯 번째 글도 기대해주세요!' },
    { id: 7, title: '일곱 번째 글', content: '일곱 번째 글입니다.' },
  ]

  return (
    <Screen className={classNames(``)}>
      <div className='w-full h-dvh flex flex-col snap-y overflow-y-scroll justify-start items-center gap-1'>
        <div
          style={{
            height: `calc(100dvh - ${NavBarHeight}px)`,
          }}
          className='w-full flex flex-col snap-start justify-start items-center pt-2 px-2 gap-1'
        >
          <StatusBar credit={DUMMY.profile.credit} />
          <ProfileCard
            id={DUMMY.profile.id}
            follower={DUMMY.profile.follower}
            following={DUMMY.profile.following}
            profileImage={DUMMY.profile.profileImage}
            name={DUMMY.profile.name}
            subname={DUMMY.profile.subname}
            description={DUMMY.profile.description}
          />
          <AliasButton text={DUMMY.profile.id} link={DUMMY.profile.link} />
        </div>
        <div className='w-full min-h-[120vw] px-2 flex flex-col snap-start justify-start items-center gap-1'>
          <PostShelves />
        </div>
      </div>
    </Screen>
  )
}
