// app/api/auth/verify-code/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode } = body;

    if (!email || !verificationCode || verificationCode.length !== 8) {
      return NextResponse.json(
        { message: '이메일과 8자리 인증코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    // Get cookie header from incoming request
    const cookieHeader = request.headers.get('cookie');

    // Call backend API to verify the code
    const response = await fetch(`${BASE_URL}${USER_ENDPOINTS.USER.VERIFY_CODE}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify({ 
        email, 
        randomCode: verificationCode 
      }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || data.error || '인증코드가 올바르지 않습니다.' },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: '인증코드가 확인되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify code API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
