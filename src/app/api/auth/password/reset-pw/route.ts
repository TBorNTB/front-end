// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/api/services/user-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode, newPassword } = body;

    // Basic validation
    if (!email || !verificationCode || verificationCode.length !== 8 || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: '모든 필수 필드를 올바르게 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await userService.resetPassword(
      { 
        email, 
        randomCode: verificationCode, 
        newPassword 
      },
      request
    );

    if (!result.success) {
      return NextResponse.json(
        { message: result.error || '비밀번호 재설정에 실패했습니다.' },
        { status: result.status }
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
