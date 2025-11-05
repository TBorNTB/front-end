// app/profile/settings/page.tsx
import { Metadata } from 'next';
import SettingsContent from './components/SettingsContent';

export const metadata: Metadata = {
  title: '계정 설정 - SSG',
  description: '개인 정보, 비밀번호, 알림 설정 등을 관리하세요.',
};

export default function SettingsPage() {
  return <SettingsContent />;
}
