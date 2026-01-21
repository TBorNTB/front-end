// app/profile/badges/page.tsx
import { Metadata } from 'next';
import BadgesList from './components/BadgesList';

export const metadata: Metadata = {
  title: '활동 배지',
  description: 'SSG 커뮤니티 활동으로 획득한 배지와 진행 중인 도전과제를 확인하세요.',
};

export default function BadgesPage() {
  return <BadgesList />;
}
