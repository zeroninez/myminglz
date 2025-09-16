import classNames from 'classnames'
import { NavBar, Screen } from '@/components'

export default function LoadingPage() {
  return <Screen className={classNames(`bg-white/30 text-black`)}>Loading...</Screen>
}
