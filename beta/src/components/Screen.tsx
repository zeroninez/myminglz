import classNames from 'classnames'
import { Header } from '.'
import { HeaderProps } from '.'

/**
 * Screen
 * - Screen 컴포넌트는 화면 전체를 차지하는 컴포넌트입니다.
 * @param {string} header
 * @param {boolean} nav
 * @param {ReactNode} children
 * @returns {ReactNode}
 * @example
 * <Screen>
 *  <div>Content</div>
 * </Screen>
 * @example
 * <Screen nav>
 *  <div>Content</div>
 * </Screen>
 * @example
 * <Screen header={{ title: "제목" }}>
 * <div>Content</div>
 * </Screen>
 */

export interface ScreenProps {
  header?: HeaderProps
  nav?: boolean
  isFixed?: boolean
  children: React.ReactNode
  className?: string
}

export const Screen = ({ header, nav, isFixed, children, className, ...rest }: ScreenProps) => {
  const baseScreenClasses = 'w-full h-dvh'

  return (
    <div
      className={classNames(
        baseScreenClasses,
        header ? `pt-safe-offset-10` : ``,
        nav ? `` : `pb-safe`,
        isFixed ? `overflow-y-hidden` : `overflow-y-scroll`,
        className ? className : `bg-transparent`,
      )}
      {...rest}
    >
      {header && <Header title={header.title} left={header.left} right={header.right} />}
      {children}
    </div>
  )
}
