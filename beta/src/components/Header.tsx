import classNames from 'classnames'
import { Icon } from './Icon'

/**
 * Header
 * - Header 컴포넌트는 상단 헤더를 렌더링합니다.
 * @param {string} title
 * @param {Object} left
 * @param {Object} right
 * @param {string} left.icon
 * @param {string} left.text
 * @param {Function} left.onClick
 * @param {string} right.icon
 * @param {string} right.text
 * @param {Function} right.onClick
 * @returns {ReactNode}
 * @returns {ReactNode}
 * @example
 * <Header title="Showroom" />
 * @example
 * <Screen
      header={{
        title: "Showroom",
        left: {
          icon: "left",
          text: "Home",
          onClick: () => router.push("/"),
        },
        right: {
          icon: "search",
          text: "Search",
          onClick: () => alert("검색 버튼을 눌렀습니다!"),
        },
      }}
    >
 */

export interface HeaderProps {
  title?: string
  left?: {
    icon?: string
    text?: string
    className?: string
    onClick?: () => void
  }
  right?: {
    icon?: string
    text?: string
    className?: string
    onClick?: () => void
  }
}

export const Header = ({ title, left, right }: HeaderProps) => {
  const baseHeaderClasses = 'w-full h-14 py-4 px-4 flex flex-row items-center relative'
  const titleClasses =
    'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 leading-none w-fit h-fit text-lg font-medium'
  const leftHeaderClasses = 'justify-start leading-none'
  const rightHeaderClasses = 'justify-end leading-none'
  const bothHeaderClasses = 'justify-between leading-none'
  const actionButtonClasses =
    'flex flex-row space-x-2 w-fit justify-center items-center active:text-primary-300 leading-none'

  return (
    <div className={classNames('fixed z-10 top-0 pt-safe left-0 w-screen h-fit text-white', '')}>
      <div
        className={classNames(
          baseHeaderClasses,
          left && right && bothHeaderClasses,
          left && !right && leftHeaderClasses,
          !left && right && rightHeaderClasses,
        )}
      >
        {left && (
          <div className={classNames(actionButtonClasses, left.className)} onClick={left.onClick}>
            {left.icon && <Icon icon={left.icon} />}
            {left.text && <div>{left.text}</div>}
          </div>
        )}
        {title && <div className={titleClasses}>{title}</div>}
        {right && (
          <div className={classNames(actionButtonClasses, right.className)} onClick={right.onClick}>
            {right.icon && <Icon icon={right.icon} />}
            {right.text && <div>{right.text}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
