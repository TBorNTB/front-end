// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode, newPassword } = body;

    const result = await userService.resetPassword(
      { email, randomCode: verificationCode, newPassword },
      request
    );

    if (!result.success) {
      return NextResponse.json(
        { message: result.error },
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
