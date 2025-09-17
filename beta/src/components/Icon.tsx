import React from 'react'
import classNames from 'classnames'
import type { HTMLAttributes } from 'react'
import { createElement } from 'react'
import map from '@/svgs/icons/map.svg'
import feed from '@/svgs/icons/feed.svg'
import add from '@/svgs/icons/add.svg'
import profile from '@/svgs/icons/profile.svg'
import star from '@/svgs/icons/star.svg'
import down from '@/svgs/icons/down.svg'
import plus from '@/svgs/icons/plus.svg'
import alias from '@/svgs/icons/alias.svg'
import category from '@/svgs/icons/category.svg'
import folder from '@/svgs/icons/folder.svg'
import user from '@/svgs/icons/user.svg'
import bookmark from '@/svgs/icons/bookmark.svg'

export const icons = {
  map,
  feed,
  add,
  profile,
  star,
  down,
  plus,
  alias,
  category,
  folder,
  user,
  bookmark,
}

interface IconProps {
  icon: string
  color?: string
  size?: number
  className?: string
  motion?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export const Icon = ({ icon, color, size = 24, className, onClick, motion = true, ...rest }: IconProps) => {
  const baseIconClasses = ' flex items-center justify-center cursor-pointer '

  if (!icons[icon]) return null

  return (
    <div
      aria-label={icon}
      className={classNames(
        baseIconClasses,
        motion ? 'transition-all duration-200 ease-in-out focus:opacity-50 active:opacity-50 active:scale-90' : '',
      )}
      onClick={onClick}
      {...rest}
    >
      {createElement(icons[icon], {
        style: {
          width: size.toString(),
        },
        className: className,
      })}
    </div>
  )

  // return (
  //   <div className={classNames(baseIconClasses)} onClick={onClick} {...rest}>
  //     <IconContext.Provider
  //       value={{
  //         color,
  //         size: size.toString(),
  //         className: className,
  //       }}
  //     >
  //       <IconComponent />
  //     </IconContext.Provider>
  //   </div>
  // )
}
