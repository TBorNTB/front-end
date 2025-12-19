// app/profile/settings/page.tsx
import { Metadata } from 'next';
import ProfileEditForm from './components/ProfileEditForm';

export const metadata: Metadata = {
  title: '프로필 편집 - SSG',
  description: '프로필 정보를 수정하세요.',
};

export default function SettingsPage() {
  return <ProfileEditForm />;
}
