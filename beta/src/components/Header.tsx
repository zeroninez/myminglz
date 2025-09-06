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
    onClick?: () => void
  }
  right?: {
    icon?: string
    text?: string
    onClick?: () => void
  }
}

export const Header = ({ title, left, right }: HeaderProps) => {
  const baseHeaderClasses = 'w-full h-fit pt-0 pb-4 pl-4 pr-4 flex flex-row items-center relative'
  const titleClasses = 'absolute top-0.5 right-0 w-fit h-fit text-lg left-1/2 transform -translate-x-1/2'
  const leftHeaderClasses = 'justify-start'
  const rightHeaderClasses = 'justify-end'
  const bothHeaderClasses = 'justify-between'
  const actionButtonClasses = 'flex flex-row space-x-2 w-fit justify-center items-center active:text-primary-300'

  return (
    <div
      className={classNames(
        'fixed z-10 top-0 pt-safe left-0 w-screen h-fit text-white bg-white bg-opacity-10 backdrop-blur-md',
      )}
    >
      <div
        className={classNames(
          baseHeaderClasses,
          left && right && bothHeaderClasses,
          left && !right && leftHeaderClasses,
          !left && right && rightHeaderClasses,
        )}
      >
        {left && (
          <div className={actionButtonClasses} onClick={left.onClick}>
            {left.icon && <Icon icon={left.icon} />}
            {left.text && <div>{left.text}</div>}
          </div>
        )}
        {title && <div className={titleClasses}>{title}</div>}
        {right && (
          <div className={actionButtonClasses} onClick={right.onClick}>
            {left.icon && <Icon icon={right.icon} />}
            {left.text && <div>{right.text}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
