// src/app/api/auth/user/route.ts
import { NextResponse } from 'next/server';
import { getUserApiUrl, USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints'; // ✅ Use your endpoints!
import { serverApiClient } from '@/lib/api/client-server';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader?.includes('accessToken')) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // Parallel profile + role calls (faster!)
    const [profileRes, roleRes] = await Promise.allSettled([
      serverApiClient.request(getUserApiUrl(USER_ENDPOINTS.USER.PROFILE), { request }),
      serverApiClient.request(getUserApiUrl(USER_ENDPOINTS.USER.ROLE), { request }),
    ]);

    if (profileRes.status === 'rejected' || !profileRes.value?.success) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const profile = profileRes.value.data;
    const role = roleRes.status === 'fulfilled' && roleRes.value.success ? roleRes.value.data?.role : profile.role;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: profile.id,
        nickname: profile.nickname || profile.username,
        role, // ✅ roleData > profile.role priority
        email: profile.email,
        // ... rest
      },
    });

  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
