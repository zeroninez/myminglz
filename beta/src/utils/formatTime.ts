// 시간 변환 함수
function formatTime(time: number) {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  // 초가 10 미만일 경우 앞에 0을 추가하여 2자리로 맞춤
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds
  return `${minutes}:${formattedSeconds}`
}

export { formatTime }
