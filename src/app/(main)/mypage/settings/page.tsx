// app/profile/settings/page.tsx
import { Metadata } from 'next';
import RoleRequestForm from './_components/RoleRequestForm';

export const metadata: Metadata = {
  title: '권한 요청 - SSG',
  description: '사용자 권한을 요청하세요.',
};

export default function SettingsPage() {
  return <RoleRequestForm />;
}
