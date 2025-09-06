'use client'

import React from 'react'
import classNames from 'classnames'
import { Icon } from './Icon'
import { motion } from 'framer-motion'

/**
 * Button
 * - Button 컴포넌트는 버튼을 렌더링합니다.
 * @param {ReactNode} children
 * @param {string} preset
 * @param {string} className
 * @param {boolean} disabled
 * @param {function} onClick
 * @returns {ReactNode}
 * @example
 * <Button
 * preset="default"
 * onClick={() => alert("버튼1을 눌렀습니다!")}
 * >
 * 버튼1
 * </Button>
 **/

interface ButtonProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  width?: string
  borderRadius?: string
  preset?: 'default' | 'line' | 'text' | 'blur' | 'secondary' | 'disabled' | 'special' | 'black' | 'white'
  overwriteClassName?: string
  icon?: string
  className?: string
  disabled?: boolean
  onClick?: () => void
  initial?: any
  animate?: any
  exit?: any
  id?: string
}

export const Button = ({
  children,
  size = 'lg',
  width,
  borderRadius,
  preset = 'default',
  overwriteClassName,
  icon,
  className,
  disabled,
  onClick,
  initial,
  animate,
  exit,
  id,
  ...rest
}: ButtonProps) => {
  const baseButtonClasses =
    'min-w-fit font-semibold flex flex-row justify-center items-center overflow-hidden transition-all duration-200 active:scale-95'

  const presetClasses = {
    default: 'bg-primary-400 text-black  active:bg-primary-200',
    line: 'border border-gray-500 text-gray-300 active:bg-gray-200 active:text-black',
    text: 'text-gray-900 active:border active:border-gray-500',
    blur: 'bg-[#8F8F8F] bg-opacity-50 border border-trueGray-100/20 backdrop-blur-md text-white active:backdrop-blur-none active:bg-opacity-100',
    secondary: 'bg-gray-500 text-white active:bg-gray-200 active:text-gray-700',
    disabled: 'bg-primary-100 opacity-50 text-black cursor-not-allowed',
    special: 'bg-primary-gradient text-black border-lime-200 border active:text-white',
    black: 'bg-black text-white active:bg-gray-800',
    white: 'bg-white text-black active:bg-gray-200',
  }

  const heightClasses = {
    sm: 'min-h-[32px]', // h-[32px]
    md: 'min-h-[42px]', // h-[42px]
    lg: 'min-h-[64px]', // h-[64px]
  }

  const paddingClasses = {
    sm: ['px-[18px] py-1.5', 'pl-[12px] pr-[18px] py-1.5'],
    md: ['px-[24px] py-2.5', 'pl-[16px] pr-[24px] py-2.5'],
    lg: ['px-[24px] py-2.5', 'pl-[16px] pr-[24px] py-2.5'],
  }

  const borderRadiusClasses = {
    sm: 'rounded-[14px]',
    md: 'rounded-[22px]',
    lg: 'rounded-[28px]',
  }

  const textClasses = {
    sm: 'text-sm leading-4 font-semibold',
    md: 'text-lg leading-7 font-semibold',
    lg: 'text-lg leading-7 font-semibold',
  }

  const iconSize = {
    sm: 18,
    md: 24,
    lg: 24,
  }

  return (
    <motion.button
      initial={initial}
      animate={animate}
      exit={exit}
      id={id}
      suppressHydrationWarning
      className={classNames(
        baseButtonClasses,
        className ? className : presetClasses[disabled ? 'disabled' : preset],
        width ? width : size === 'lg' ? 'w-full' : 'w-fit',
        borderRadius ? borderRadius : borderRadiusClasses[size],
        heightClasses[size],
        !icon ? paddingClasses[size][0] : paddingClasses[size][1],
        textClasses[size],
        overwriteClassName && overwriteClassName,
      )}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      <label className=' h-fit text-center flex flex-row justify-center items-center  gap-2'>
        {icon && (
          <Icon
            icon={icon}
            className={classNames(preset === 'secondary' && 'text-gray-400')}
            size={iconSize[size]}
            motion={false}
          />
        )}
        {children}
      </label>
    </motion.button>
  )
}
