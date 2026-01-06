// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode, newPassword } = body;

    if (
      !email ||
      !verificationCode ||
      verificationCode.length !== 8 ||
      !newPassword ||
      newPassword.length < 6
    ) {
      return NextResponse.json(
        { message: '모든 필수 필드를 올바르게 입력해주세요.' },
        { status: 400 }
      );
    }

    // Get cookie header from incoming request
    const cookieHeader = request.headers.get('cookie');

    // Call backend API directly
    const response = await fetch(`${BASE_URL}${USER_ENDPOINTS.USER.RESET_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify({ 
        email, 
        randomCode: verificationCode, 
        newPassword 
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || data.error || '비밀번호 재설정에 실패했습니다.' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: '비밀번호가 성공적으로 재설정되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
