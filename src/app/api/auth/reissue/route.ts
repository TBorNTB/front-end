// src/app/api/auth/reissue/route.ts
// 토큰 갱신 API route
// - refreshToken 쿠키로 백엔드 /token/reissue 호출
// - 새 accessToken, refreshToken을 Set-Cookie로 전달
import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';
import { nextErrorFromBackendResponse } from '@/lib/api/route-utils';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');

    // keepSignedIn=false면 토큰 갱신 안 함
    if (cookieHeader?.includes('keepSignedIn=false')) {
      return NextResponse.json(
        { success: false, message: 'Keep signed in disabled', error: 'Keep signed in disabled' },
        { status: 401 }
      );
    }

    if (!cookieHeader?.includes('refreshToken')) {
      return NextResponse.json(
        { success: false, message: 'No refresh token', error: 'No refresh token' },
        { status: 401 }
      );
    }

    // 만료된 accessToken도 백엔드에서 필요할 수 있음
    const accessTokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

    const backendResponse = await fetch(
      `${BASE_URL}${USER_ENDPOINTS.TOKEN.REISSUE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
          Cookie: cookieHeader,
        },
      }
    );

    if (!backendResponse.ok) {
      const proxied = await nextErrorFromBackendResponse(backendResponse, 'Reissue failed');
      // Keep a stable shape for existing callers.
      const data = await proxied.clone().json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          ...(data && typeof data === 'object' ? data : null),
          message: (data as any)?.message ?? 'Reissue failed',
          error: (data as any)?.message ?? (data as any)?.error ?? 'Reissue failed',
        },
        { status: backendResponse.status }
      );
    }

    const response = NextResponse.json({ success: true });

    // 백엔드가 accessToken, refreshToken 둘 다 Set-Cookie로 보내줌
    const setCookieHeaders = backendResponse.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      response.headers.append('Set-Cookie', cookie);
    });

    return response;
  } catch (error) {
    console.error('Reissue error:', error);
    return NextResponse.json(
      { success: false, message: 'Reissue failed', error: 'Reissue failed' },
      { status: 500 }
    );
  }
}
