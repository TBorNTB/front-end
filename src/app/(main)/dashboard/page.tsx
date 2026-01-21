// app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserApiUrl, USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';
import { type UserResponse } from '@/lib/api/services/user-services';

async function getCurrentUser() {
  const cookieStore = cookies();
  const cookieString = cookieStore.toString();

  if (!cookieString.includes('accessToken')) {
    redirect('/login'); // ✅ Protected route
  }

  const url = getUserApiUrl(USER_ENDPOINTS.USER.PROFILE);
  const response = await fetch(url, {
    headers: {
      Cookie: cookieString, // ✅ Forward all cookies!
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 401) redirect('/login');
    throw new Error('Failed to fetch user');
  }

  return response.json() as Promise<UserResponse>;
}

export default async function Dashboard() {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">대시보드</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2>환영합니다, {user.nickname}!</h2>
        <p>Role: {user.role}</p>
        <p>Email: {user.email}</p>
      </div>
    </div>
  );
}
