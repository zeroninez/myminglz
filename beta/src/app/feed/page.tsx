'use client'

import classNames from 'classnames'
import { NavBar, Screen } from '@/components'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return <Screen className={classNames(`bg-white`)}>feed</Screen>
}
