import Logo from '@/svgs/logo.svg'

/**
 * Loading
 * - Loading 컴포넌트는 로딩 중일 때 사용하는 컴포넌트입니다.
 * @param {number} size
 * @returns {ReactNode}
 * @example
 * <Loading size={48} />
 * @example
 * <Loading />
 **/

interface LoadingProps {
  size?: number
  text?: string
}

export const Loading = ({ size, text }: LoadingProps) => {
  size = size || 48

  return (
    <div className='w-fit h-fit flex flex-col justify-center items-center'>
      <div style={{ width: size, height: size }} className='flex flex-row items-end justify-center'>
        <Logo className='w-full h-full text-primary-300' />
      </div>
      {text && <p className='text-center text-grayText text-xs mt-2'>{text || '불러오는중...'}</p>}
    </div>
  )
}
