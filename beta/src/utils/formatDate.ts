// 날짜 변환 유틸리티 함수
// input: '2021-08-01T00:00:00.000Z'
// output: '2021.08.01'
function formatDate(dateString: string) {
  const dateObj = new Date(dateString)

  return dateObj
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\. /g, '.')
    .slice(0, -1) // 마지막 마침표 제거
}

export { formatDate }
