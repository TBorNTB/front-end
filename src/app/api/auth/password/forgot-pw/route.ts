// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/api/services/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { message: '올바른 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await userService.sendVerificationCode({ email }, request);

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || '인증코드 발송에 실패했습니다.' },
        { status: result.status }
      );
    }

    return NextResponse.json(
      { 
        message: '인증코드가 발송되었습니다.', 
        email 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
