import { redirect } from 'next/navigation'

// 포스트 작성은 바텀시트로 이전됨 — NavBar의 발행 버튼 또는 ?post=1 쿼리 사용
export default function PostPage() {
  redirect('/map?post=1')
}
