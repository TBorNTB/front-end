// app/profile/activity/page.tsx
import { Metadata } from 'next';
import ActivityContent from './components/ActivityContent';

export const metadata: Metadata = {
  title: '나의 활동 - SSG',
  description: '내가 참여한 프로젝트, 작성한 글, 댓글 등 모든 활동 내역을 확인하세요.',
};

export default function ActivityPage() {
  return <ActivityContent />;
}
