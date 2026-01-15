// src/app/api/auth/login/route.ts
// 로그인 API route
// - keepSignedIn을 쿠키로 저장 (서버에서 토큰 갱신 여부 판단용)
import { NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keepSignedIn } = body;

    const backendResponse = await fetch(
      `${BASE_URL}${USER_ENDPOINTS.USER.LOGIN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(body), // 원본 body 그대로 전달
      }
    );

    const data = await backendResponse.json();
    const response = NextResponse.json(data, { status: backendResponse.status });

    // 백엔드가 토큰을 body로 보내줌 → 쿠키로 설정
    if (backendResponse.ok && data.accessToken) {
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/',
      };

      response.cookies.set('accessToken', data.accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60, // 1시간 (백엔드 만료시간에 맞춰서 조정)
      });

      if (data.refreshToken) {
        response.cookies.set('refreshToken', data.refreshToken, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 7, // 7일
        });
      }

      response.cookies.set('keepSignedIn', keepSignedIn ? 'true' : 'false', {
        ...cookieOptions,
        maxAge: keepSignedIn ? 60 * 60 * 24 * 30 : undefined, // 30일 or 세션
      });
    }

    return response;

  } catch (error) {
    console.error("Login API route error:", error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
