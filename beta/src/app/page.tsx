'use client'

import classNames from 'classnames'
import { Screen } from '@/components'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return <Screen className={classNames(`bg-gradient-to-b from-[#FFFAF5] to-[#FFF1E5]`)}>hello</Screen>
}
