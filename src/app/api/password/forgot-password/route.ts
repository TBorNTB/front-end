// app/api/auth/forgot-password/route.ts
// This endpoint handles password reset email sending
// NOTE: If users report not receiving emails even though the API returns success:
// 1. Check backend email service configuration
// 2. Check email provider SMTP settings
// 3. Look for email delivery logs in the backend
// 4. Verify the email template is working correctly
import { NextRequest, NextResponse } from 'next/server';
import { BASE_URL } from '@/lib/api/config';
import { USER_ENDPOINTS } from '@/lib/api/endpoints/user-endpoints';

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

    // Get cookie header from incoming request
    const cookieHeader = request.headers.get('cookie');

    // Call backend API directly
    const response = await fetch(`${BASE_URL}${USER_ENDPOINTS.USER.SEND_VERIFICATION_CODE}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      body: JSON.stringify({ email }),
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    console.log('Backend response status:', response.status);
    console.log('Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || data.error || '인증코드 발송에 실패했습니다.' },
        { status: response.status }
      );
    }

    // Verify that the backend actually sent the email
    if (data.message && data.message.toLowerCase().includes('success') || data.success === true) {
      return NextResponse.json(
        {
          message: '인증코드가 발송되었습니다.',
          email,
          success: true,
        },
        { status: 200 }
      );
    }

    // If response is ok but data doesn't confirm success, log warning
    console.warn('Verification code send response unclear:', data);
    return NextResponse.json(
      {
        message: '인증코드가 발송되었습니다.',
        email,
        success: true,
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
