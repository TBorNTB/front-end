// src/app/api/auth/user/route.ts
// 인증 실패 시 401 반환 → fetchWithRefresh가 reissue 시도
import { serverApiClient } from '@/lib/api/client-server';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader?.includes('accessToken')) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const profileResponse = await serverApiClient.request(
      USER_ENDPOINTS.USER.PROFILE,
      { request }
    );

    if (!profileResponse.success) {
      // 백엔드 401/403이면 그대로 전달 → fetchWithRefresh가 reissue 시도
      const status = profileResponse.status === 401 || profileResponse.status === 403
        ? profileResponse.status
        : 401;
      return NextResponse.json({ authenticated: false, user: null }, { status });
    }

    const profile = profileResponse.data as {
      nickname?: string;
      username?: string;
      email?: string;
      realName?: string;
      fullName?: string;
      profileImageUrl?: string;
      profileImage?: string;
      role?: string;
    };

    return NextResponse.json({
      authenticated: true,
      user: {
        nickname: profile.nickname || profile.username,
        email: profile.email,
        realName: profile.realName || profile.fullName || profile.nickname,
        profileImageUrl: profile.profileImageUrl || profile.profileImage,
        role: profile.role,
      }
    });

  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
