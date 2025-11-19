// app/profile/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '내 프로필 - SSG',
  description: 'SSG 멤버 프로필 정보와 활동 통계를 확인하세요.',
};

// Import the actual content component
import ProfileContent from './_components/ProfileOverview';

export default function ProfilePage() {
  return <ProfileContent />;
}
