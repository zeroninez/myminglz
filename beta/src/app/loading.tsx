import classNames from 'classnames'
import { NavBar, Screen } from '@/components'

export default function LoadingPage() {
  return <Screen className={classNames(`bg-black text-white`)}>Loading...</Screen>
}
