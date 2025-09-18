'use client'

import classNames from 'classnames'
import { Map, Screen } from '@/components'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  return (
    <Screen className={classNames(``)}>
      <Map
        style={{ flex: 1 }}
        defaultCenter={null}
        defaultZoom={10}
        gestureHandling='greedy'
        disableDefaultUI={true}
      ></Map>
    </Screen>
  )
}
